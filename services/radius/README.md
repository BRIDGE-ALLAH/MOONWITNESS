# RADIUS Service for PPPoE ISP

RADIUS authentication and accounting server for PPPoE ISP integration. Acts as the bridge between NAS/BRAS devices and the ISP provisioning system.

## Architecture

`
e-isp (ISP Billing/Provisioning) ←→ ARSY (Orchestrator) ←→ RADIUS Service ←→ NAS/BRAS (PPPoE)
`

## Flow

1. **PPPoE Client connects to NAS** → NAS sends RADIUS Access-Request
2. **RADIUS Service** → Authenticates with e-ISP API
3. **e-ISP** → Returns user profile (speed limits, static IP, quotas)
4. **RADIUS Service** → Authorizes session with e-ISP (gets framed IP)
5. **RADIUS Service** → Returns Access-Accept with Framed-IP, Session-Timeout, Bandwidth limits
6. **NAS** → Assigns IP to client, establishes PPPoE session
7. **NAS** → Sends Accounting-Start → RADIUS forwards to e-ISP & ARSY
8. **Periodic** → Accounting-Interim-Update → RADIUS forwards to e-ISP & ARSY
8. **Client disconnects** → Accounting-Stop → RADIUS forwards to e-ISP & ARSY, cleans up session

## Features

- **RADIUS Authentication** (Access-Request → Access-Accept/Reject)
- **RADIUS Accounting** (Start/Stop/Interim-Update)
- **PPPoE Session Management** with in-memory store (DashMap)
- **e-ISP Integration** for authentication, authorization, and accounting
- **ARSY Integration** for orchestrator visibility (session registration, heartbeats)
- **WISPr Bandwidth Attributes** for rate limiting
- **IPv6 Support** (Framed-IPv6-Prefix)
- **Session Cleanup** (idle timeout enforcement)

## Configuration

Environment variables (via docker-compose):

`yaml
environment:
  - RADIUS_SECRET=radius_secret_change_me
  - ARSY_ENDPOINT=http://arsy:3000
  - ARSY_CLIENT_NAME=radius-pppoe-1
  - ISP_ENDPOINT=http://e-isp:8080
  - ISP_API_KEY=isp_api_key_change_me
`

Or config.toml:

`	oml
[radius]
bind_addr = "0.0.0.0"
secret = "radius_secret"
auth_port = 1812
acct_port = 1813

[arsy]
endpoint = "http://arsy:3000"
client_name = "radius-pppoe-1"
heartbeat_interval_secs = 30

[isp]
endpoint = "http://e-isp:8080"
api_key = "isp_api_key"
`

## Running

`ash
# Build
cd services/radius
cargo build --release

# Run
./target/release/radius --config config.toml

# Docker
docker compose up radius
`

## API Endpoints (e-ISP)

The service expects the following endpoints on the ISP system:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/authenticate | Verify username/password |
| POST | /api/v1/auth/authorize | Get IP assignment & session params |
| POST | /api/v1/accounting/start | Accounting start record |
| POST | /api/v1/accounting/stop | Accounting stop record |
| POST | /api/v1/accounting/interim | Accounting interim update |

## RADIUS Attributes Handled

### Request (Access-Request)
- User-Name
- User-Password
- NAS-IP-Address
- NAS-Port
- Called-Station-Id
- Calling-Station-Id

### Response (Access-Accept)
- Framed-IP-Address
- Framed-IPv6-Prefix
- Session-Timeout
- Idle-Timeout
- WISPr-Bandwidth-Max-Down
- WISPr-Bandwidth-Max-Up

### Accounting (Accounting-Request)
- Acct-Status-Type (Start/Stop/Interim)
- User-Name
- Acct-Session-Id
- NAS-IP-Address
- NAS-Port
- Framed-IP-Address
- Framed-IPv6-Prefix

## Ports

- **1812/udp** - RADIUS Authentication
- **1813/udp** - RADIUS Accounting

## Integration with ARSY

The RADIUS service registers itself as a controller with ARSY:
- POST /api/v1/controllers (registration)
- POST /api/v1/controllers/{name}/heartbeat (periodic health)
- POST /api/v1/pppoe/sessions (session created)
- POST /api/v1/pppoe/sessions/{id}/terminate (session ended)
- POST /api/v1/pppoe/sessions/{id}/accounting (accounting updates)

This allows ARSY to monitor all PPPoE sessions across the network.
