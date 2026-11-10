use std::io::{Read, Write};
use std::net::{SocketAddr, TcpStream};
use std::sync::Arc;
use std::time::Duration;

use anyhow::{bail, Context, Result};
use axum::{
    extract::{Path, Query, Request, State},
    http::{header, HeaderValue, Method, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Json, Response},
    routing::{get, post},
    Router,
};
use chrono::Utc;
use serde::Deserialize;
use serde_json::{json, Value as JsonValue};
use surrealdb::engine::local::{Db, Mem, SurrealKv};
use surrealdb::Surreal;
use tower_http::cors::{AllowOrigin, CorsLayer};
use tracing::info;
use uuid::Uuid;

const MAX_LIST_LIMIT: u32 = 1000;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Surreal<Db>>,
    pub service_token: Arc<String>,
    pub admin_token: Arc<String>,
}

#[derive(Debug, Clone)]
pub struct LegendConfig {
    pub host: String,
    pub port: u16,
    pub data_path: String,
    pub in_memory: bool,
    pub service_token: String,
    pub admin_token: String,
    pub cors_origins: Vec<String>,
}

impl LegendConfig {
    pub fn from_env() -> Result<Self> {
        let service_token = std::env::var("LEGEND_SERVICE_TOKEN").unwrap_or_default();
        let admin_token = std::env::var("LEGEND_ADMIN_TOKEN").unwrap_or_default();
        if service_token.len() < 32 {
            bail!("LEGEND_SERVICE_TOKEN must be set and at least 32 characters");
        }
        if admin_token.len() < 32 {
            bail!("LEGEND_ADMIN_TOKEN must be set and at least 32 characters");
        }
        if service_token == admin_token {
            bail!("LEGEND_ADMIN_TOKEN must differ from LEGEND_SERVICE_TOKEN");
        }
        Ok(Self {
            host: std::env::var("LEGEND_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
            port: std::env::var("LEGEND_PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(8092),
            data_path: std::env::var("LEGEND_DATA_PATH")
                .unwrap_or_else(|_| "data/legend/legend.db".to_string()),
            in_memory: std::env::var("LEGEND_IN_MEMORY").unwrap_or_default() == "true",
            service_token,
            admin_token,
            cors_origins: std::env::var("LEGEND_CORS_ORIGINS")
                .unwrap_or_else(|_| "http://127.0.0.1:3003,http://localhost:3003".to_string())
                .split(',')
                .map(|o| o.trim().to_string())
                .filter(|o| !o.is_empty())
                .collect(),
        })
    }
}

#[derive(Debug, Deserialize)]
pub struct RecordInput {
    pub payload: JsonValue,
}

#[derive(Debug, Deserialize)]
pub struct QueryInput {
    pub query: String,
}

#[derive(Debug, Deserialize)]
pub struct ListParams {
    pub limit: Option<u32>,
}

type ApiError = (StatusCode, Json<JsonValue>);

fn api_error(status: StatusCode, message: impl Into<String>) -> ApiError {
    (status, Json(json!({ "error": message.into() })))
}

fn db_error(err: surrealdb::Error) -> ApiError {
    api_error(StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
}

pub fn is_valid_identifier(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= 64
        && value
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-')
}

pub fn constant_time_eq(left: &[u8], right: &[u8]) -> bool {
    if left.len() != right.len() {
        return false;
    }
    left.iter()
        .zip(right)
        .fold(0u8, |acc, (a, b)| acc | (a ^ b))
        == 0
}

fn bearer_token(request: &Request) -> Option<&str> {
    request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
}

async fn require_service_token(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Response {
    let authorized = bearer_token(&request).is_some_and(|token| {
        constant_time_eq(token.as_bytes(), state.service_token.as_bytes())
            || constant_time_eq(token.as_bytes(), state.admin_token.as_bytes())
    });
    if !authorized {
        return api_error(StatusCode::UNAUTHORIZED, "invalid or missing bearer token")
            .into_response();
    }
    next.run(request).await
}

async fn require_admin_token(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Response {
    let authorized = bearer_token(&request)
        .is_some_and(|token| constant_time_eq(token.as_bytes(), state.admin_token.as_bytes()));
    if !authorized {
        return api_error(StatusCode::FORBIDDEN, "admin token required").into_response();
    }
    next.run(request).await
}

fn surreal_to_json(value: surrealdb::Value) -> JsonValue {
    value.into_inner().into_json()
}

pub async fn init_db(config: &LegendConfig) -> Result<Surreal<Db>> {
    let db = if config.in_memory {
        info!("Legend BaaS starting with in-memory SurrealDB engine");
        Surreal::new::<Mem>(()).await?
    } else {
        if let Some(parent) = std::path::Path::new(&config.data_path).parent() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("creating data dir {}", parent.display()))?;
        }
        info!(
            "Legend BaaS starting with persistent SurrealKV engine at {}",
            config.data_path
        );
        Surreal::new::<SurrealKv>(config.data_path.as_str()).await?
    };
    db.use_ns("sovereign").use_db("operational").await?;
    Ok(db)
}

pub fn create_router(state: AppState, cors_origins: &[String]) -> Router {
    let origins: Vec<HeaderValue> = cors_origins
        .iter()
        .filter_map(|o| HeaderValue::from_str(o).ok())
        .collect();
    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::list(origins))
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION]);

