use anyhow::Result;
use chrono::{DateTime, Utc};
use clap::Parser;
use config::{Config, Environment, File};
use dashmap::DashMap;
use reqwest::Client as HttpClient;
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;
use tokio::net::UdpSocket;
use tokio::time::interval;
use tracing::{debug, error, info, warn};
use uuid::Uuid;

// ===== Configuration =====

#[derive(Debug, Clone, Deserialize, Serialize)]
struct AppSettings {
    radius: RadiusSettings,
    arsy: ArsySettings,
    isp: IspSettings,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct RadiusSettings {
    secret: String,
    auth_port: u16,
    acct_port: u16,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct ArsySettings {
    endpoint: String,
    client_name: String,
    heartbeat_interval_secs: u64,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct IspSettings {
    endpoint: String,
    api_key: String,
}

// ===== Session State =====

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

type SessionStore = Arc<DashMap<String, PppoeSession>>;

// ===== RADIUS Wire Protocol (minimal) =====

mod wire {
    pub const ACCESS_REQUEST: u8 = 1;
    pub const ACCESS_ACCEPT: u8 = 2;
    pub const ACCESS_REJECT: u8 = 3;
    pub const ACCOUNTING_REQUEST: u8 = 4;
    pub const ACCOUNTING_RESPONSE: u8 = 5;

    // Attribute types
    pub const REPLY_MESSAGE: u8 = 18;
    pub const USER_NAME: u8 = 1;
    pub const USER_PASSWORD: u8 = 2;
    pub const NAS_IP_ADDRESS: u8 = 4;
    pub const NAS_PORT: u8 = 5;
    pub const FRAMED_IP_ADDRESS: u8 = 8;
    pub const FRAMED_IP_NETMASK: u8 = 9;
    pub const SESSION_TIMEOUT: u8 = 27;
    pub const IDLE_TIMEOUT: u8 = 28;
    pub const CALLED_STATION_ID: u8 = 30;
    pub const CALLING_STATION_ID: u8 = 31;
    pub const ACCT_STATUS_TYPE: u8 = 40;
    pub const ACCT_SESSION_ID: u8 = 44;
    pub const FRAMED_IPV6_PREFIX: u8 = 81;
    pub const VENDOR_SPECIFIC: u8 = 27;
    pub const WISPR_VENDOR_ID: u32 = 14122;

    #[derive(Debug, Clone)]
    pub struct Attr {
        pub ty: u8,
        pub val: Vec<u8>,
    }

    impl Attr {
        pub fn str_val(ty: u8, s: &str) -> Self {
            Self {
                ty,
                val: s.as_bytes().to_vec(),
            }
        }
        pub fn u32_val(ty: u8, v: u32) -> Self {
            Self {
                ty,
                val: v.to_be_bytes().to_vec(),
            }
        }
        pub fn to_str(&self) -> String {
            String::from_utf8_lossy(&self.val).to_string()
        }
        pub fn to_u32(&self) -> Option<u32> {
            if self.val.len() == 4 {
                Some(u32::from_be_bytes([
                    self.val[0],
                    self.val[1],
                    self.val[2],
                    self.val[3],
                ]))
            } else {
                None
            }
        }
    }

    #[derive(Debug, Clone)]
    pub struct RPacket {
        pub code: u8,
        pub identifier: u8,
        pub attrs: Vec<Attr>,
    }

    impl RPacket {
        pub fn get(&self, ty: u8) -> Option<&Attr> {
            self.attrs.iter().find(|a| a.ty == ty)
        }
        pub fn get_str(&self, ty: u8) -> Option<String> {
            self.get(ty).map(|a| a.to_str())
        }
        pub fn get_u32(&self, ty: u8) -> Option<u32> {
            self.get(ty).and_then(|a| a.to_u32())
        }
    }

    pub fn md5_hash(data: &[u8]) -> [u8; 16] {
        let d = md5::compute(data).0;
        let mut out = [0u8; 16];
        out.copy_from_slice(&d);
        out
    }

    pub fn decode(data: &[u8], secret: &[u8]) -> Result<RPacket, String> {
        if data.len() < 20 {
            return Err(format!("packet too short: {}", data.len()));
        }
        let code = data[0];
        let identifier = data[1];
        let length = u16::from_be_bytes([data[2], data[3]]) as usize;
        if length < 20 || length > data.len() {
            return Err(format!("bad length {}", length));
        }
        let request_auth = &data[4..20];
        // Verify MD5: hash(code|id|len|0*16|attrs|secret)
        let mut check = Vec::with_capacity(20 + length - 20 + secret.len());
        check.extend_from_slice(&data[0..4]);
        check.extend(std::iter::repeat_n(0u8, 16));
        check.extend_from_slice(&data[20..length]);
        check.extend_from_slice(secret);
        let computed = md5_hash(&check);
        if request_auth != computed {
            return Err("bad authenticator".into());
        }
        let mut attrs = Vec::new();
        let mut pos = 20usize;
        while pos + 2 <= length {
            let aty = data[pos];
            let alen = data[pos + 1] as usize;
            if alen < 2 || pos + alen > length {
                return Err("malformed attribute".into());
            }
            attrs.push(Attr {
                ty: aty,
                val: data[pos + 2..pos + alen].to_vec(),
            });
            pos += alen;
        }
        Ok(RPacket {
            code,
            identifier,
            attrs,
        })
    }

    pub fn encode(
        code: u8,
        identifier: u8,
        attrs: &[Attr],
        request_auth: Option<&[u8; 16]>,
        secret: &[u8],
    ) -> Vec<u8> {
        let total_len: usize = 20 + attrs.iter().map(|a| a.val.len() + 2).sum::<usize>();
        let mut packet = vec![0u8; total_len];
        packet[0] = code;
        packet[1] = identifier;
        packet[2..4].copy_from_slice(&(total_len as u16).to_be_bytes());
        let auth_region = &mut packet[4..20];
        if let Some(ra) = request_auth {
            auth_region.copy_from_slice(ra);
        }
        let mut pos = 20usize;
        for attr in attrs {
            packet[pos] = attr.ty;
            packet[pos + 1] = (attr.val.len() + 2) as u8;
            packet[pos + 2..pos + 2 + attr.val.len()].copy_from_slice(&attr.val);
            pos += 2 + attr.val.len();
        }
        // Compute MD5: hash(code|id|len|auth|attrs|secret)
        let mut check = Vec::with_capacity(total_len + secret.len());
        check.extend_from_slice(&packet[..total_len]);
        check.extend_from_slice(secret);
        let hash = md5_hash(&check);
        packet[4..20].copy_from_slice(&hash);
        packet
    }

    pub fn wispr_attr(vendor_attr_type: u8, value: u64) -> Attr {
        let mut inner = vec![0u8; 6];
        inner[0..4].copy_from_slice(&WISPR_VENDOR_ID.to_be_bytes());
        inner[4] = vendor_attr_type;
        inner[5] = 4; // length
        let mut val = Vec::new();
        val.extend_from_slice(&inner);
        val.extend_from_slice(&value.to_be_bytes());
        Attr {
            ty: VENDOR_SPECIFIC,
            val,
        }
    }
}

// ===== ARSY Client =====

#[derive(Clone)]
struct ArsyClient {
    http: HttpClient,
    base_url: String,
    client_name: String,
}

impl ArsyClient {
    fn new(s: &ArsySettings) -> Self {
        let mut headers = reqwest::header::HeaderMap::new();
        match std::env::var("ARSY_SERVICE_TOKEN") {
            Ok(token) => {
                if let Ok(value) =
                    reqwest::header::HeaderValue::from_str(&format!("Bearer {token}"))
                {
                    headers.insert(reqwest::header::AUTHORIZATION, value);
                }
            }
            Err(_) => warn!("ARSY_SERVICE_TOKEN not set; ARSY write calls will be rejected"),
        }
        let http = HttpClient::builder()
            .default_headers(headers)
            .build()
            .unwrap_or_else(|_| HttpClient::new());
        Self {
            http,
            base_url: s.endpoint.clone(),
            client_name: s.client_name.clone(),
        }
    }

    async fn register(&self) -> Result<()> {
        let url = format!("{}/api/v1/controllers", self.base_url);
        let body =
            serde_json::json!({ "name": self.client_name, "endpoint": "radius://localhost" });
        let resp = self.http.post(&url).json(&body).send().await?;
        if resp.status().is_success() {
            info!("registered with ARSY as {}", self.client_name);
        } else {
            warn!("failed to register ARSY: {}", resp.status());
        }
        Ok(())
    }

    async fn heartbeat(&self) -> Result<()> {
        let url = format!("{}/api/v1/controllers", self.base_url);
        let resp = self.http.get(&url).send().await?;
        let list: Vec<serde_json::Value> = resp.json().await?;
        let id = list
            .iter()
            .find(|c| c.get("name").and_then(|n| n.as_str()) == Some(self.client_name.as_str()))
            .and_then(|c| c.get("id").and_then(|i| i.as_str()).map(String::from));
        let id = match id {
            Some(id) => id,
            None => {
                self.register().await?;
                return Ok(());
            }
        };
        let url = format!("{}/api/v1/controllers/{}/heartbeat", self.base_url, id);
        let body = serde_json::json!({ "status": "healthy" });
        let resp = self.http.post(&url).json(&body).send().await?;
        if !resp.status().is_success() {
            warn!("ARSY heartbeat failed: {}", resp.status());
        }
        Ok(())
    }

    async fn session_created(&self, s: &PppoeSession) -> Result<()> {
        let url = format!("{}/api/v1/pppoe/sessions", self.base_url);
        let body = serde_json::json!({
            "id": s.id, "username": s.username, "nas_ip": s.nas_ip, "nas_port": s.nas_port,
            "called_station_id": s.called_station_id, "calling_station_id": s.calling_station_id,
            "framed_ip_address": s.framed_ip_address, "framed_ipv6_prefix": s.framed_ipv6_prefix,
            "session_start": s.session_start, "status": s.status, "acct_session_id": s.acct_session_id
        });
        let resp = self.http.post(&url).json(&body).send().await?;
        if !resp.status().is_success() {
            warn!("ARSY session create failed: {}", resp.status());
        }
        Ok(())
    }

    async fn session_terminated(&self, s: &PppoeSession) -> Result<()> {
        let url = format!("{}/api/v1/pppoe/sessions/{}/terminate", self.base_url, s.id);
        let resp = self.http.post(&url).send().await?;
        if !resp.status().is_success() {
            warn!("ARSY session terminate failed: {}", resp.status());
        }
        Ok(())
    }

    async fn accounting_update(&self, s: &PppoeSession) -> Result<()> {
        let url = format!(
            "{}/api/v1/pppoe/sessions/{}/accounting",
            self.base_url, s.id
        );
        let body = serde_json::json!({
            "framed_ip_address": s.framed_ip_address, "framed_ipv6_prefix": s.framed_ipv6_prefix,
            "last_update": s.last_update, "status": s.status
        });
        let resp = self.http.post(&url).json(&body).send().await?;
        if !resp.status().is_success() {
            warn!("ARSY acct update failed: {}", resp.status());
        }
        Ok(())
    }
}

// ===== ISP Client =====

#[derive(Clone)]
struct IspClient {
    http: HttpClient,
    base_url: String,
    api_key: String,
}

impl IspClient {
    fn new(s: &IspSettings) -> Self {
        Self {
            http: HttpClient::new(),
            base_url: s.endpoint.clone(),
            api_key: s.api_key.clone(),
        }
    }

    async fn authenticate(&self, username: &str, password: &str) -> Result<IspAuth> {
        let url = format!("{}/api/v1/auth/authenticate", self.base_url);
        let body = serde_json::json!({ "username": username, "password": password });
        let resp = self
            .http
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&body)
            .send()
            .await?;
        if resp.status().is_success() {
            Ok(resp.json().await?)
        } else {
            let v: serde_json::Value = resp.json().await.unwrap_or_default();
            Err(anyhow::anyhow!("ISP auth failed: {}", v))
        }
    }

    async fn authorize(&self, username: &str, nas_ip: &str, nas_port: &str) -> Result<IspAuthz> {
        let url = format!("{}/api/v1/auth/authorize", self.base_url);
        let body =
            serde_json::json!({ "username": username, "nas_ip": nas_ip, "nas_port": nas_port });
        let resp = self
            .http
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&body)
            .send()
            .await?;
        if resp.status().is_success() {
            Ok(resp.json().await?)
        } else {
            let v: serde_json::Value = resp.json().await.unwrap_or_default();
            Err(anyhow::anyhow!("ISP authz failed: {}", v))
        }
    }

    async fn accounting(&self, action: &str, s: &PppoeSession) -> Result<()> {
        let url = format!("{}/api/v1/accounting/{}", self.base_url, action);
        let body = serde_json::json!({
            "username": s.username, "acct_session_id": s.acct_session_id,
            "nas_ip": s.nas_ip, "nas_port": s.nas_port,
            "framed_ip_address": s.framed_ip_address, "framed_ipv6_prefix": s.framed_ipv6_prefix
        });
        let resp = self
            .http
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&body)
            .send()
            .await?;
        if !resp.status().is_success() {
            warn!("ISP {} failed: {}", action, resp.status());
        }
        Ok(())
    }
}

