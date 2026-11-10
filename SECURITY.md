# Security Policy — Sovereign Ecosystem

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| < 0.2.0 | :x:                |

## Security Architecture
- **Personal Access Tokens (PATs)**: Hashed using HMAC-SHA256 with a server-side `TOKEN_PEPPER` secret and compared in constant time (`timingSafeEqual`).
- **Zero-Slop Gate**: Automated pre-commit and CI checks prevent accidental secret or placeholder commits.
- **Sovereign Data Plane**: Bare-metal Git repositories and PocketBase SQLite storage run isolated on local volumes without third-party telemetry.

