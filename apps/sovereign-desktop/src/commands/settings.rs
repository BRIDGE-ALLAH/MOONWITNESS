use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::command;
use crate::state::AppState;
use tauri::State;
use surrealdb::sql::{Value, Thing};
use std::collections::BTreeMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct Setting {
    pub key: String,
    pub value: serde_json::Value,
}

#[command]
pub async fn settings_get(
    key: String,
    state: State<'_, AppState>,
) -> Result<Option<Setting>, String> {
    let db = &state.db;
    let mut result = db.query("SELECT * FROM settings WHERE key = $key")
        .bind(("key", key.clone()))
        .await
        .map_err(|e| e.to_string())?;
    let settings: Vec<Setting> = result.take(0).map_err(|e| e.to_string())?;
    Ok(settings.into_iter().next())
}

#[command]
pub async fn settings_set(
    key: String,
    value: serde_json::Value,
    state: State<'_, AppState>,
) -> Result<Setting, String> {
    let db = &state.db;
    let mut record = BTreeMap::new();
    record.insert("key".to_string(), Value::from(key.clone()));
    record.insert("value".to_string(), Value::from(value.clone()));
    let created: Vec<Value> = db.create("settings").content(Value::from(record)).await.map_err(|e| e.to_string())?;
    let setting = created.first().ok_or_else(|| "No setting created".to_string())?;
    Ok(Setting {
        key,
        value,
    })
}

#[command]
pub async fn settings_list(
    state: State<'_, AppState>,
) -> Result<Vec<Setting>, String> {
    let db = &state.db;
    let mut result = db.query("SELECT * FROM settings").await.map_err(|e| e.to_string())?;
    let settings: Vec<Setting> = result.take(0).map_err(|e| e.to_string())?;
    Ok(settings)
}
