use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::State;
use crate::state::AppState;
use crate::sidecar::SidecarName;
use crate::sync::engine::SyncEngine;
use std::collections::HashMap;
use std::process::Command;
use std::sync::Arc;
use std::io::Write;
use tracing::{info, warn};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: OsInfo,
    pub cpu: CpuInfo,
    pub memory: MemoryInfo,
    pub disks: Vec<DiskInfo>,
    pub network_interfaces: Vec<NetworkInterface>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OsInfo {
    pub name: String,
    pub version: String,
    pub architecture: String,
    pub hostname: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuInfo {
    pub name: String,
    pub cores: usize,
    pub threads: usize,
    pub frequency_mhz: u64,
    pub usage_percent: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryInfo {
    pub total_bytes: u64,
    pub available_bytes: u64,
    pub used_bytes: u64,
    pub usage_percent: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_bytes: u64,
    pub available_bytes: u64,
    pub used_bytes: u64,
    pub usage_percent: f32,
    pub filesystem: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkInterface {
    pub name: String,
    pub mac_address: Option<String>,
    pub ip_addresses: Vec<String>,
    pub is_up: bool,
    pub rx_bytes: u64,
    pub tx_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum NetworkTraceType {
    Ping { count: u32, interval_ms: u64 },
    Traceroute { max_hops: u32 },
    Dns { record_type: String },
    TcpConnect { port: u16 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkTraceRequest {
    pub target: String,
    #[serde(flatten)]
    pub trace_type: NetworkTraceType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkTraceResult {
    pub target: String,
    pub trace_type: String,
    pub success: bool,
    pub duration_ms: u64,
    pub output: String,
    pub hops: Option<Vec<TracerouteHop>>,
    pub dns_records: Option<Vec<DnsRecord>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TracerouteHop {
    pub hop: u32,
    pub ip: Option<String>,
    pub hostname: Option<String>,
    pub rtt_ms: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DnsRecord {
    pub record_type: String,
    pub value: String,
    pub ttl: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SidecarLogEntry {
    pub timestamp: String,
    pub level: String,
    pub message: String,
    pub service: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbStats {
    pub total_size_bytes: u64,
    pub table_count: u32,
    pub tables: Vec<TableStats>,
    pub index_count: u32,
    pub indexes: Vec<IndexStats>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableStats {
    pub name: String,
    pub row_count: u64,
    pub size_bytes: u64,
    pub indexes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexStats {
    pub name: String,
    pub table: String,
    pub columns: Vec<String>,
    pub unique: bool,
    pub size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncStatus {
    pub running: bool,
    pub pending_operations: u64,
    pub conflicts: u64,
    pub last_sync_time: Option<String>,
    pub last_sync_duration_ms: Option<u64>,
    pub queue_depth: u64,
    pub tables: Vec<TableSyncStatus>,
    pub bandwidth_kbps: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableSyncStatus {
    pub table_name: String,
    pub pending: u64,
    pub synced: u64,
    pub conflicts: u64,
    pub last_sync: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticBundle {
    pub timestamp: String,
    pub system_info: SystemInfo,
    pub db_stats: DbStats,
    pub sync_status: SyncStatus,
    pub sidecar_health: Vec<Value>,
    pub logs: HashMap<String, Vec<SidecarLogEntry>>,
}

#[tauri::command]
pub async fn diag_system_info(
    _state: State<'_, AppState>,
) -> Result<SystemInfo, String> {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();
    
    let os_info = OsInfo {
        name: sysinfo::System::name().unwrap_or("Unknown".to_string()),
        version: sysinfo::System::os_version().unwrap_or("Unknown".to_string()),
        architecture: std::env::consts::ARCH.to_string(),
        hostname: sysinfo::System::host_name().unwrap_or("Unknown".to_string()),
    };
    
    let cpu = sys.cpus().first();
    let cpu_info = CpuInfo {
        name: cpu.map(|c| c.brand().to_string()).unwrap_or("Unknown".to_string()),
        cores: sys.physical_core_count().unwrap_or(0),
        threads: sys.cpus().len(),
        frequency_mhz: cpu.map(|c| c.frequency()).unwrap_or(0),
        usage_percent: cpu.map(|c| c.cpu_usage()).unwrap_or(0.0),
    };
    
    let memory_info = MemoryInfo {
        total_bytes: sys.total_memory(),
        available_bytes: sys.available_memory(),
        used_bytes: sys.used_memory(),
        usage_percent: if sys.total_memory() > 0 {
            (sys.used_memory() as f32 / sys.total_memory() as f32) * 100.0
        } else {
            0.0
        },
    };
    
    let mut disks = Vec::new();
    let disks_info = sysinfo::Disks::new_with_refreshed_list();
    for disk in disks_info.iter() {
        let total = disk.total_space();
        let available = disk.available_space();
        let used = total.saturating_sub(available);
        disks.push(DiskInfo {
            name: disk.name().to_string_lossy().to_string(),
            mount_point: disk.mount_point().to_string_lossy().to_string(),
            total_bytes: total,
            available_bytes: available,
            used_bytes: used,
            usage_percent: if total > 0 { (used as f32 / total as f32) * 100.0 } else { 0.0 },
            filesystem: disk.file_system().to_string_lossy().to_string(),
        });
    }
    
    let mut network_interfaces = Vec::new();
    let networks = sysinfo::Networks::new_with_refreshed_list();
    for (name, data) in networks.iter() {
        let mac = data.mac_address();
        let mac_str = if mac.0.iter().all(|&b| b == 0) {
            None
        } else {
            Some(format!("{:02x}:{:02x}:{:02x}:{:02x}:{:02x}:{:02x}", 
                mac.0[0], mac.0[1], mac.0[2], mac.0[3], mac.0[4], mac.0[5]))
        };
        network_interfaces.push(NetworkInterface {
            name: name.to_string(),
            mac_address: mac_str,
            ip_addresses: Vec::new(),
            is_up: true,
            rx_bytes: data.received(),
            tx_bytes: data.transmitted(),
        });
    }
    
    Ok(SystemInfo {
        os: os_info,
        cpu: cpu_info,
        memory: memory_info,
        disks,
        network_interfaces,
    })
}

#[tauri::command]
pub async fn diag_network_trace(
    request: NetworkTraceRequest,
    _state: State<'_, AppState>,
) -> Result<NetworkTraceResult, String> {
    let start = std::time::Instant::now();
    let target = request.target.clone();
    
    match request.trace_type {
        NetworkTraceType::Ping { count, interval_ms: _ } => {
            let output = if cfg!(target_os = "windows") {
                Command::new("ping")
                    .args(["-n", &count.to_string(), &target])
                    .output()
                    .map_err(|e| e.to_string())?
            } else {
                Command::new("ping")
                    .args(["-c", &count.to_string(), &target])
                    .output()
                    .map_err(|e| e.to_string())?
            };
            
            Ok(NetworkTraceResult {
                target,
                trace_type: "ping".to_string(),
                success: output.status.success(),
                duration_ms: start.elapsed().as_millis() as u64,
                output: String::from_utf8_lossy(&output.stdout).to_string(),
                hops: None,
                dns_records: None,
            })
        }
        NetworkTraceType::Traceroute { max_hops } => {
            let output = if cfg!(target_os = "windows") {
                Command::new("tracert")
                    .args(["-h", &max_hops.to_string(), &target])
                    .output()
                    .map_err(|e| e.to_string())?
            } else {
                Command::new("traceroute")
                    .args(["-m", &max_hops.to_string(), &target])
                    .output()
                    .map_err(|e| e.to_string())?
            };
            
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let hops = parse_traceroute_output(&stdout);
            
            Ok(NetworkTraceResult {
                target,
                trace_type: "traceroute".to_string(),
                success: output.status.success(),
                duration_ms: start.elapsed().as_millis() as u64,
                output: stdout,
                hops: Some(hops),
                dns_records: None,
            })
        }
        NetworkTraceType::Dns { record_type } => {
            let output = if cfg!(target_os = "windows") {
                let args = vec!["-type=".to_string() + &record_type, target.clone()];
                Command::new("nslookup")
                    .args(&args)
                    .output()
                    .map_err(|e| e.to_string())?
            } else {
                Command::new("dig")
                    .args([&record_type, &target, "+short"])
                    .output()
                    .map_err(|e| e.to_string())?
            };
            
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let dns_records = parse_dns_output(&stdout, &record_type);
            
            Ok(NetworkTraceResult {
                target,
                trace_type: "dns".to_string(),
                success: output.status.success(),
                duration_ms: start.elapsed().as_millis() as u64,
                output: stdout,
                hops: None,
                dns_records: Some(dns_records),
            })
        }
        NetworkTraceType::TcpConnect { port } => {
            let addr = format!("{}:{}", target, port);
            let start = std::time::Instant::now();
            let result = tokio::net::TcpStream::connect(&addr).await;
            let duration = start.elapsed().as_millis() as u64;
            
            match result {
                Ok(_) => Ok(NetworkTraceResult {
                    target: addr.clone(),
                    trace_type: "tcp_connect".to_string(),
                    success: true,
                    duration_ms: duration,
                    output: format!("Connection to {} succeeded in {}ms", addr, duration),
                    hops: None,
                    dns_records: None,
                }),
                Err(e) => Ok(NetworkTraceResult {
                    target: addr.clone(),
                    trace_type: "tcp_connect".to_string(),
                    success: false,
                    duration_ms: duration,
                    output: format!("Connection to {} failed: {}", addr, e),
                    hops: None,
                    dns_records: None,
                }),
            }
        }
    }
}

fn parse_traceroute_output(output: &str) -> Vec<TracerouteHop> {
    let mut hops = Vec::new();
    for line in output.lines().skip(1) {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 {
            if let Ok(hop) = parts[0].parse::<u32>() {
                let ip = if parts[1] != "*" { Some(parts[1].to_string()) } else { None };
                let rtt = parts.get(2).and_then(|s| s.trim_end_matches("ms").parse::<f64>().ok());
                hops.push(TracerouteHop { hop, ip, hostname: None, rtt_ms: rtt });
            }
        }
    }
    hops
}

fn parse_dns_output(output: &str, record_type: &str) -> Vec<DnsRecord> {
    let mut records = Vec::new();
    for line in output.lines() {
        let line = line.trim();
        if !line.is_empty() && !line.starts_with(";") && !line.starts_with("Server:") && !line.starts_with("Address:") {
            records.push(DnsRecord {
                record_type: record_type.to_string(),
                value: line.to_string(),
                ttl: 0,
            });
        }
    }
    records
}

#[tauri::command]
pub async fn diag_sidecar_logs(
    name: String,
    since: Option<String>,
    state: State<'_, AppState>,
) -> Result<Vec<SidecarLogEntry>, String> {
    let sidecar_name = match name.as_str() {
        "git-engine" => SidecarName::GitEngine,
        "arsy" => SidecarName::Arsy,
        "legend" => SidecarName::Legend,
        "pocketbase" => SidecarName::PocketBase,
        "radius" => SidecarName::Radius,
        _ => return Err(format!("Unknown sidecar: {}", name)),
    };
    
    let health = state.sidecar_manager.health_check(sidecar_name).await.map_err(|e| e.to_string())?;
    
    // Read from sidecar log file if it exists
    let log_path = std::env::temp_dir().join(format!("sovereign-{}.log", name));
    let mut logs = Vec::new();
    
    if log_path.exists() {
        let content = std::fs::read_to_string(&log_path).map_err(|e| e.to_string())?;
        for line in content.lines() {
            if let Ok(entry) = serde_json::from_str::<SidecarLogEntry>(line) {
                if let Some(since_str) = &since {
                    if entry.timestamp >= *since_str {
                        logs.push(entry);
                    }
                } else {
                    logs.push(entry);
                }
            }
        }
    }
    
    // If no logs from file, return at least the health status as a log entry
    if logs.is_empty() {
        logs.push(SidecarLogEntry {
            timestamp: chrono::Utc::now().to_rfc3339(),
            level: if health.healthy { "info" } else { "error" }.to_string(),
            message: format!("Sidecar {} status: {}", name, if health.healthy { "healthy" } else { "unhealthy" }),
            service: name,
        });
    }
    
    Ok(logs)
}

#[tauri::command]
pub async fn diag_db_stats(
    state: State<'_, AppState>,
) -> Result<DbStats, String> {
    let db = &state.db;
    
    // Get table stats
    let mut resp = db.query("INFO FOR DB").await.map_err(|e| e.to_string())?;
    let db_info: Option<Value> = resp.take(0).unwrap_or(None);
    
    let total_size = db_info.as_ref()
        .and_then(|v| v.get("size"))
        .and_then(|v| v.as_u64())
        .unwrap_or(0);
    
    // Get tables
    let mut resp = db.query("SELECT * FROM table_names()").await.map_err(|e| e.to_string())?;
    let tables_raw: Vec<Value> = resp.take(0).unwrap_or_default();
    
    let mut table_stats = Vec::new();
    
    for table_raw in tables_raw {
        if let Some(table_name) = table_raw.get("tb").or_else(|| table_raw.get("name")).and_then(|v| v.as_str()) {
            let mut resp = db.query(format!("SELECT count() FROM {}", table_name)).await.map_err(|e| e.to_string())?;
            let count: u64 = resp.take::<Option<u64>>(0).ok().flatten().unwrap_or(0);
            
            // Get table size estimate
            let mut resp = db.query(format!("INFO FOR TABLE {}", table_name)).await.map_err(|e| e.to_string())?;
            let table_info: Option<Value> = resp.take(0).unwrap_or(None);
            let size = table_info.as_ref()
                .and_then(|v| v.get("size"))
                .and_then(|v| v.as_u64())
                .unwrap_or(0);
            
            table_stats.push(TableStats {
                name: table_name.to_string(),
                row_count: count,
                size_bytes: size,
                indexes: Vec::new(),
            });
        }
    }
    
    Ok(DbStats {
        total_size_bytes: total_size,
        table_count: table_stats.len() as u32,
        tables: table_stats,
        index_count: 0,
        indexes: Vec::new(),
    })
}

#[tauri::command]
pub async fn diag_sync_status(
    state: State<'_, AppState>,
) -> Result<SyncStatus, String> {
    let sync_engine = &state.sync_engine;
    let running = sync_engine.is_running().await;
    
    // Get pending operations count
    let db = &state.db;
    let mut resp = db.query("SELECT count() FROM sync_operations WHERE synced = false").await.map_err(|e| e.to_string())?;
    let pending_ops: u64 = resp.take::<Option<u64>>(0).ok().flatten().unwrap_or(0);
    
    let mut resp = db.query("SELECT count() FROM sync_operations WHERE synced = true AND data LIKE '%conflict%'").await.map_err(|e| e.to_string())?;
    let conflicts: u64 = resp.take::<Option<u64>>(0).ok().flatten().unwrap_or(0);
    
    // Get last sync time
    let mut resp = db.query("SELECT value FROM settings WHERE key LIKE 'last_sync_%' ORDER BY value DESC LIMIT 1").await.map_err(|e| e.to_string())?;
    let last_sync: Option<String> = resp.take(0).unwrap_or(None);
    
    // Get per-table status
    let mut resp = db.query("SELECT table_name, count() as pending FROM sync_operations WHERE synced = false GROUP BY table_name").await.map_err(|e| e.to_string())?;
    let table_status_raw: Vec<Value> = resp.take(0).unwrap_or_default();
    
    let mut table_status = Vec::new();
    for t in table_status_raw {
        if let Some(name) = t.get("table_name").and_then(|v| v.as_str()) {
            table_status.push(TableSyncStatus {
                table_name: name.to_string(),
                pending: t.get("pending").and_then(|v| v.as_u64()).unwrap_or(0),
                synced: 0,
                conflicts: 0,
                last_sync: None,
            });
        }
    }
    
    Ok(SyncStatus {
        running,
        pending_operations: pending_ops,
        conflicts,
        last_sync_time: last_sync,
        last_sync_duration_ms: None,
        queue_depth: pending_ops,
        tables: table_status,
        bandwidth_kbps: None,
    })
}

#[tauri::command]
pub async fn diag_export_bundle(
    state: State<'_, AppState>,
) -> Result<String, String> {
    let timestamp = chrono::Utc::now().to_rfc3339();
    let filename = format!("sovereign-diag-{}.zip", timestamp.replace(":", "-").replace(".", "-"));
    let temp_dir = std::env::temp_dir().join("sovereign-diag");
    std::fs::create_dir_all(&temp_dir).map_err(|e| e.to_string())?;
    let output_path = temp_dir.join(&filename);
    
    // Gather all diagnostic data
    let system_info = diag_system_info(state.clone()).await?;
    let db_stats = diag_db_stats(state.clone()).await?;
    let sync_status = diag_sync_status(state.clone()).await?;
    let sidecar_health = state.sidecar_manager.get_all_health().await;
    let sidecar_health_json: Vec<Value> = sidecar_health.into_iter()
        .map(|h| serde_json::to_value(h).unwrap())
        .collect();
    
    // Get logs for each sidecar
    let mut logs = HashMap::new();
    for name in ["git-engine", "arsy", "legend", "pocketbase", "radius"] {
        if let Ok(sidecar_logs) = diag_sidecar_logs(name.to_string(), None, state.clone()).await {
            logs.insert(name.to_string(), sidecar_logs);
        }
    }
    
    let bundle = DiagnosticBundle {
        timestamp: timestamp.clone(),
        system_info,
        db_stats,
        sync_status,
        sidecar_health: sidecar_health_json,
        logs,
    };
    
    // Write JSON to file
    let json_path = temp_dir.join("diagnostic.json");
    std::fs::write(&json_path, serde_json::to_string_pretty(&bundle).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    
    // Create ZIP archive
    let file = std::fs::File::create(&output_path).map_err(|e| e.to_string())?;
    let mut zip = zip::ZipWriter::new(file);
    let options = zip::write::FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);
    
    zip.start_file("diagnostic.json", options).map_err(|e| e.to_string())?;
    let json_content = std::fs::read(&json_path).map_err(|e| e.to_string())?;
    zip.write_all(&json_content).map_err(|e| e.to_string())?;
    
    // Add system logs
    zip.start_file("system_info.json", options).map_err(|e| e.to_string())?;
    zip.write_all(&serde_json::to_vec(&bundle.system_info).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    
    zip.start_file("db_stats.json", options).map_err(|e| e.to_string())?;
    zip.write_all(&serde_json::to_vec(&bundle.db_stats).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    
    zip.start_file("sync_status.json", options).map_err(|e| e.to_string())?;
    zip.write_all(&serde_json::to_vec(&bundle.sync_status).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    
    zip.start_file("sidecar_health.json", options).map_err(|e| e.to_string())?;
    zip.write_all(&serde_json::to_vec(&bundle.sidecar_health).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    
    for (service, service_logs) in &bundle.logs {
        zip.start_file(format!("logs/{}.jsonl", service), options).map_err(|e| e.to_string())?;
        for log in service_logs {
            let line = serde_json::to_string(log).map_err(|e| e.to_string())? + "\n";
            zip.write_all(line.as_bytes()).map_err(|e| e.to_string())?;
        }
    }
    
    zip.finish().map_err(|e| e.to_string())?;
    
    info!("Diagnostic bundle created: {}", output_path.display());
    Ok(output_path.to_string_lossy().to_string())
}

// Placeholder functions for backward compatibility
#[tauri::command]
pub async fn diagnostics_run() -> Result<Value, String> {
    Ok(serde_json::json!({
        "status": "pass",
        "mesh_nodes": 9,
        "mesh_online": 9,
        "edge_url": "https://codex.a-l-l-a-h.com",
        "gate_status": "clean"
    }))
}

#[tauri::command]
pub async fn diagnostics_history() -> Result<Vec<Value>, String> {
    Ok(vec![serde_json::json!({
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "status": "pass"
    })])
}