#[derive(Debug, Deserialize)]
struct IspAuth {
    authenticated: bool,
    #[serde(default)]
    profile: Option<IspProfile>,
    #[serde(default)]
    error: Option<String>,
}

#[derive(Debug, Deserialize)]
struct IspProfile {
    #[serde(default)]
    speed_limit_down: Option<u64>,
    #[serde(default)]
    speed_limit_up: Option<u64>,
}

#[derive(Debug, Deserialize)]
struct IspAuthz {
    authorized: bool,
    #[serde(default)]
    framed_ip_address: Option<String>,
    #[serde(default)]
    framed_ipv6_prefix: Option<String>,
    #[serde(default)]
    session_timeout: Option<u32>,
    #[serde(default)]
    idle_timeout: Option<u32>,
    #[serde(default)]
    error: Option<String>,
}

// ===== Service =====

struct Service {
    settings: AppSettings,
    sessions: SessionStore,
    arsy: ArsyClient,
    isp: IspClient,
}

impl Service {
    fn new(settings: AppSettings) -> Self {
        Self {
            sessions: Arc::new(DashMap::new()),
            arsy: ArsyClient::new(&settings.arsy),
            isp: IspClient::new(&settings.isp),
            settings,
        }
    }

    async fn run(&self) -> Result<()> {
        self.arsy.register().await?;

        let arsy = self.arsy.clone();
        let hb_secs = self.settings.arsy.heartbeat_interval_secs;
        tokio::spawn(async move {
            let mut t = interval(Duration::from_secs(hb_secs));
            loop {
                t.tick().await;
                let _ = arsy.heartbeat().await;
            }
        });

        let sessions = self.sessions.clone();
        tokio::spawn(async move {
            let mut t = interval(Duration::from_secs(60));
            loop {
                t.tick().await;
                let now = Utc::now();
                sessions.retain(|_, s| (now - s.last_update).num_seconds() < 86400);
            }
        });

        let auth_addr: SocketAddr =
            format!("0.0.0.0:{}", self.settings.radius.auth_port).parse()?;
        let acct_addr: SocketAddr =
            format!("0.0.0.0:{}", self.settings.radius.acct_port).parse()?;
        let auth_sock = UdpSocket::bind(auth_addr).await?;
        let acct_sock = UdpSocket::bind(acct_addr).await?;
        info!("RADIUS auth on {}", auth_addr);
        info!("RADIUS accounting on {}", acct_addr);

        let svc1 = self.clone_svc();
        let svc2 = self.clone_svc();
        tokio::spawn(async move { Service::auth_loop(auth_sock, svc1).await });
        tokio::spawn(async move { Service::acct_loop(acct_sock, svc2).await });

        tokio::signal::ctrl_c().await?;
        info!("shutting down");
        Ok(())
    }

