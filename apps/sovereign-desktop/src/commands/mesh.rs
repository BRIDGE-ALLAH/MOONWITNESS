use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::command;
use crate::state::AppState;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct MeshService {
    pub name: String,
    pub status: String, // running, stopped, error
    pub port: u16,
    pub pid: Option<u32>,
    pub uptime: Option<String>,
    pub health: String, // healthy, unhealthy, unknown
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MeshStatus {
    pub services: Vec<MeshService>,
    pub overall: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MeshLogEntry {
    pub service: String,
    pub level: String,
    pub message: String,
    pub timestamp: String,
}

#[command]
pub async fn mesh_status(
    state: State<'_, AppState>,
) -> Result<MeshStatus, String> {
    let sidecar = &state.sidecar_manager;
    let health = sidecar.get_all_health().await.map_err(|e| e.to_string())?;

    let mut services = Vec::new();
    let mut overall_healthy = true;

    for (name, (port, pid, start_time, _)) in health {
        let status = if pid.is_some() { "running" } else { "stopped" };
        let health_status = if pid.is_some() { "healthy" } else { "unhealthy" };
        if health_status == "unhealthy" {
            overall_healthy = false;
        }
        let uptime = start_time.map(|st| {
            let elapsed = chrono::Utc::now().signed_duration_since(st);
            format!("{}m", elapsed.num_minutes())
        });

        services.push(MeshService {
            name,
            status: status.to_string(),
            port,
            pid,
            uptime,
            health: health_status.to_string(),
        });
    }

    Ok(MeshStatus {
        services,
        overall: if overall_healthy { "healthy" } else { "degraded" }.to_string(),
    })
}

#[command]
pub async fn mesh_start(
    service: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let sidecar = &state.sidecar_manager;
    sidecar.start_service(&service).await.map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn mesh_stop(
    service: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let sidecar = &state.sidecar_manager;
    sidecar.stop_service(&service).await.map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn mesh_restart(
    service: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let sidecar = &state.sidecar_manager;
    sidecar.restart_service(&service).await.map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn mesh_logs(
    service: String,
    lines: usize,
    state: State<'_, AppState>,
) -> Result<Vec<MeshLogEntry>, String> {
    let sidecar = &state.sidecar_manager;
    let logs = sidecar.get_logs(&service, lines).await.map_err(|e| e.to_string())?;
    Ok(logs)
}

#[command]
pub async fn mesh_health(
    service: String,
    state: State<'_, AppState>,
) -> Result<MeshService, String> {
    let sidecar = &state.sidecar_manager;
    let health = sidecar.get_service_health(&service).await.map_err(|e| e.to_string())?;
    Ok(health)
}
