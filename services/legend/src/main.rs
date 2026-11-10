use std::net::SocketAddr;
use std::sync::Arc;
use anyhow::Result;
use axum::{
    extract::{Path, State},
    http::{header, Method, StatusCode},
    response::{IntoResponse, Json},
    routing::{get, post},
    Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use surrealdb::engine::local::{Db, Mem, SurrealKV};
use surrealdb::Surreal;
use tower_http::cors::{Any, CorsLayer};
use tracing::{info, warn};
use uuid::Uuid;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Surreal<Db>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OperationalRecord {
    pub id: Option<String>,
    pub table_name: String,
    pub payload: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateRecordInput {
    pub payload: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct QueryInput {
    pub query: String,
}

pub async fn init_db() -> Result<Surreal<Db>> {
    let db_path = std::env::var("LEGEND_DATA_PATH").unwrap_or_else(|_| "data/legend.db".to_string());
    let db = if std::env::var("LEGEND_IN_MEMORY").unwrap_or_default() == "true" {
        info!("Legend BaaS starting with in-memory SurrealDB engine");
        Surreal::new::<Mem>(()).await?
    } else {
        std::fs::create_dir_all("data")?;
        info!("Legend BaaS starting with persistent SurrealKV engine at {}", db_path);
        Surreal::new::<SurrealKV>(db_path.as_str()).await?
    };

    db.use_ns("sovereign").use_db("operational").await?;
    info!("Connected to SurrealDB namespace: sovereign, database: operational");
    Ok(db)
}

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION]);

    Router::new()
        .route("/health", get(health_check))
        .route("/api/v1/meta", get(get_metadata))
        .route("/api/v1/records/:table", post(create_record).get(list_records))
        .route("/api/v1/records/:table/:id", get(get_record))
        .route("/api/v1/query", post(execute_raw_surql))
        .layer(cors)
        .with_state(state)
}

async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "ok",
        "service": "legend-baas",
        "engine": "surrealdb-rust",
        "architecture": "high-concurrency-operational-plane",
        "timestamp": Utc::now()
    }))
}

async fn get_metadata() -> impl IntoResponse {
    Json(serde_json::json!({
        "name": "LEGEND // SOVEREIGN RUST BAAS",
        "database": "SurrealDB",
        "capabilities": [
            "Ultra-low latency operational transactions",
            "Multi-model document, graph, & time-series",
            "SurrealQL native query interface",
            "Zero cloud-vendor dependency"
        ],
        "namespace": "sovereign",
        "database_name": "operational",
        "target_workloads": [
            "ARSY Network Orchestration",
            "PPPoE & RADIUS High-Cadence Telemetry",
            "E-ISP Edge Mesh Real-Time Metrics",
            "Native Git Engine Audit & Event Sinks"
        ]
    }))
}

async fn create_record(
    State(state): State<AppState>,
    Path(table): Path<String>,
    Json(input): Json<CreateRecordInput>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let record_id = Uuid::new_v4().to_string();
    let record = OperationalRecord {
        id: Some(record_id.clone()),
        table_name: table.clone(),
        payload: input.payload,
        created_at: Utc::now(),
    };

    let created: Option<OperationalRecord> = state
        .db
        .create((table.as_str(), record_id.as_str()))
        .content(record)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(created)))
}

async fn list_records(
    State(state): State<AppState>,
    Path(table): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let records: Vec<OperationalRecord> = state
        .db
        .select(table.as_str())
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(records))
}

async fn get_record(
    State(state): State<AppState>,
    Path((table, id)): Path<(String, String)>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let record: Option<OperationalRecord> = state
        .db
        .select((table.as_str(), id.as_str()))
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    match record {
        Some(r) => Ok(Json(r)),
        None => Err((StatusCode::NOT_FOUND, "Record not found".to_string())),
    }
}

async fn execute_raw_surql(
    State(state): State<AppState>,
    Json(input): Json<QueryInput>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let mut response = state
        .db
        .query(&input.query)
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    let results: Vec<serde_json::Value> = response
        .take(0)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(results))
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "legend=info,tower_http=info".into()),
        )
        .init();

    let db = init_db().await?;
    let state = AppState { db: Arc::new(db) };

    let port: u16 = std::env::var("LEGEND_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8092);

    let app = create_router(state);
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    info!("⚡ LEGEND BAAS (SurrealDB + Rust) running at http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

