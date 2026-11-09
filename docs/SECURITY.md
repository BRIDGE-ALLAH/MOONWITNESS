# Security model and hardening checklist

## Implemented safeguards

- PocketBase superuser credentials are server-only environment variables.
- Browser code receives only normal PocketBase user auth tokens.
- Git Engine verifies user bearer tokens with PocketBase before privileged API operations.
- PATs are random, displayed once, and stored only as HMAC-SHA256 digests using `TOKEN_PEPPER`.
- PAT lookup compares the stored digest and checks expiry/revocation.
- Read and write scopes are checked server-side.
- The Git Engine container drops from its startup root process to the unprivileged `bun` account before serving requests.
- Repository storage names use generated PocketBase record IDs.
- Git subprocesses are started with argument arrays, not shell interpolation.
- Git CGI route rejects traversal markers and only resolves known repository records.
- Compose binds ports to loopback by default.

## Before LAN exposure

- Bind ports to the intended LAN interface only; do not bind `0.0.0.0` on an untrusted network.
- Put Git Engine behind TLS. PATs sent with HTTP Basic authentication are credentials and must not traverse plaintext networks.
- Put PocketBase behind an authenticated/admin-only access policy. The PocketBase admin UI should not be generally reachable by untrusted users.
- Replace the example superuser password and `TOKEN_PEPPER` with cryptographically random secrets.
- Back up `.env` and `TOKEN_PEPPER` separately from the Git/PocketBase data.
- Configure firewall rules and rate limiting at the reverse proxy.
- Review CORS origins; never use wildcard origins with credentials.
- Restrict PocketBase user signup or add an invitation/approval policy before multi-user internet deployment.
- Add request size, timeout, concurrency and disk quota limits before accepting untrusted users.

## Known gaps / not yet production hardened

- SSH server/forced-command integration is not implemented.
- Collaborator permissions are not wired into the Git authorization path.
- No per-user/IP rate limiter or quota enforcement yet.
- No malware scanning or repository content policy.
- Git HTTP CGI process limits and request-body size limits need further hardening for hostile multi-tenant deployments.
- No distributed storage or multi-node locking; run one Git Engine instance against one writable repository volume in this MVP.
- No automated backup scheduler or restore drill.
- No production TLS configuration is activated by the default Compose file.

Do not expose this starter to the public internet until these gaps are addressed and a security review is completed.