    fn clone_svc(&self) -> Self {
        Self {
            settings: self.settings.clone(),
            sessions: self.sessions.clone(),
            arsy: self.arsy.clone(),
            isp: self.isp.clone(),
        }
    }

    async fn auth_loop(socket: UdpSocket, svc: Self) {
        let mut buf = vec![0u8; 4096];
        loop {
            match socket.recv_from(&mut buf).await {
                Ok((len, src)) => {
                    let data = buf[..len].to_vec();
                    let secret = svc.settings.radius.secret.clone();
                    let handler = svc.clone_svc();
                    tokio::spawn(async move {
                        if let Err(e) = handler.handle_access_request(&data, src, &secret).await {
                            error!("auth error from {}: {}", src, e);
                        }
                    });
                }
                Err(e) => error!("auth recv: {}", e),
            }
        }
    }

    async fn acct_loop(socket: UdpSocket, svc: Self) {
        let mut buf = vec![0u8; 4096];
        loop {
            match socket.recv_from(&mut buf).await {
                Ok((len, src)) => {
                    let data = buf[..len].to_vec();
                    let secret = svc.settings.radius.secret.clone();
                    let handler = svc.clone_svc();
                    tokio::spawn(async move {
                        if let Err(e) = handler.handle_acct_request(&data, src, &secret).await {
                            error!("acct error from {}: {}", src, e);
                        }
                    });
                }
                Err(e) => error!("acct recv: {}", e),
            }
        }
    }

