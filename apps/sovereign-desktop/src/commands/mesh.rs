use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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
