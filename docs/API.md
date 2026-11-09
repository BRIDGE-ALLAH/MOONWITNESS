# API contract

Base URL: `http://127.0.0.1:3200`. JSON endpoints require the PocketBase user token in `Authorization: Bearer <pocketbase-token>`. The Git Engine validates that token against PocketBase on every API request.

## Health

`GET /healthz` and `GET /api/v1/health` return service status without authentication.

## Repositories

`GET /api/v1/repositories`

Returns repositories owned by the authenticated user, newest first.

`POST /api/v1/repositories`

```json
{
  "name": "Moonships",
  "slug": "moonships",
  "description": "Local-first developer tools",
  "visibility": "private"
}
```

The API creates a PocketBase metadata record and a native bare repository under `GIT_DATA_DIR/<record-id>.git`. The response includes `clone_url`. Slugs must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Repository paths are unique case-insensitively.

## Personal access tokens

`POST /api/v1/tokens`

```json
{
  "name": "Workstation",
  "scopes": ["repo:read", "repo:write"],
  "expiresInDays": 90
}
```

`expiresInDays` is optional (1–365). The response includes the plaintext token once. The database stores only its HMAC-SHA256 digest and prefix. The raw token cannot be retrieved later. Token listing/revocation endpoints are planned but not part of v0.1.0.

## Git Smart HTTP

Clone URL: `http://127.0.0.1:3200/git/{username}/{slug}.git`.

- Public repositories: anonymous fetch/clone supported.
- Private repositories: PAT with `repo:read` or `repo:write` required.
- Push: repository-owner PAT with `repo:write` required.
- HTTP Basic username: the account username.
- HTTP Basic password: the PAT (`lgh_...`).

The raw PAT must not be embedded in the remote URL. Use Git Credential Manager or enter it when Git prompts. HTTPS/TLS is required on untrusted networks.

## Error shape

JSON API errors use `{ "error": "..." }` with an appropriate HTTP status (400 invalid input, 401 unauthenticated, 403 denied, 404 unknown route, 409 duplicate repository, 500 internal error). Git protocol routes return plain-text/CGI-compatible errors and status codes expected by Git clients.