    async fn handle_access_request(
        &self,
        data: &[u8],
        src: SocketAddr,
        secret: &str,
    ) -> Result<()> {
        let packet = wire::decode(data, secret.as_bytes()).map_err(|e| anyhow::anyhow!(e))?;
        if packet.code != wire::ACCESS_REQUEST {
            return Ok(());
        }

        let username = packet.get_str(wire::USER_NAME).unwrap_or_default();
        let password = packet
            .get(wire::USER_PASSWORD)
            .map(|a| a.to_str())
            .unwrap_or_default();
        let nas_ip = packet
            .get(wire::NAS_IP_ADDRESS)
            .map(|a| {
                if a.val.len() == 4 {
                    let mut oct = [0u8; 4];
                    oct.copy_from_slice(&a.val);
                    std::net::Ipv4Addr::from(oct).to_string()
                } else {
                    a.to_str()
                }
            })
            .unwrap_or_default();
        let nas_port = packet.get_u32(wire::NAS_PORT).unwrap_or(0).to_string();
        let called = packet.get_str(wire::CALLED_STATION_ID);
        let calling = packet.get_str(wire::CALLING_STATION_ID);
        let request_auth: [u8; 16] = data[4..20].try_into().unwrap();

        info!(
            "Access-Request user={} nas={}:{}",
            username, nas_ip, nas_port
        );

        let auth = self.isp.authenticate(&username, &password).await?;
        if !auth.authenticated {
            let msg = auth.error.unwrap_or_else(|| "authentication failed".into());
            return self
                .send_reply(
                    wire::ACCESS_REJECT,
                    packet.identifier,
                    &request_auth,
                    secret,
                    src,
                    &[wire::Attr::str_val(wire::REPLY_MESSAGE, &msg)],
                )
                .await;
        }

        let authz = self.isp.authorize(&username, &nas_ip, &nas_port).await?;
        if !authz.authorized {
            let msg = authz.error.unwrap_or_else(|| "authorization failed".into());
            return self
                .send_reply(
                    wire::ACCESS_REJECT,
                    packet.identifier,
                    &request_auth,
                    secret,
                    src,
                    &[wire::Attr::str_val(wire::REPLY_MESSAGE, &msg)],
                )
                .await;
        }

        let mut reply_attrs = Vec::new();
        let session = PppoeSession {
            id: Uuid::new_v4(),
            username: username.clone(),
            nas_ip: nas_ip.clone(),
            nas_port: nas_port.clone(),
            called_station_id: called,
            calling_station_id: calling,
            framed_ip_address: authz.framed_ip_address.clone(),
            framed_ipv6_prefix: authz.framed_ipv6_prefix.clone(),
            session_start: Utc::now(),
            last_update: Utc::now(),
            status: SessionStatus::Active,
            acct_session_id: format!("{}-{}", Uuid::new_v4(), Utc::now().timestamp_millis()),
        };

        if let Some(ip) = &authz.framed_ip_address {
            if let Ok(octets) = ip.parse::<std::net::Ipv4Addr>() {
                reply_attrs.push(wire::Attr {
                    ty: wire::FRAMED_IP_ADDRESS,
                    val: octets.octets().to_vec(),
                });
                reply_attrs.push(wire::Attr {
                    ty: wire::FRAMED_IP_NETMASK,
                    val: [255, 255, 255, 0].to_vec(),
                });
            }
        }
        if let Some(prefix) = &authz.framed_ipv6_prefix {
            reply_attrs.push(wire::Attr::str_val(wire::FRAMED_IPV6_PREFIX, prefix));
        }
        if let Some(t) = authz.session_timeout {
            reply_attrs.push(wire::Attr::u32_val(wire::SESSION_TIMEOUT, t));
        }
        if let Some(t) = authz.idle_timeout {
            reply_attrs.push(wire::Attr::u32_val(wire::IDLE_TIMEOUT, t));
        }
        if let Some(profile) = &auth.profile {
            if let Some(down) = profile.speed_limit_down {
                reply_attrs.push(wire::wispr_attr(2, down));
            }
            if let Some(up) = profile.speed_limit_up {
                reply_attrs.push(wire::wispr_attr(3, up));
            }
        }

        self.sessions
            .insert(session.acct_session_id.clone(), session.clone());
        let _ = self.arsy.session_created(&session).await;
        let _ = self.isp.accounting("start", &session).await;
        info!(
            "session granted user={} ip={}",
            username,
            authz.framed_ip_address.unwrap_or_default()
        );

        self.send_reply(
            wire::ACCESS_ACCEPT,
            packet.identifier,
            &request_auth,
            secret,
            src,
            &reply_attrs,
        )
        .await
    }