    let records = Router::new()
        .route(
            "/api/v1/records/:table",
            post(create_record).get(list_records),
        )
        .route(
            "/api/v1/records/:table/:id",
            get(get_record).put(upsert_record).delete(delete_record),
        )
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            require_service_token,
        ));

    let admin = Router::new()
        .route("/api/v1/query", post(execute_raw_surql))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            require_admin_token,
        ));

    Router::new()
        .route("/health", get(health_check))
        .route("/api/v1/meta", get(get_metadata))
        .merge(records)
        .merge(admin)
        .layer(cors)
        .with_state(state)
}

async fn health_check(State(state): State<AppState>) -> impl IntoResponse {
    let db_ok = state.db.health().await.is_ok();
    let status = if db_ok {
        StatusCode::OK
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    };
    (
        status,
        Json(json!({
            "status": if db_ok { "ok" } else { "degraded" },
            "service": "legend-baas",
            "engine": "surrealdb",
            "version": env!("CARGO_PKG_VERSION"),
            "timestamp": Utc::now()
        })),
    )
}

async fn get_metadata() -> impl IntoResponse {
    Json(json!({
        "name": "LEGEND // SOVEREIGN RUST BAAS",
        "version": env!("CARGO_PKG_VERSION"),
        "database": "SurrealDB",
        "namespace": "sovereign",
        "database_name": "operational",
        "auth": { "records": "bearer service token", "query": "bearer admin token" },
        "target_workloads": [
            "ARSY Network Orchestration",
            "PPPoE & RADIUS High-Cadence Telemetry",
            "E-ISP Edge Mesh Real-Time Metrics",
            "Native Git Engine Audit & Event Sinks"
        ]
    }))
}

fn validate_path(table: &str, id: Option<&str>) -> Result<(), ApiError> {
    if !is_valid_identifier(table) {
        return Err(api_error(StatusCode::BAD_REQUEST, "invalid table name"));
    }
    if let Some(id) = id {
        if !is_valid_identifier(id) {
            return Err(api_error(StatusCode::BAD_REQUEST, "invalid record id"));
        }
    }
    Ok(())
}

async fn write_record(
    state: &AppState,
    table: &str,
    id: &str,
    payload: JsonValue,
) -> Result<JsonValue, ApiError> {
    let document = json!({
        "record_id": id,
        "table_name": table,
        "payload": payload,
        "updated_at": Utc::now().to_rfc3339(),
    });
    let mut response = state
        .db
        .query("UPSERT type::thing($tb, $id) CONTENT $doc RETURN AFTER")
        .bind(("tb", table.to_string()))
        .bind(("id", id.to_string()))
        .bind(("doc", document))
        .await
        .map_err(db_error)?;
    let written: surrealdb::Value = response.take(0).map_err(db_error)?;
    Ok(first_or_self(surreal_to_json(written)))
}

fn first_or_self(value: JsonValue) -> JsonValue {
    match value {
        JsonValue::Array(mut rows) if rows.len() == 1 => rows.remove(0),
        other => other,
    }
}

