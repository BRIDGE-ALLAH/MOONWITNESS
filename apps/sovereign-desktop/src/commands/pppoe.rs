use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::command;
use crate::state::AppState;
use tauri::State;
use surrealdb::sql::{Value, Object, Thing};
use chrono::Utc;

#[derive(Debug, Serialize, Deserialize)]
pub struct PppoeSession {
    pub id: String,
    pub session_id: String,
    pub nas_ip: String,
    pub username: String,
    pub assigned_ip: Option<String>,
    pub status: String,
    pub bytes_in: i64,
    pub bytes_out: i64,
    pub started_at: String,
    pub ended_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PppoeStats {
    pub total_sessions: i64,
    pub active_sessions: i64,
    pub total_bytes_in: i64,
    pub total_bytes_out: i64,
    pub avg_session_duration: i64,
}

#[command]
pub async fn pppoe_list(
    state: State<'_, AppState>,
) -> Result<Vec<PppoeSession>, String> {
    let db = &state.db;
    let mut result = db.query("SELECT * FROM pppoe_sessions ORDER BY started_at DESC LIMIT 100").await.map_err(|e| e.to_string())?;
    let sessions: Vec<PppoeSession> = result.take(0).map_err(|e| e.to_string())?;
    Ok(sessions)
}

#[command]
pub async fn pppoe_create(
    session_id: String,
    nas_ip: String,
    username: String,
    assigned_ip: Option<String>,
    state: State<'_, AppState>,
) -> Result<PppoeSession, String> {
    let db = &state.db;
    let record = surrealdb::sql::Object::from_iter(vec![
        ("session_id".to_string(), Value::from(session_id.clone())),
        ("nas_ip".to_string(), Value::from(nas_ip.clone())),
        ("username".to_string(), Value::from(username.clone())),
        ("assigned_ip".to_string(), assigned_ip.map(Value::from).unwrap_or(Value::Null)),
        ("status".to_string(), Value::from("connecting".to_string())),
        ("bytes_in".to_string(), Value::from(0i64)),
        ("bytes_out".to_string(), Value::from(0i64)),
        ("started_at".to_string(), Value::from(Utc::now().to_rfc3339())),
        ("ended_at".to_string(), Value::Null),
    ]);
    let created: Vec<Value> = db.create("pppoe_sessions").content(Value::from(record)).await.map_err(|e| e.to_string())?;
    let session = created.first().ok_or_else(|| "No session created".to_string())?;
    Ok(PppoeSession {
        id: session.get("id").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or_default(),
        session_id,
        nas_ip,
        username,
        assigned_ip,
        status: "connecting".to_string(),
        bytes_in: 0,
        bytes_out: 0,
        started_at: Utc::now().to_rfc3339(),
        ended_at: None,
    })
}

#[command]
pub async fn pppoe_delete(
    id: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let db = &state.db;
    let thing: Thing = format!("pppoe_sessions:{}", id).parse().map_err(|e| e.to_string())?;
    let _: Option<Value> = db.delete(thing).await.map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn pppoe_stats(
    state: State<'_, AppState>,
) -> Result<PppoeStats, String> {
    let db = &state.db;
    let mut result = db.query("
        SELECT 
            count() as total_sessions,
            count(status = 'active') as active_sessions,
            math::sum(bytes_in) as total_bytes_in,
            math::sum(bytes_out) as total_bytes_out,
            math::mean(time::diff(ended_at, started_at)) as avg_session_duration
        FROM pppoe_sessions
    ").await.map_err(|e| e.to_string())?;
    let stats: Vec<Value> = result.take(0).map_err(|e| e.to_string())?;
    let stat = stats.first().ok_or_else(|| "No stats".to_string())?;
    Ok(PppoeStats {
        total_sessions: stat.get("total_sessions").and_then(|v| v.as_int()).unwrap_or(0),
        active_sessions: stat.get("active_sessions").and_then(|v| v.as_int()).unwrap_or(0),
        total_bytes_in: stat.get("total_bytes_in").and_then(|v| v.as_int()).unwrap_or(0),
        total_bytes_out: stat.get("total_bytes_out").and_then(|v| v.as_int()).unwrap_or(0),
        avg_session_duration: stat.get("avg_session_duration").and_then(|v| v.as_int()).unwrap_or(0),
    })
}