    async fn send_reply(
        &self,
        code: u8,
        id: u8,
        req_auth: &[u8; 16],
        secret: &str,
        src: SocketAddr,
        attrs: &[wire::Attr],
    ) -> Result<()> {
        let encoded = wire::encode(code, id, attrs, Some(req_auth), secret.as_bytes());
        let sock = UdpSocket::bind("0.0.0.0:0").await?;
        sock.send_to(&encoded, src).await?;
        debug!("sent code {} to {}", code, src);
        Ok(())
    }

    async fn handle_acct_request(&self, data: &[u8], src: SocketAddr, secret: &str) -> Result<()> {
        let packet = wire::decode(data, secret.as_bytes()).map_err(|e| anyhow::anyhow!(e))?;
        if packet.code != wire::ACCOUNTING_REQUEST {
            return Ok(());
        }

        let req_auth: [u8; 16] = data[4..20].try_into().unwrap();
        let status_type = packet.get_u32(wire::ACCT_STATUS_TYPE).unwrap_or(0);
        let username = packet.get_str(wire::USER_NAME).unwrap_or_default();
        let acct_id = packet.get_str(wire::ACCT_SESSION_ID).unwrap_or_default();
        let nas_ip = packet
            .get(wire::NAS_IP_ADDRESS)
            .map(|a| {
                if a.val.len() == 4 {
                    let mut o = [0u8; 4];
                    o.copy_from_slice(&a.val);
                    std::net::Ipv4Addr::from(o).to_string()
                } else {
                    a.to_str()
                }
            })
            .unwrap_or_default();
        let nas_port = packet.get_u32(wire::NAS_PORT).unwrap_or(0).to_string();
        let framed_ip = packet.get(wire::FRAMED_IP_ADDRESS).and_then(|a| {
            if a.val.len() == 4 {
                let mut o = [0u8; 4];
                o.copy_from_slice(&a.val);
                Some(std::net::Ipv4Addr::from(o).to_string())
            } else {
                None
            }
        });
        let framed_v6 = packet.get_str(wire::FRAMED_IPV6_PREFIX);

        info!(
            "Acct user={} session={} type={}",
            username, acct_id, status_type
        );

        let mut session = self
            .sessions
            .entry(acct_id.clone())
            .or_insert_with(|| PppoeSession {
                id: Uuid::new_v4(),
                username: username.clone(),
                nas_ip: nas_ip.clone(),
                nas_port: nas_port.clone(),
                called_station_id: None,
                calling_station_id: None,
                framed_ip_address: None,
                framed_ipv6_prefix: None,
                session_start: Utc::now(),
                last_update: Utc::now(),
                status: SessionStatus::Pending,
                acct_session_id: acct_id.clone(),
            })
            .clone();

        session.last_update = Utc::now();
        if let Some(ip) = framed_ip {
            session.framed_ip_address = Some(ip);
        }
        if let Some(v6) = framed_v6 {
            session.framed_ipv6_prefix = Some(v6);
        }

        match status_type {
            1 => {
                session.status = SessionStatus::Active;
                self.sessions.insert(acct_id.clone(), session.clone());
                let _ = self.isp.accounting("start", &session).await;
                let _ = self.arsy.accounting_update(&session).await;
            }
            2 => {
                session.status = SessionStatus::Terminated;
                self.sessions.insert(acct_id.clone(), session.clone());
                let _ = self.isp.accounting("stop", &session).await;
                let _ = self.arsy.session_terminated(&session).await;
            }
            3 => {
                let _ = self.isp.accounting("interim", &session).await;
                let _ = self.arsy.accounting_update(&session).await;
            }
            _ => warn!("unknown acct type {}", status_type),
        }

        self.send_reply(
            wire::ACCOUNTING_RESPONSE,
            packet.identifier,
            &req_auth,
            secret,
            src,
            &[],
        )
        .await
    }
}