async fn create_record(
    State(state): State<AppState>,
    Path(table): Path<String>,
    Json(input): Json<RecordInput>,
) -> Result<impl IntoResponse, ApiError> {
    validate_path(&table, None)?;
    let id = Uuid::new_v4().to_string();
    let record = write_record(&state, &table, &id, input.payload).await?;
    Ok((StatusCode::CREATED, Json(record)))
}

async fn upsert_record(
    State(state): State<AppState>,
    Path((table, id)): Path<(String, String)>,
    Json(input): Json<RecordInput>,
) -> Result<impl IntoResponse, ApiError> {
    validate_path(&table, Some(&id))?;
    let record = write_record(&state, &table, &id, input.payload).await?;
    Ok(Json(record))
}

async fn list_records(
    State(state): State<AppState>,
    Path(table): Path<String>,
    Query(params): Query<ListParams>,
) -> Result<impl IntoResponse, ApiError> {
    validate_path(&table, None)?;
    let limit = params.limit.unwrap_or(100).min(MAX_LIST_LIMIT);
    let mut response = state
        .db
        .query("SELECT * FROM type::table($tb) ORDER BY updated_at DESC LIMIT $limit")
        .bind(("tb", table))
        .bind(("limit", limit))
        .await
        .map_err(db_error)?;
    let rows: surrealdb::Value = response.take(0).map_err(db_error)?;
    Ok(Json(surreal_to_json(rows)))
}

async fn get_record(
    State(state): State<AppState>,
    Path((table, id)): Path<(String, String)>,
) -> Result<impl IntoResponse, ApiError> {
    validate_path(&table, Some(&id))?;
    let mut response = state
        .db
        .query("SELECT * FROM type::thing($tb, $id)")
        .bind(("tb", table))
        .bind(("id", id))
        .await
        .map_err(db_error)?;
    let rows: surrealdb::Value = response.take(0).map_err(db_error)?;
    match surreal_to_json(rows) {
        JsonValue::Array(mut rows) if !rows.is_empty() => Ok(Json(rows.remove(0))),
        _ => Err(api_error(StatusCode::NOT_FOUND, "record not found")),
    }
}

async fn delete_record(
    State(state): State<AppState>,
    Path((table, id)): Path<(String, String)>,
) -> Result<impl IntoResponse, ApiError> {
    validate_path(&table, Some(&id))?;
    state
        .db
        .query("DELETE type::thing($tb, $id)")
        .bind(("tb", table))
        .bind(("id", id))
        .await
        .map_err(db_error)?;
    Ok(StatusCode::NO_CONTENT)
}

async fn execute_raw_surql(
    State(state): State<AppState>,
    Json(input): Json<QueryInput>,
) -> Result<impl IntoResponse, ApiError> {
    let mut response = state
        .db
        .query(&input.query)
        .await
        .map_err(|e| api_error(StatusCode::BAD_REQUEST, e.to_string()))?;
    let rows: surrealdb::Value = response
        .take(0)
        .map_err(|e| api_error(StatusCode::BAD_REQUEST, e.to_string()))?;
    Ok(Json(surreal_to_json(rows)))
}

