use anyhow::Result;
use std::collections::HashMap;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{info, warn, error};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum SidecarName {
    GitEngine,
    Arsy,
    Legend,
    PocketBase,
    Radius,
}

impl SidecarName {
    pub fn as_str(&self) -> &str {
        match self {
            SidecarName::GitEngine => "git-engine",
            SidecarName::Arsy => "arsy",
            SidecarName::Legend => "legend",
            SidecarName::PocketBase => "pocketbase",
            SidecarName::Radius => "radius",
        }
    }

    pub fn binary_name(&self) -> &str {
        match self {
            SidecarName::GitEngine => "git-engine.exe",
            SidecarName::Arsy => "arsy.exe",
            SidecarName::Legend => "legend.exe",
            SidecarName::PocketBase => "pocketbase.exe",
            SidecarName::Radius => "radius.exe",
        }
    }

    pub fn default_port(&self) -> u16 {
        match self {
            SidecarName::GitEngine => 3200,
            SidecarName::Arsy => 4000,
            SidecarName::Legend => 8092,
            SidecarName::PocketBase => 8091,
            SidecarName::Radius => 1812,
        }
    }

    pub fn health_path(&self) -> &str {
        "/healthz"
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct HealthStatus {
    pub name: String,
    pub healthy: bool,
    pub port: u16,
    pub pid: Option<u32>,
    pub uptime_seconds: Option<u64>,
    pub last_check: chrono::DateTime<chrono::Utc>,
    pub error: Option<String>,
}

#[derive(Debug)]
struct SidecarProcess {
    child: Option<Child>,
    port: u16,
    start_time: chrono::DateTime<chrono::Utc>,
    restart_count: u32,
    last_restart: Option<chrono::DateTime<chrono::Utc>>,
}

pub struct SidecarManager {
    processes: Arc<RwLock<HashMap<SidecarName, SidecarProcess>>>,
    base_bin_path: PathBuf,
    port_registry: Arc<RwLock<HashMap<SidecarName, u16>>>,
}

impl SidecarManager {
    pub fn new(base_bin_path: PathBuf) -> Self {
        Self {
            processes: Arc::new(RwLock::new(HashMap::new())),
            base_bin_path,
            port_registry: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn spawn(&self, name: SidecarName, args: Vec<String>, env: HashMap<String, String>) -> Result<u16> {
        let binary_path = self.base_bin_path.join(name.binary_name());
        if !binary_path.exists() {
            anyhow::bail!("Sidecar binary not found: {}", binary_path.display());
        }

        // Reserve port
        let port = self.reserve_port(name.clone()).await?;

        let mut cmd = Command::new(&binary_path);
        cmd.args(&args);
        cmd.env("PORT", port.to_string());
        for (k, v) in env {
            cmd.env(k, v);
        }
        cmd.stdout(Stdio::piped());
        cmd.stderr(Stdio::piped());

        info!("Spawning sidecar {} on port {}", name.as_str(), port);

        let mut child = cmd.spawn()?;
        let pid = child.id();

        // Wait for health check
        let health_url = format!("http://localhost:{}{}", port, name.health_path());
        let mut healthy = false;
        for attempt in 1..=30 {
            tokio::time::sleep(std::time::Duration::from_millis(500)).await;
            match reqwest::get(&health_url).await {
                Ok(resp) if resp.status().is_success() => {
                    healthy = true;
                    break;
                }
                Ok(_) | Err(_) => {
                    if attempt == 30 {
                        warn!("Health check failed for {} after 30 attempts", name.as_str());
                    }
                }
            }
        }

        if !healthy {
            let _ = child.kill();
            self.release_port(name.clone()).await;
            anyhow::bail!("Sidecar {} failed health check", name.as_str());
        }

        let process = SidecarProcess {
            child: Some(child),
            port,
            start_time: chrono::Utc::now(),
            restart_count: 0,
            last_restart: None,
        };

        self.processes.write().await.insert(name.clone(), process);
        info!("Sidecar {} started successfully on port {} (pid: {:?})", name.as_str(), port, pid);

        Ok(port)
    }

    pub async fn health_check(&self, name: SidecarName) -> Result<HealthStatus> {
        let processes = self.processes.read().await;
        let process = processes.get(&name);

        let (port, pid, start_time, restart_count) = match process {
            Some(p) => (p.port, p.child.as_ref().map(|c| c.id()), p.start_time, p.restart_count),
            None => return Ok(HealthStatus {
                name: name.as_str().to_string(),
                healthy: false,
                port: 0,
                pid: None,
                uptime_seconds: None,
                last_check: chrono::Utc::now(),
                error: Some("Not running".to_string()),
            }),
        };

        let health_url = format!("http://localhost:{}{}", port, name.health_path());
        let healthy = match reqwest::get(&health_url).await {
            Ok(resp) => resp.status().is_success(),
            Err(_) => false,
        };

        Ok(HealthStatus {
            name: name.as_str().to_string(),
            healthy,
            port,
            pid,
            uptime_seconds: Some((chrono::Utc::now() - start_time).num_seconds() as u64),
            last_check: chrono::Utc::now(),
            error: if healthy { None } else { Some("Health check failed".to_string()) },
        })
    }

    pub async fn shutdown(&self, name: SidecarName) -> Result<()> {
        let mut processes = self.processes.write().await;
        if let Some(mut process) = processes.remove(&name) {
            if let Some(mut child) = process.child.take() {
                info!("Shutting down sidecar {}", name.as_str());
                let _ = child.kill();
                let _ = child.wait();
            }
            self.release_port(name).await;
        }
        Ok(())
    }

    pub async fn restart(&self, name: SidecarName) -> Result<u16> {
        let port = {
            let processes = self.processes.read().await;
            processes.get(&name).map(|p| p.port)
        };

        if let Some(port) = port {
            self.shutdown(name.clone()).await?;
        }

        // Check restart rate limit
        let should_limit = {
            let processes = self.processes.read().await;
            if let Some(process) = processes.get(&name) {
                let now = chrono::Utc::now();
                if let Some(last) = process.last_restart {
                    if (now - last).num_minutes() < 1 && process.restart_count >= 3 {
                        true
                    } else {
                        false
                    }
                } else {
                    false
                }
            } else {
                false
            }
        };

        if should_limit {
            anyhow::bail!("Circuit breaker: too many restarts for {}", name.as_str());
        }

        self.spawn(name, vec![], HashMap::new()).await
    }

    pub async fn get_all_health(&self) -> Vec<HealthStatus> {
        let names = [
            SidecarName::GitEngine,
            SidecarName::Arsy,
            SidecarName::Legend,
            SidecarName::PocketBase,
            SidecarName::Radius,
        ];

        let mut results = Vec::new();
        for name in names {
            let name_str = name.as_str().to_string();
            match self.health_check(name).await {
                Ok(status) => results.push(status),
                Err(e) => results.push(HealthStatus {
                    name: name_str,
                    healthy: false,
                    port: 0,
                    pid: None,
                    uptime_seconds: None,
                    last_check: chrono::Utc::now(),
                    error: Some(e.to_string()),
                }),
            }
        }
        results
    }

    async fn reserve_port(&self, name: SidecarName) -> Result<u16> {
        let mut registry = self.port_registry.write().await;
        let mut port = name.default_port();

        // Check if port is available via TCP bind
        while !self.is_port_available(port).await {
            port += 1;
            if port > name.default_port() + 1000 {
                anyhow::bail!("No available port for {}", name.as_str());
            }
        }

        registry.insert(name, port);
        Ok(port)
    }

    async fn release_port(&self, name: SidecarName) {
        self.port_registry.write().await.remove(&name);
    }

    async fn is_port_available(&self, port: u16) -> bool {
        tokio::net::TcpListener::bind(format!("127.0.0.1:{}", port)).await.is_ok()
    }
}
