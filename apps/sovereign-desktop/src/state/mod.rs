use std::sync::Arc;
use crate::storage::surrealdb::SurrealLocal;
use crate::sidecar::SidecarManager;
use crate::sync::engine::SyncEngine;

pub struct AppState {
    pub sidecar_manager: Arc<SidecarManager>,
    pub db: SurrealLocal,
    pub sync_engine: Arc<SyncEngine>,
}