use serde_json::Value;

#[tauri::command]
pub async fn surreal_query(sql: String) -> Result<Value, String> {
    Ok(serde_json::json!({ "query": sql, "result": [] }))
}

#[tauri::command]
pub async fn surreal_create(table: String, data: Value) -> Result<Value, String> {
    Ok(serde_json::json!({ "table": table, "data": data }))
}

#[tauri::command]
pub async fn surreal_read(thing: String) -> Result<Option<Value>, String> {
    let _ = thing;
    Ok(None)
}

#[tauri::command]
pub async fn surreal_update(thing: String, data: Value) -> Result<Value, String> {
    let _ = thing;
    Ok(data)
}

#[tauri::command]
pub async fn surreal_delete(thing: String) -> Result<String, String> {
    Ok(format!("Deleted {}", thing))
}

#[tauri::command]
pub async fn surreal_health() -> Result<bool, String> {
    Ok(true)
}
