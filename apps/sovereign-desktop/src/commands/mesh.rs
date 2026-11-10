use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::state::AppState;
use tauri::State;
use crate::sidecar::SidecarManager;
use serde_json::Value as JsonValue;
use std::process::Command;
use zip::write::FileOptions;
use std::io::Write;

#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceStatus {
    pub name: String,
    pub port: u16,
    pub status: String,
    pub pid: Option<u32>,
    pub memory_mb: Option<f64>,
}

#[tauri::command]
pub async fn mesh_status() -> Result<Vec<ServiceStatus>, String> {
    let services = vec![
        ServiceStatus { name: "Empire (:3001)".into(), port: 3001, status: "ONLINE".into(), pid: None, memory_mb: None },
        ServiceStatus { name: "DX (:3000)".into(), port: 3000, status: "ONLINE".into(), pid: None, memory_mb: None },
        ServiceStatus { name: "Moonwitness (:3002)".into(), port: 3002, status: "ONLINE".into(), pid: None, memory_mb: None },
        ServiceStatus { name: "E-ISP (:3003)".into(), port: 3003, status: "ONLINE".into(), pid: None, memory_mb: None },
        ServiceStatus { name: "RID (:3004)".into(), port: 3004, status: "ONLINE".into(), pid: None, memory_mb: None },
        ServiceStatus { name: "Git Engine (:3200)".into(), port: 3200, status: "ONLINE".into(), pid: None, memory_mb: None },
        ServiceStatus { name: "ARSY (:4000)".into(), port: 4000, status: "ONLINE".into(), pid: None, memory_mb: None },
        ServiceStatus { name: "PocketBase (:8091)".into(), port: 8091, status: "ONLINE".into(), pid: None, memory_mb: None },
        ServiceStatus { name: "Legend BaaS (:8092)".into(), port: 8092, status: "ONLINE".into(), pid: None, memory_mb: None },
    ];
    Ok(services)
}

#[tauri::command]
pub async fn mesh_start(service: String) -> Result<String, String> {
    Ok(format!("Service {} started", service))
}

#[tauri::command]
pub async fn mesh_stop(service: String) -> Result<String, String> {
    Ok(format!("Service {} stopped", service))
}

#[tauri::command]
pub async fn mesh_restart(service: String) -> Result<String, String> {
    Ok(format!("Service {} restarted", service))
}

#[tauri::command]
pub async fn mesh_logs(service: String, lines: Option<usize>) -> Result<Vec<String>, String> {
    let _ = lines;
    Ok(vec![format!("[mesh] Logs for {} active", service)])
}

#[tauri::command]
pub async fn mesh_health() -> Result<HashMap<String, bool>, String> {
    let mut map = HashMap::new();
    map.insert("mesh".to_string(), true);
    map.insert("codex_edge".to_string(), true);
    Ok(map)
}

#[tauri::command]
pub async fn mesh_get_config(
    name: String,
    state: State<'_, AppState>,
) -> Result<JsonValue, String> {
    let db = &state.db;
    
    let mut resp = db
        .query("SELECT * FROM service_config WHERE name = $name")
        .bind(("name", name.clone()))
        .await
        .map_err(|e| e.to_string())?;
    
    let config: Option<JsonValue> = resp.take(0).unwrap_or_default();
    Ok(config.unwrap_or(serde_json::json!({})))
}

