use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Setting {
    pub key: String,
    pub value: serde_json::Value,
}

#[tauri::command]
pub async fn settings_get(key: String) -> Result<Option<Setting>, String> {
    Ok(Some(Setting {
        key,
        value: serde_json::json!("default"),
    }))
}

#[tauri::command]
pub async fn settings_set(key: String, value: serde_json::Value) -> Result<Setting, String> {
    Ok(Setting { key, value })
}

#[tauri::command]
pub async fn settings_list() -> Result<Vec<Setting>, String> {
    Ok(vec![Setting {
        key: "theme".into(),
        value: serde_json::json!("dark"),
    }])
}