fn run_healthcheck() -> Result<()> {
    let port: u16 = std::env::var("LEGEND_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8092);
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    let mut stream = TcpStream::connect_timeout(&addr, Duration::from_secs(3))?;
    stream.set_read_timeout(Some(Duration::from_secs(3)))?;
    stream.write_all(b"GET /health HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n")?;
    let mut reply = String::new();
    stream.read_to_string(&mut reply)?;
    if reply.starts_with("HTTP/1.1 200") {
        Ok(())
    } else {
        bail!("unhealthy: {}", reply.lines().next().unwrap_or_default())
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    if std::env::args().nth(1).as_deref() == Some("healthcheck") {
        return run_healthcheck();
    }

    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "legend=info,tower_http=info".into()),
        )
        .init();

    let config = LegendConfig::from_env()?;
    let db = init_db(&config).await?;
    let state = AppState {
        db: Arc::new(db),
        service_token: Arc::new(config.service_token.clone()),
        admin_token: Arc::new(config.admin_token.clone()),
    };

    let app = create_router(state, &config.cors_origins);
    let addr: SocketAddr = format!("{}:{}", config.host, config.port)
        .parse()
        .context("invalid LEGEND_HOST/LEGEND_PORT")?;
    info!(
        "LEGEND BAAS (SurrealDB + Rust) listening on http://{}",
        addr
    );

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app)
        .with_graceful_shutdown(async {
            tokio::signal::ctrl_c().await.ok();
        })
        .await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::{to_bytes, Body};
    use tower::ServiceExt;

    const SERVICE: &str = "service-token-0123456789abcdef0123456789";
    const ADMIN: &str = "admin-token-0123456789abcdef0123456789abc";

    async fn test_app() -> Router {
        let db = Surreal::new::<Mem>(()).await.expect("mem db");
        db.use_ns("test").use_db("test").await.expect("ns");
        let state = AppState {
            db: Arc::new(db),
            service_token: Arc::new(SERVICE.to_string()),
            admin_token: Arc::new(ADMIN.to_string()),
        };
        create_router(state, &[])
    }

    async fn send(
        app: &Router,
        method: &str,
        uri: &str,
        token: Option<&str>,
        body: Option<JsonValue>,
    ) -> (StatusCode, JsonValue) {
        let mut builder = axum::http::Request::builder().method(method).uri(uri);
        if let Some(token) = token {
            builder = builder.header(header::AUTHORIZATION, format!("Bearer {token}"));
        }
        let request = match body {
            Some(body) => builder
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(body.to_string())),
            None => builder.body(Body::empty()),
        }
        .expect("request");
        let response = app.clone().oneshot(request).await.expect("response");
        let status = response.status();
        let bytes = to_bytes(response.into_body(), usize::MAX)
            .await
            .expect("body");
        let parsed = serde_json::from_slice(&bytes).unwrap_or(JsonValue::Null);
        (status, parsed)
    }

    #[test]
    fn identifier_validation_rejects_injection() {
        assert!(is_valid_identifier("pppoe_sessions"));
        assert!(is_valid_identifier("3f1c-uuid"));
        assert!(!is_valid_identifier(""));
        assert!(!is_valid_identifier("x; REMOVE DATABASE operational"));
        assert!(!is_valid_identifier("table:id"));
    }

    #[test]
    fn constant_time_eq_matches_only_identical() {
        assert!(constant_time_eq(b"abc", b"abc"));
        assert!(!constant_time_eq(b"abc", b"abd"));
        assert!(!constant_time_eq(b"abc", b"abcd"));
    }

    #[tokio::test]
    async fn records_require_service_token() {
        let app = test_app().await;
        let (status, _) = send(&app, "GET", "/api/v1/records/pppoe_sessions", None, None).await;
        assert_eq!(status, StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn raw_query_requires_admin_token() {
        let app = test_app().await;
        let (status, _) = send(
            &app,
            "POST",
            "/api/v1/query",
            Some(SERVICE),
            Some(json!({ "query": "INFO FOR DB" })),
        )
        .await;
        assert_eq!(status, StatusCode::FORBIDDEN);
        let (status, _) = send(
            &app,
            "POST",
            "/api/v1/query",
            Some(ADMIN),
            Some(json!({ "query": "RETURN 1" })),
        )
        .await;
        assert_eq!(status, StatusCode::OK);
    }

    #[tokio::test]
    async fn upsert_is_idempotent_by_id() {
        let app = test_app().await;
        let uri = "/api/v1/records/pppoe_sessions/session-1";
        let (status, _) = send(
            &app,
            "PUT",
            uri,
            Some(SERVICE),
            Some(json!({ "payload": { "status": "active" } })),
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        let (status, _) = send(
            &app,
            "PUT",
            uri,
            Some(SERVICE),
            Some(json!({ "payload": { "status": "terminated" } })),
        )
        .await;
        assert_eq!(status, StatusCode::OK);

        let (status, rows) = send(
            &app,
            "GET",
            "/api/v1/records/pppoe_sessions",
            Some(SERVICE),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        let rows = rows.as_array().expect("array");
        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0]["payload"]["status"], "terminated");

        let (status, record) = send(&app, "GET", uri, Some(SERVICE), None).await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(record["record_id"], "session-1");
    }

    #[tokio::test]
    async fn health_is_public() {
        let app = test_app().await;
        let (status, body) = send(&app, "GET", "/health", None, None).await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(body["status"], "ok");
    }
}
