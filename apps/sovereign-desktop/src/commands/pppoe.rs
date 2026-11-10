use serde_json::Value;

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