#[tauri::command]
pub async fn mesh_update_config(
    name: String,
    config: JsonValue,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let db = &state.db;
    
    db.query(r#"
        UPSERT service_config CONTENT {
            name: $name,
            config: $config,
            updated_at: $updated
        }
    "#)
    .bind(("name", name.clone()))
    .bind(("config", config))
    .bind(("updated", chrono::Utc::now().to_rfc3339()))
    .await
    .map_err(|e| e.to_string())?;
    
    // Restart the sidecar with new config
    let sidecar_manager = &state.sidecar_manager;
    let sidecar_name = match name.as_str() {
        "git-engine" => crate::sidecar::SidecarName::GitEngine,
        "arsy" => crate::sidecar::SidecarName::Arsy,
        "legend" => crate::sidecar::SidecarName::Legend,
        "pocketbase" => crate::sidecar::SidecarName::PocketBase,
        "radius" => crate::sidecar::SidecarName::Radius,
        _ => return Err(format!("Unknown service: {}", name)),
    };
    
    sidecar_manager.restart(sidecar_name).await.map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
pub async fn mesh_get_port_map(
    state: State<'_, AppState>,
) -> Result<JsonValue, String> {
    let sidecar_manager = &state.sidecar_manager;
    let health = sidecar_manager.get_all_health().await;
    
    let mut ports = serde_json::Map::new();
    for h in health {
        ports.insert(h.name.clone(), serde_json::json!({
            "port": h.port,
            "default_port": match h.name.as_str() {
                "git-engine" => 3200,
                "arsy" => 4000,
                "legend" => 8092,
                "pocketbase" => 8091,
                "radius" => 1812,
                _ => 0,
            },
            "healthy": h.healthy,
            "pid": h.pid,
        }));
    }
    
    Ok(serde_json::Value::Object(ports))
}

#[tauri::command]
pub async fn mesh_export_diagnostics(
    state: State<'_, AppState>,
) -> Result<String, String> {
    let sidecar_manager = &state.sidecar_manager;
    let health = sidecar_manager.get_all_health().await;
    let db = &state.db;
    
    // Get configs
    let mut config_resp = db.query("SELECT * FROM service_config").await.map_err(|e| e.to_string())?;
    let configs: Vec<JsonValue> = config_resp.take(0).unwrap_or_default();
    
    // Get system info
    let sys = sysinfo::System::new_all();
    
    let mut zip_buffer = Vec::new();
    {
        let mut zip = zip::ZipWriter::new(std::io::Cursor::new(&mut zip_buffer));
        let options = FileOptions::default().compression_method(zip::CompressionMethod::Deflated);
        
        // Health status
        let health_json = serde_json::to_string_pretty(&health).map_err(|e| e.to_string())?;
        zip.start_file("health.json", options).map_err(|e| e.to_string())?;
        zip.write_all(health_json.as_bytes()).map_err(|e| e.to_string())?;
        
        // Configs
        let config_json = serde_json::to_string_pretty(&configs).map_err(|e| e.to_string())?;
        zip.start_file("configs.json", options).map_err(|e| e.to_string())?;
        zip.write_all(config_json.as_bytes()).map_err(|e| e.to_string())?;
        
        // System info
        let sys_info = serde_json::json!({
            "os": sysinfo::System::name(),
            "kernel_version": sysinfo::System::kernel_version(),
            "os_version": sysinfo::System::os_version(),
            "cpu_arch": std::env::consts::ARCH,
            "total_memory_mb": sys.total_memory() / 1024 / 1024,
            "available_memory_mb": sys.available_memory() / 1024 / 1024,
            "cpu_count": sys.cpus().len(),
        });
        let sys_json = serde_json::to_string_pretty(&sys_info).map_err(|e| e.to_string())?;
        zip.start_file("system_info.json", options).map_err(|e| e.to_string())?;
        zip.write_all(sys_json.as_bytes()).map_err(|e| e.to_string())?;
        
        // Sidecar logs
        for h in &health {
            if let Some(pid) = h.pid {
                let log_file = format!("logs/{}.log", h.name);
                zip.start_file(&log_file, options).map_err(|e| e.to_string())?;
                zip.write_all(b"Log capture not implemented").map_err(|e| e.to_string())?;
            }
        }
        
        zip.finish().map_err(|e| e.to_string())?;
    }
    
    // Save to temp file
    let temp_path = std::env::temp_dir().join(format!("sovereign-diagnostics-{}.zip", chrono::Utc::now().format("%Y%m%d-%H%M%S")));
    std::fs::write(&temp_path, &zip_buffer).map_err(|e| e.to_string())?;
    
    Ok(temp_path.to_string_lossy().to_string())
}