// ===== Main =====

#[derive(Parser, Debug)]
#[command(name = "radius", version, about = "RADIUS service for PPPoE ISP")]
struct Cli {
    #[arg(short, long, default_value = "config.toml")]
    config: String,
}

fn load_settings(path: &str) -> Result<AppSettings> {
    let mut builder = Config::builder()
        .add_source(Environment::with_prefix("RADIUS").separator("__"))
        .add_source(Environment::with_prefix("ARSY").separator("__"))
        .add_source(Environment::with_prefix("ISP").separator("__"));
    if std::path::Path::new(path).exists() {
        builder = builder.add_source(File::with_name(path));
    }
    let config = builder.build()?;
    let mut s: AppSettings = config.try_deserialize()?;
    if let Ok(v) = std::env::var("RADIUS_SECRET") {
        s.radius.secret = v;
    }
    if let Ok(v) = std::env::var("RADIUS_AUTH_PORT") {
        s.radius.auth_port = v.parse().unwrap_or(1812);
    }
    if let Ok(v) = std::env::var("RADIUS_ACCT_PORT") {
        s.radius.acct_port = v.parse().unwrap_or(1813);
    }
    if let Ok(v) = std::env::var("ARSY_ENDPOINT") {
        s.arsy.endpoint = v;
    }
    if let Ok(v) = std::env::var("ARSY_CLIENT_NAME") {
        s.arsy.client_name = v;
    }
    if let Ok(v) = std::env::var("ARSY_HEARTBEAT_INTERVAL_SECS") {
        s.arsy.heartbeat_interval_secs = v.parse().unwrap_or(30);
    }
    if let Ok(v) = std::env::var("ISP_ENDPOINT") {
        s.isp.endpoint = v;
    }
    if let Ok(v) = std::env::var("ISP_API_KEY") {
        s.isp.api_key = v;
    }
    Ok(s)
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "radius=debug,tower=info".into()),
        )
        .init();
    let cli = Cli::parse();
    let settings = load_settings(&cli.config)?;
    info!(
        "radius starting: auth={}:{}, acct={}:{}, arsy={}, isp={}",
        "0.0.0.0",
        settings.radius.auth_port,
        "0.0.0.0",
        settings.radius.acct_port,
        settings.arsy.endpoint,
        settings.isp.endpoint
    );
    let svc = Service::new(settings);
    svc.run().await
}
