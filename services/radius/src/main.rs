use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;

use anyhow::Result;
use bytes::BytesMut;
use clap::Parser;
use config::{Config, File, Environment};
use dashmap::DashMap;
use parking_lot::RwLock;
use radius_tokio::{RadiusClient, RadiusServer, RadiusPacket, RadiusCodec, AttributeType, AttributeValue, VendorId, VendorSpecific};
use radius_tokio::attributes::*;
use reqwest::Client as HttpClient;
use serde::{Deserialize, Serialize};
use tokio::net::UdpSocket;
use tokio::sync::mpsc;
use tokio::time::interval;
use tracing::{info, warn, error, debug};
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Configuration for the RADIUS service
#[derive(Debug, Clone, Deserialize, Serialize)]
struct Config {
    radius: RadiusConfig,
    arsy: ArsyConfig,
    isp: IspConfig,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct RadiusConfig {
    bind_addr: String,
    secret: String,
    auth_port: u16,
    acct_port: u16,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct ArsyConfig {
    endpoint: String,
    client_name: String,
    heartbeat_interval_secs: u64,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct IspConfig {
    endpoint: String,
    api_key: String,
}

/// RADIUS packet types we handle
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum RadiusPacketType {
    AccessRequest = 1,
    AccessAccept = 2,
    AccessReject = 3,
    AccountingRequest = 4,
    AccountingResponse = 5,
}

/// PPPoE session state
#[derive(Debug, Clone, Serialize, Deserialize)]
struct PppoeSession {
    id: Uuid,
    username: String,
    nas_ip: String,
    nas_port: String,
    called_station_id: Option<String>,
    calling_station_id: Option<String>,
    framed_ip_address: Option<String>,
    framed_ipv6_prefix: Option<String>,
    session_start: DateTime<Utc>,
    last_update: DateTime<Utc>,
    status: SessionStatus,
    acct_session_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
enum SessionStatus {
    Active,
    Terminated,
    Pending,
}

/// Shared state for sessions
type SessionStore = Arc<DashMap<String, PppoeSession>>;

/// ARSY API client
#[derive(Clone)]
struct ArsyClient {
    http: HttpClient,
    base_url: String,
    client_name: String,
    controller_id: Option<String>,
}

impl ArsyClient {
    fn new(base_url: String, client_name: String) -> Self {
        Self {
            http: HttpClient::new(),
            base_url,
            client_name,
            controller_id: None,
        }
    }

    async fn register_controller(&mut self) -> Result<()> {
        let url = format!(\"{}/api/v1/controllers\", self.base_url);
        let body = serde_json::json!({
            \"name\": self.client_name,
            \"endpoint\": format!(\"http://{}:{}\", \"0.0.0.0\", 1812)
        });
        let resp = self.http.post(&url).json(&body).send().await?;
        if resp.status().is_success() {
            info!(\"Registered with ARSY as {}\", self.client_name);
        } else {
            warn!(\"Failed to register with ARSY: {}\", resp.status());
        }
        Ok(())
    }

    async fn heartbeat(&self, status: &str) -> Result<()> {
        let url = format!(\"{}/api/v1/controllers/{}/heartbeat\", self.base_url, self.client_name);
        let body = serde_json::json!({ \"status\": status });
        let resp = self.http.post(&url).json(&body).send().await?;
        if !resp.status().is_success() {
            warn!(\"Heartbeat failed: {}\", resp.status());
        }
        Ok(())
    }

    async fn notify_session_created(&self, session: &PppoeSession) -> Result<()> {
        let url = format!(\"{}/api/v1/pppoe/sessions\", self.base_url);
        let body = serde_json::json!({
            \"id\": session.id,
            \"username\": session.username,
            \"nas_ip\": session.nas_ip,
            \"nas_port\": session.nas_port,
            \"called_station_id\": session.called_station_id,
            \"calling_station_id\": session.calling_station_id,
            \"framed_ip_address\": session.framed_ip_address,
            \"framed_ipv6_prefix\": session.framed_ipv6_prefix,
            \"session_start\": session.session_start,
            \"status\": session.status,
            \"acct_session_id\": session.acct_session_id,
        });
        let resp = self.http.post(&url).json(&body).send().await?;
        if !resp.status().is_success() {
            warn!(\"Failed to notify ARSY of session creation: {}\", resp.status());
        }
        Ok(())
    }

    async fn notify_session_terminated(&self, session_id: &str) -> Result<()> {
        let url = format!(\"{}/api/v1/pppoe/sessions/{}/terminate\", self.base_url, session_id);
        let resp = self.http.post(&url).send().await?;
        if !resp.status().is_success() {
            warn!(\"Failed to notify ARSY of session termination: {}\", resp.status());
        }
        Ok(())
    }

    async fn notify_accounting_update(&self, session: &PppoeSession) -> Result<()> {
        let url = format!(\"{}/api/v1/pppoe/sessions/{}/accounting\", self.base_url, session.id);
        let body = serde_json::json!({
            \"framed_ip_address\": session.framed_ip_address,
            \"framed_ipv6_prefix\": session.framed_ipv6_prefix,
            \"last_update\": session.last_update,
            \"status\": session.status,
        });
        let resp = self.http.post(&url).json(&body).send().await?;
        if !resp.status().is_success() {
            warn!(\"Failed to send accounting update to ARSY: {}\", resp.status());
        }
        Ok(())
    }
}

/// ISP API client for e-isp communication
#[derive(Clone)]
struct IspClient {
    http: HttpClient,
    base_url: String,
    api_key: String,
}

impl IspClient {
    fn new(base_url: String, api_key: String) -> Self {
        Self {
            http: HttpClient::new(),
            base_url,
            api_key,
        }
    }

    async fn authenticate_user(&self, username: &str, password: &str) -> Result<AuthResult> {
        let url = format!(\"{}/api/v1/auth/authenticate\", self.base_url);
        let body = serde_json::json!({
            \"username\": username,
            \"password\": password
        });
        let resp = self.http
            .post(&url)
            .header(\"Authorization\", format!(\"Bearer {}\", self.api_key))
            .json(&body)
            .send()
            .await?;
        
        if resp.status().is_success() {
            let result: AuthResult = resp.json().await?;
            Ok(result)
        } else {
            let err: serde_json::Value = resp.json().await.unwrap_or_default();
            Err(anyhow::anyhow!(\"ISP auth failed: {:?}\", err))
        }
    }

    async fn authorize_session(&self, username: &str, nas_ip: &str, nas_port: &str) -> Result<AuthorizeResult> {
        let url = format!(\"{}/api/v1/auth/authorize\", self.base_url);
        let body = serde_json::json!({
            \"username\": username,
            \"nas_ip\": nas_ip,
            \"nas_port\": nas_port
        });
        let resp = self.http
            .post(&url)
            .header(\"Authorization\", format!(\"Bearer {}\", self.api_key))
            .json(&body)
            .send()
            .await?;
        
        if resp.status().is_success() {
            let result: AuthorizeResult = resp.json().await?;
            Ok(result)
        } else {
            let err: serde_json::Value = resp.json().await.unwrap_or_default();
            Err(anyhow::anyhow!(\"ISP authorize failed: {:?}\", err))
        }
    }

    async fn accounting_start(&self, session: &PppoeSession) -> Result<()> {
        let url = format!(\"{}/api/v1/accounting/start\", self.base_url);
        let body = serde_json::json!({
            \"username\": session.username,
            \"acct_session_id\": session.acct_session_id,
            \"nas_ip\": session.nas_ip,
            \"nas_port\": session.nas_port,
            \"framed_ip_address\": session.framed_ip_address,
            \"framed_ipv6_prefix\": session.framed_ipv6_prefix,
        });
        let resp = self.http
            .post(&url)
            .header(\"Authorization\", format!(\"Bearer {}\", self.api_key))
            .json(&body)
            .send()
            .await?;
        if !resp.status().is_success() {
            warn!(\"ISP accounting start failed: {}\", resp.status());
        }
        Ok(())
    }

    async fn accounting_stop(&self, session: &PppoeSession) -> Result<()> {
        let url = format!(\"{}/api/v1/accounting/stop\", self.base_url);
        let body = serde_json::json!({
            \"username\": session.username,
            \"acct_session_id\": session.acct_session_id,
            \"nas_ip\": session.nas_ip,
            \"nas_port\": session.nas_port,
        });
        let resp = self.http
            .post(&url)
            .header(\"Authorization\", format!(\"Bearer {}\", self.api_key))
            .json(&body)
            .send()
            .await?;
        if !resp.status().is_success() {
            warn!(\"ISP accounting stop failed: {}\", resp.status());
        }
        Ok(())
    }

    async fn accounting_interim(&self, session: &PppoeSession) -> Result<()> {
        let url = format!(\"{}/api/v1/accounting/interim\", self.base_url);
        let body = serde_json::json!({
            \"username\": session.username,
            \"acct_session_id\": session.acct_session_id,
            \"nas_ip\": session.nas_ip,
            \"nas_port\": session.nas_port,
            \"framed_ip_address\": session.framed_ip_address,
            \"framed_ipv6_prefix\": session.framed_ipv6_prefix,
        });
        let resp = self.http
            .post(&url)
            .header(\"Authorization\", format!(\"Bearer {}\", self.api_key))
            .json(&body)
            .send()
            .await?;
        if !resp.status().is_success() {
            warn!(\"ISP accounting interim failed: {}\", resp.status());
        }
        Ok(())
    }
}

#[derive(Debug, Deserialize, Serialize)]
struct AuthResult {
    authenticated: bool,
    user_id: Option<String>,
    profile: Option<UserProfile>,
    error: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
struct UserProfile {
    id: String,
    username: String,
    speed_limit_down: Option<u64>,
    speed_limit_up: Option<u64>,
    quota_limit: Option<u64>,
    static_ip: Option<String>,
    static_ipv6_prefix: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
struct AuthorizeResult {
    authorized: bool,
    framed_ip_address: Option<String>,
    framed_ipv6_prefix: Option<String>,
    session_timeout: Option<u32>,
    idle_timeout: Option<u32>,
    error: Option<String>,
}

/// RADIUS server handler
struct RadiusServer {
    config: Config,
    sessions: SessionStore,
    arsy_client: ArsyClient,
    isp_client: IspClient,
    secret: String,
}

impl RadiusServer {
    fn new(config: Config) -> Self {
        let sessions = Arc::new(DashMap::new());
        let arsy_client = ArsyClient::new(config.arsy.endpoint.clone(), config.arsy.client_name.clone());
        let isp_client = IspClient::new(config.isp.endpoint.clone(), config.isp.api_key.clone());
        
        Self {
            config,
            sessions,
            arsy_client,
            isp_client,
            secret: config.radius.secret.clone(),
        }
    }

    async fn run(&self) -> Result<()> {
        // Register with ARSY
        let mut arsy_client = self.arsy_client.clone();
        arsy_client.register_controller().await?;

        // Start heartbeat task
        let heartbeat_client = arsy_client.clone();
        let heartbeat_interval = self.config.arsy.heartbeat_interval_secs;
        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(heartbeat_interval));
            loop {
                interval.tick().await;
                if let Err(e) = arsy_client.heartbeat(\"healthy\").await {
                    error!(\"Heartbeat error: {}\", e);
                }
            }
        });

        // Start session cleanup task
        let sessions = self.sessions.clone();
        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(60));
            loop {
                interval.tick().await;
                let now = Utc::now();
                sessions.retain(|_, session| {
                    let timeout = Duration::from_secs(3600); // 1 hour timeout
                    (now - session.last_update).to_std().unwrap_or_default() < timeout
                });
            }
        });

        // Bind UDP sockets for auth and accounting
        let auth_addr: SocketAddr = format!(\"0.0.0.0:{}\", self.config.radius.auth_port).parse()?;
        let acct_addr: SocketAddr = format!(\"0.0.0.0:{}\", self.config.radius.acct_port).parse()?;

        let auth_socket = Arc::new(UdpSocket::bind(auth_addr).await?);
        let acct_socket = Arc::new(UdpSocket::bind(acct_addr).await?);

        info!(\"RADIUS auth server listening on {}\", auth_addr);
        info!(\"RADIUS acct server listening on {}\", acct_addr);

        // Spawn auth handler
        let auth_server = self.clone_for_auth();
        let auth_socket_clone = auth_socket.clone();
        tokio::spawn(async move {
            auth_server.handle_auth(auth_socket_clone).await;
        });

        // Spawn accounting handler
        let acct_server = self.clone_for_acct();
        tokio::spawn(async move {
            acct_server.handle_acct(acct_socket).await;
        });

        // Wait forever
        tokio::signal::ctrl_c().await?;
        info!(\"Shutting down RADIUS server\");

        Ok(())
    }

    fn clone_for_auth(&self) -> RadiusServerAuth {
        RadiusServerAuth {
            config: self.config.clone(),
            sessions: self.sessions.clone(),
            arsy_client: self.arsy_client.clone(),
            isp_client: self.isp_client.clone(),
            secret: self.secret.clone(),
        }
    }

    fn clone_for_acct(&self) -> RadiusServerAcct {
        RadiusServerAcct {
            config: self.config.clone(),
            sessions: self.sessions.clone(),
            arsy_client: self.arsy_client.clone(),
            isp_client: self.isp_client.clone(),
            secret: self.secret.clone(),
        }
    }
}

/// Auth handler (Access-Request/Access-Accept/Access-Reject)
struct RadiusServerAuth {
    config: Config,
    sessions: SessionStore,
    arsy_client: ArsyClient,
    isp_client: IspClient,
    secret: String,
}

impl RadiusServerAuth {
    async fn handle_auth(self, socket: Arc<UdpSocket>) {
        let mut buf = vec![0u8; 4096];
        loop {
            match socket.recv_from(&mut buf).await {
                Ok((len, src)) => {
                    let packet_data = &buf[..len];
                    if let Err(e) = self.process_access_request(packet_data, src, &socket).await {
                        error!(\"Error processing auth packet from {}: {}\", src, e);
                    }
                }
                Err(e) => {
                    error!(\"UDP recv error: {}\", e);
                }
            }
        }
    }

    async fn process_access_request(&self, data: &[u8], src: SocketAddr, socket: &UdpSocket) -> Result<()> {
        // Parse RADIUS packet
        let packet = RadiusPacket::from_bytes(data, &self.secret)?;
        
        if packet.code != RadiusPacketType::AccessRequest as u8 {
            debug!(\"Ignoring non-Access-Request packet: {}\", packet.code);
            return Ok(());
        }

        // Extract attributes
        let username = packet.get_attribute(AttributeType::UserName)
            .and_then(|v| v.as_string())
            .unwrap_or_default();
        let user_password = packet.get_attribute(AttributeType::UserPassword)
            .and_then(|v| v.as_string())
            .unwrap_or_default();
        let nas_ip = packet.get_attribute(AttributeType::NASIpAddress)
            .and_then(|v| v.as_string())
            .unwrap_or_default();
        let nas_port = packet.get_attribute(AttributeType::NASPort)
            .and_then(|v| v.as_string())
            .unwrap_or_default();
        let called_station_id = packet.get_attribute(AttributeType::CalledStationId)
            .and_then(|v| v.as_string());
        let calling_station_id = packet.get_attribute(AttributeType::CallingStationId)
            .and_then(|v| v.as_string());

        info!(\"Access-Request: user={}, nas_ip={}, nas_port={}\", username, nas_ip, nas_port);

        // Authenticate with ISP
        let auth_result = self.isp_client.authenticate_user(&username, &user_password).await?;

        let response_code = if auth_result.authenticated {
            RadiusPacketType::AccessAccept as u8
        } else {
            RadiusPacketType::AccessReject as u8
        };

        // If authenticated, authorize and create session
        let mut reply_attrs = Vec::new();
        if auth_result.authenticated {
            if let Some(profile) = auth_result.profile {
                // Authorize with ISP for IP assignment
                let authz = self.isp_client.authorize_session(&username, &nas_ip, &nas_port).await?;
                
                if authz.authorized {
                    // Create PPPoE session
                    let session = PppoeSession {
                        id: Uuid::new_v4(),
                        username: username.clone(),
                        nas_ip: nas_ip.clone(),
                        nas_port: nas_port.clone(),
                        called_station_id: called_station_id.clone(),
                        calling_station_id: calling_station_id.clone(),
                        framed_ip_address: authz.framed_ip_address.clone(),
                        framed_ipv6_prefix: authz.framed_ipv6_prefix.clone(),
                        session_start: Utc::now(),
                        last_update: Utc::now(),
                        status: SessionStatus::Active,
                        acct_session_id: format!(\"{}{}\", nas_port, Utc::now().timestamp()),
                    };

                    // Add RADIUS reply attributes
                    if let Some(ip) = &authz.framed_ip_address {
                        reply_attrs.push((AttributeType::FramedIpAddress, AttributeValue::String(ip.clone())));
                    }
                    if let Some(prefix) = &authz.framed_ipv6_prefix {
                        reply_attrs.push((AttributeType::FramedIpv6Prefix, AttributeValue::String(prefix.clone())));
                    }
                    if let Some(timeout) = authz.session_timeout {
                        reply_attrs.push((AttributeType::SessionTimeout, AttributeValue::Integer(timeout as i32)));
                    }
                    if let Some(idle) = authz.idle_timeout {
                        reply_attrs.push((AttributeType::IdleTimeout, AttributeValue::Integer(idle as i32)));
                    }
                    if let Some(speed_down) = profile.speed_limit_down {
                        // WISPr attributes are vendor-specific (vendor 14122)
                        reply_attrs.push((
                            AttributeType::VendorSpecific,
                            AttributeValue::VendorSpecific(VendorSpecific {
                                vendor_id: VendorId(14122),
                                vendor_type: 1, // WISPr-Bandwidth-Max-Down
                                value: BytesMut::from((speed_down as u32).to_be_bytes().as_ref()),
                            })
                        ));
                    }
                    if let Some(speed_up) = profile.speed_limit_up {
                        reply_attrs.push((
                            AttributeType::VendorSpecific,
                            AttributeValue::VendorSpecific(VendorSpecific {
                                vendor_id: VendorId(14122),
                                vendor_type: 2, // WISPr-Bandwidth-Max-Up
                                value: BytesMut::from((speed_up as u32).to_be_bytes().as_ref()),
                            })
                        ));
                    }

                    // Store session
                    self.sessions.insert(session.acct_session_id.clone(), session.clone());
                    
                    // Notify ARSY
                    self.arsy_client.notify_session_created(&session).await?;
                    
                    // Notify ISP accounting start
                    self.isp_client.accounting_start(&session).await?;

                    info!(\"Session created for user: {}\", username);
                } else {
                    return self.send_reject(socket, &packet, src, authz.error.unwrap_or(\"Authorization failed\")).await;
                }
            }
        } else {
            return self.send_reject(socket, &packet, src, auth_result.error.unwrap_or(\"Authentication failed\")).await;
        }

        // Send Access-Accept
        let reply = RadiusPacket::new(
            response_code,
            packet.identifier,
            reply_attrs,
            &self.secret
        );
        let buf = reply.to_bytes()?;
        socket.send_to(&buf, src).await?;
        
        debug!(\"Sent Access-Accept to {}\", src);
        Ok(())
    }

    async fn send_reject(&self, socket: &UdpSocket, request: &RadiusPacket, src: SocketAddr, message: &str) -> Result<()> {
        let attrs = vec![(AttributeType::ReplyMessage, AttributeValue::String(message.to_string()))];
        let reply = RadiusPacket::new(
            RadiusPacketType::AccessReject as u8,
            request.identifier,
            attrs,
            &self.secret
        );
        let buf = reply.to_bytes()?;
        socket.send_to(&buf, src).await?;
        Ok(())
    }
}

/// Accounting handler (Accounting-Request/Accounting-Response)
struct RadiusServerAcct {
    config: Config,
    sessions: SessionStore,
    arsy_client: ArsyClient,
    isp_client: IspClient,
    secret: String,
}

impl RadiusServerAcct {
    async fn handle_acct(self, socket: Arc<UdpSocket>) {
        let mut buf = vec![0u8; 4096];
        loop {
            match socket.recv_from(&mut buf).await {
                Ok((len, src)) => {
                    let packet_data = &buf[..len];
                    if let Err(e) = self.process_accounting_request(packet_data, src, &socket).await {
                        error!(\"Error processing acct packet from {}: {}\", src, e);
                    }
                }
                Err(e) => {
                    error!(\"UDP recv error: {}\", e);
                }
            }
        }
    }

    async fn process_accounting_request(&self, data: &[u8], src: SocketAddr, socket: &UdpSocket) -> Result<()> {
        let packet = RadiusPacket::from_bytes(data, &self.secret)?;
        
        if packet.code != RadiusPacketType::AccountingRequest as u8 {
            debug!(\"Ignoring non-Accounting-Request packet: {}\", packet.code);
            return Ok(());
        }

        let acct_status_type = packet.get_attribute(AttributeType::AcctStatusType)
            .and_then(|v| v.as_integer())
            .unwrap_or(0);
        let username = packet.get_attribute(AttributeType::UserName)
            .and_then(|v| v.as_string())
            .unwrap_or_default();
        let acct_session_id = packet.get_attribute(AttributeType::AcctSessionId)
            .and_then(|v| v.as_string())
            .unwrap_or_default();
        let nas_ip = packet.get_attribute(AttributeType::NASIpAddress)
            .and_then(|v| v.as_string())
            .unwrap_or_default();
        let nas_port = packet.get_attribute(AttributeType::NASPort)
            .and_then(|v| v.as_string())
            .unwrap_or_default();
        let framed_ip = packet.get_attribute(AttributeType::FramedIpAddress)
            .and_then(|v| v.as_string());
        let framed_ipv6_prefix = packet.get_attribute(AttributeType::FramedIpv6Prefix)
            .and_then(|v| v.as_string());

        info!(\"Accounting-Request: user={}, session={}, type={}\", username, acct_session_id, acct_status_type);

        // Update or create session
        let mut session = self.sessions.entry(acct_session_id.clone())
            .or_insert_with(|| PppoeSession {
                id: Uuid::new_v4(),
                username: username.clone(),
                nas_ip: nas_ip.clone(),
                nas_port: nas_port.clone(),
                called_station_id: None,
                calling_station_id: None,
                framed_ip_address: framed_ip.clone(),
                framed_ipv6_prefix: framed_ipv6_prefix.clone(),
                session_start: Utc::now(),
                last_update: Utc::now(),
                status: SessionStatus::Pending,
                acct_session_id: acct_session_id.clone(),
            });

        session.last_update = Utc::now();
        if let Some(ip) = framed_ip {
            session.framed_ip_address = Some(ip);
        }
        if let Some(prefix) = framed_ipv6_prefix {
            session.framed_ipv6_prefix = Some(prefix);
        }

        match acct_status_type {
            1 => { // Start
                session.status = SessionStatus::Active;
                self.isp_client.accounting_start(&session).await?;
                self.arsy_client.notify_accounting_update(&session).await?;
            }
            2 => { // Stop
                session.status = SessionStatus::Terminated;
                self.isp_client.accounting_stop(&session).await?;
                self.arsy_client.notify_session_terminated(&session.id.to_string()).await?;
                self.sessions.remove(&acct_session_id);
            }
            3 => { // Interim-Update
                self.isp_client.accounting_interim(&session).await?;
                self.arsy_client.notify_accounting_update(&session).await?;
            }
            _ => {
                warn!(\"Unknown Acct-Status-Type: {}\", acct_status_type);
            }
        }

        // Send Accounting-Response
        let reply = RadiusPacket::new(
            RadiusPacketType::AccountingResponse as u8,
            packet.identifier,
            vec![],
            &self.secret
        );
        let buf = reply.to_bytes()?;
        socket.send_to(&buf, src).await?;

        debug!(\"Sent Accounting-Response to {}\", src);
        Ok(())
    }
}

#[derive(Parser, Debug)]
#[command(name = \"radius\", version, about = \"RADIUS server for PPPoE ISP\")]
struct Args {
    #[arg(short, long, default_value = \"config.toml\")]
    config: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let args = Args::parse();

    let config = Config::builder()
        .add_source(File::with_name(&args.config).required(false))
        .add_source(Environment::with_prefix(\"RADIUS\").separator(\"__\"))
        .add_source(Environment::with_prefix(\"ARSY\").separator(\"__\"))
        .add_source(Environment::with_prefix(\"ISP\").separator(\"__\"))
        .build()?
        .try_deserialize::<Config>()?;

    let server = RadiusServer::new(config);
    server.run().await?;

    Ok(())
}
