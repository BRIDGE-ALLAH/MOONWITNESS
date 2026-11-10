use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::command;
use crate::state::AppState;
use tauri::State;
use surrealdb::sql::{Value, Object, Thing};

#[derive(Debug, Serialize, Deserialize)]
pub struct SurrealQueryResult {
    pub result: Vec<Value>,
    pub time: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SurrealRecord {
    pub id: Option<String>,
    pub table: String,
    pub data: serde_json::Value,
}

#[command]
pub async fn surreal_query(
    query: String,
    state: State<'_, AppState>,
) -> Result<SurrealQueryResult, String> {
    let db = &state.db;
    let start = std::time::Instant::now();
    let mut result = db.query(&query).await.map_err(|e| e.to_string())?;
    let values: Vec<Value> = result.take(0).map_err(|e| e.to_string())?;
    Ok(SurrealQueryResult {
        result: values,
        time: format!("{:.2}ms", start.elapsed().as_millis()),
    })
}

#[command]
pub async fn surreal_create(
    table: String,
    data: serde_json::Value,
    state: State<'_, AppState>,
) -> Result<SurrealRecord, String> {
    let db = &state.db;
    let created: Vec<Value> = db.create(&table).content(data).await.map_err(|e| e.to_string())?;
    let record = created.first().ok_or_else(|| "No record created".to_string())?;
    Ok(SurrealRecord {
        id: record.get("id").and_then(|v| v.as_str()).map(|s| s.to_string()),
        table,
        data: serde_json::to_value(record).map_err(|e| e.to_string())?,
    })
}

#[command]
pub async fn surreal_read(
    table: String,
    id: String,
    state: State<'_, AppState>,
) -> Result<SurrealRecord, String> {
    let db = &state.db;
    let thing: Thing = format!("{}:{}", table, id).parse().map_err(|e| e.to_string())?;
    let record: Option<Value> = db.select(thing).await.map_err(|e| e.to_string())?;
    let record = record.ok_or_else(|| "Record not found".to_string())?;
    Ok(SurrealRecord {
        id: record.get("id").and_then(|v| v.as_str()).map(|s| s.to_string()),
        table,
        data: serde_json::to_value(record).map_err(|e| e.to_string())?,
    })
}

#[command]
pub async fn surreal_update(
    table: String,
    id: String,
    data: serde_json::Value,
    state: State<'_, AppState>,
) -> Result<SurrealRecord, String> {
    let db = &state.db;
    let thing: Thing = format!("{}:{}", table, id).parse().map_err(|e| e.to_string())?;
    let updated: Option<Value> = db.update(thing).content(data).await.map_err(|e| e.to_string())?;
    let record = updated.ok_or_else(|| "Record not found".to_string())?;
    Ok(SurrealRecord {
        id: record.get("id").and_then(|v| v.as_str()).map(|s| s.to_string()),
        table,
        data: serde_json::to_value(record).map_err(|e| e.to_string())?,
    })
}

#[command]
pub async fn surreal_delete(
    table: String,
    id: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let db = &state.db;
    let thing: Thing = format!("{}:{}", table, id).parse().map_err(|e| e.to_string())?;
    let _: Option<Value> = db.delete(thing).await.map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn surreal_health(
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let db = &state.db;
    Ok(crate::storage::surrealdb::health_check(db).await)
}
