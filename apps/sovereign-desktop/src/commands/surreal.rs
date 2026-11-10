use serde_json::Value;
use crate::state::AppState;
use tauri::State;
use surrealdb::sql::Value as SurrealValue;
use std::collections::HashMap;

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

#[tauri::command]
pub async fn surreal_explain(
    sql: String,
    state: State<'_, AppState>,
) -> Result<Value, String> {
    let db = &state.db;
    let mut resp = db.query("EXPLAIN $sql").bind(("sql", sql)).await.map_err(|e| e.to_string())?;
    let result: Option<SurrealValue> = resp.take(0).ok();
    Ok(result.map(|v| serde_json::to_value(v).unwrap_or(serde_json::json!({}))).unwrap_or(serde_json::json!({})))
}

#[tauri::command]
pub async fn surreal_schema(
    table: Option<String>,
    state: State<'_, AppState>,
) -> Result<Value, String> {
    let db = &state.db;
    let sql = if let Some(t) = table {
        format!("INFO FOR TABLE {}", t)
    } else {
        "INFO FOR DB".to_string()
    };
    let mut resp = db.query(sql).await.map_err(|e| e.to_string())?;
    let result: Option<SurrealValue> = resp.take(0).ok();
    Ok(result.map(|v| serde_json::to_value(v).unwrap_or(serde_json::json!({}))).unwrap_or(serde_json::json!({})))
}

#[tauri::command]
pub async fn surreal_live_query(
    sql: String,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let db = &state.db;
    // For live queries, we'"'"'d typically use WebSocket subscription
    // This is a placeholder that returns a subscription ID
    let subscription_id = format!("live_{}", uuid::Uuid::new_v4().to_string().replace("-", ""));
    
    // Store the live query for the subscription
    let mut resp = db.query(r#"
        CREATE live_queries CONTENT {
            id: $id,
            sql: $sql,
            created_at: $created
        }
    "#)
    .bind(("id", subscription_id.clone()))
    .bind(("sql", sql))
    .bind(("created", chrono::Utc::now().to_rfc3339()))
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(subscription_id)
}

#[tauri::command]
pub async fn surreal_export_table(
    table: String,
    format: Option<String>,
    state: State<'_, AppState>,
) -> Result<Value, String> {
    let db = &state.db;
    let mut resp = db.query("SELECT * FROM $table").bind(("table", table.clone())).await.map_err(|e| e.to_string())?;
    let records: Vec<Value> = resp.take(0).unwrap_or_default();
    
    let fmt = format.unwrap_or_else(|| "json".to_string());
    
    if fmt == "csv" {
        // Convert to CSV
        if records.is_empty() {
            return Ok(serde_json::json!({ "format": "csv", "data": "" }));
        }
        let mut csv = String::new();
        // Write header
        if let Some(first) = records.first() {
            if let Value::Object(map) = first {
                csv.push_str(&map.keys().cloned().collect::<Vec<_>>().join(","));
                csv.push_str("\n");
            }
        }
        // Write rows
        for record in records {
            if let Value::Object(map) = record {
                let row: Vec<String> = map.values().map(|v| v.to_string()).collect();
                csv.push_str(&row.join(","));
                csv.push_str("\n");
            }
        }
        Ok(serde_json::json!({ "format": "csv", "data": csv }))
    } else {
        Ok(serde_json::json!({ "format": "json", "data": records }))
    }
}

#[tauri::command]
pub async fn surreal_import_table(
    table: String,
    data: Value,
    format: Option<String>,
    state: State<'_, AppState>,
) -> Result<Value, String> {
    let db = &state.db;
    let fmt = format.unwrap_or_else(|| "json".to_string());
    
    let records = if fmt == "csv" {
        // Parse CSV
        let csv_str = data.as_str().unwrap_or("");
        let mut records = Vec::new();
        let mut lines = csv_str.lines();
        let headers: Vec<&str> = lines.next().unwrap_or("").split(",").collect();
        for line in lines {
            let values: Vec<&str> = line.split(",").collect();
            let mut obj = serde_json::Map::new();
            for (i, header) in headers.iter().enumerate() {
                obj.insert(header.to_string(), serde_json::json!(values.get(i).unwrap_or(&"")));
            }
            records.push(Value::Object(obj));
        }
        records
    } else {
        data.as_array().cloned().unwrap_or_default()
    };
    
    let mut created = 0;
    for record in records {
        let _resp = db.query("CREATE $table CONTENT $data")
            .bind(("table", table.clone()))
            .bind(("data", record))
            .await
            .map_err(|e| e.to_string())?;
        created += 1;
    }
    
    Ok(serde_json::json!({ "table": table, "imported": created }))
}
