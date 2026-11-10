use serde_json::Value;
use serde::{Serialize, Deserialize};
use crate::state::AppState;
use tauri::State;
use reqwest::Client;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct PPPoESession {
    pub id: String,
    pub nas_ip: String,
    pub username: String,
    pub assigned_ip: Option<String>,
    pub status: String,
    pub duration_seconds: u64,
    pub bytes_in: u64,
    pub bytes_out: u64,
    pub nas_port: Option<u16>,
    pub called_station_id: Option<String>,
    pub calling_station_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RADIUSLog {
    pub id: String,
    pub nas_ip: String,
    pub username: String,
    pub packet_type: String,
    pub timestamp: String,
    pub attributes: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NASDevice {
    pub id: String,
    pub name: String,
    pub ip: String,
    pub secret: String,
    pub auth_port: u16,
    pub acct_port: u16,
    pub status: String,
    pub vendor: Option<String>,
    pub model: Option<String>,
}

#[tauri::command]
pub async fn pppoe_list_sessions(
    filter: Option<String>,
    state: State<'_, AppState>,
) -> Result<Vec<PPPoESession>, String> {
    let db = &state.db;
    let sql = if let Some(f) = filter {
        format!("SELECT * FROM pppoe_sessions WHERE username LIKE '%{}%' OR nas_ip LIKE '%{}%' ORDER BY id", f, f)
    } else {
        "SELECT * FROM pppoe_sessions ORDER BY id".to_string()
    };
    let mut resp = db.query(sql).await.map_err(|e| e.to_string())?;
    let sessions: Vec<PPPoESession> = resp.take(0).unwrap_or_default();
    Ok(sessions)
}

#[tauri::command]
pub async fn pppoe_get_session(
    session_id: String,
    state: State<'_, AppState>,
) -> Result<PPPoESession, String> {
    let db = &state.db;
    let mut resp = db.query("SELECT * FROM pppoe_sessions WHERE id = $id").bind(("id", session_id)).await.map_err(|e| e.to_string())?;
    let session: Option<PPPoESession> = resp.take(0).unwrap_or(None);
    session.ok_or_else(|| "Session not found".to_string())
}

#[tauri::command]
pub async fn pppoe_disconnect_session(
    session_id: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let db = &state.db;
    // Get session to find NAS IP
    let mut resp = db.query("SELECT nas_ip FROM pppoe_sessions WHERE id = $id").bind(("id", session_id.clone())).await.map_err(|e| e.to_string())?;
    let nas_ip: Option<String> = resp.take(0).unwrap_or(None);
    
    if let Some(nas) = nas_ip {
        // Call ARSY to disconnect
        let client = Client::new();
        let arsy_url = format!("http://localhost:4000/api/v1/pppoe/disconnect/{}", session_id);
        let _resp = client.post(&arsy_url).send().await.map_err(|e| e.to_string())?;
    }
    
    // Update local DB
    let _resp = db.query("UPDATE pppoe_sessions SET status = 'disconnected' WHERE id = $id").bind(("id", session_id)).await.map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
pub async fn pppoe_radius_logs(
    filter: Option<String>,
    limit: Option<usize>,
    state: State<'_, AppState>,
) -> Result<Vec<RADIUSLog>, String> {
    let db = &state.db;
    let lim = limit.unwrap_or(100);
    let sql = if let Some(f) = filter {
        format!("SELECT * FROM radius_logs WHERE username LIKE '%{}%' OR nas_ip LIKE '%{}%' ORDER BY timestamp DESC LIMIT {}", f, f, lim)
    } else {
        format!("SELECT * FROM radius_logs ORDER BY timestamp DESC LIMIT {}", lim)
    };
    let mut resp = db.query(sql).await.map_err(|e| e.to_string())?;
    let logs: Vec<RADIUSLog> = resp.take(0).unwrap_or_default();
    Ok(logs)
}

#[tauri::command]
pub async fn pppoe_nas_list(
    state: State<'_, AppState>,
) -> Result<Vec<NASDevice>, String> {
    let db = &state.db;
    let mut resp = db.query("SELECT * FROM nas_devices ORDER BY id").await.map_err(|e| e.to_string())?;
    let nas: Vec<NASDevice> = resp.take(0).unwrap_or_default();
    Ok(nas)
}

#[tauri::command]
pub async fn pppoe_nas_config(
    nas_id: String,
    state: State<'_, AppState>,
) -> Result<NASDevice, String> {
    let db = &state.db;
    let mut resp = db.query("SELECT * FROM nas_devices WHERE id = $id").bind(("id", nas_id)).await.map_err(|e| e.to_string())?;
    let nas: Option<NASDevice> = resp.take(0).unwrap_or(None);
    nas.ok_or_else(|| "NAS not found".to_string())
}

#[tauri::command]
pub async fn pppoe_nas_update(
    nas_id: String,
    config: Value,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let db = &state.db;
    let _resp = db.query(r#"
        UPDATE nas_devices SET 
            name = $name,
            ip = $ip,
            secret = $secret,
            auth_port = $auth_port,
            acct_port = $acct_port,
            vendor = $vendor,
            model = $model,
            updated_at = $updated
        WHERE id = $id
    "#)
    .bind(("id", nas_id.clone()))
    .bind(("name", config.get("name").and_then(|v| v.as_str()).unwrap_or("")))
    .bind(("ip", config.get("ip").and_then(|v| v.as_str()).unwrap_or("")))
    .bind(("secret", config.get("secret").and_then(|v| v.as_str()).unwrap_or("")))
    .bind(("auth_port", config.get("auth_port").and_then(|v| v.as_u64()).unwrap_or(1812) as u16))
    .bind(("acct_port", config.get("acct_port").and_then(|v| v.as_u64()).unwrap_or(1813) as u16))
    .bind(("vendor", config.get("vendor").and_then(|v| v.as_str())))
    .bind(("model", config.get("model").and_then(|v| v.as_str())))
    .bind(("updated", chrono::Utc::now().to_rfc3339()))
    .await
    .map_err(|e| e.to_string())?;
    Ok(true)
}

// Placeholder functions
#[tauri::command]
pub async fn pppoe_list() -> Result<Vec<Value>, String> {
    Ok(vec![serde_json::json!({
        "id": "pppoe-01",
        "username": "client-1@e-isp",
        "ip": "10.0.0.101",
        "status": "connected"
    })])
}

#[tauri::command]
pub async fn pppoe_create(username: String) -> Result<Value, String> {
    Ok(serde_json::json!({
        "id": "pppoe-created",
        "username": username,
        "status": "active"
    }))
}

#[tauri::command]
pub async fn pppoe_delete(id: String) -> Result<String, String> {
    Ok(format!("Deleted session {}", id))
}

#[tauri::command]
pub async fn pppoe_stats() -> Result<Value, String> {
    Ok(serde_json::json!({
        "active_sessions": 1,
        "total_throughput_mbps": 45.8
    }))
}
