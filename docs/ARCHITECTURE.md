# Architecture

## Control plane and data plane

PocketBase is intentionally not used as a Git object store. It owns identity, authorization metadata, repository metadata and audit metadata. Bare Git repositories are stored on the Git Engine filesystem.

```text
Web browser
  ├─ PocketBase Auth (email/password)
  └─ Git Engine JSON API (PocketBase user token)
       ├─ authenticate user token through PocketBase auth-refresh
       ├─ authorize repository lifecycle operations
       ├─ create PAT and persist only its HMAC digest
       └─ route Git Smart HTTP requests
            ├─ validate HTTP Basic PAT
            ├─ authorize read/write scope and repository owner
            └─ execute git-http-backend CGI
                 └─ /data/git/<PocketBase-repository-record-id>.git
```

## Why native `git-http-backend`

The Git wire protocol is non-trivial. The Git Engine delegates protocol encoding, pack negotiation and receive/upload-pack behavior to Git's supported CGI backend. The API validates the route, authenticates the caller, checks repository permissions, then supplies CGI environment variables to `git-http-backend`.

The storage directory name is generated from the PocketBase record ID. The client-provided `username/slug` is used only to resolve a repository metadata record; it is never concatenated into a filesystem path.

## Request flows

### Dashboard API

1. Browser authenticates directly with PocketBase's `users` auth collection.
2. Browser sends the PocketBase bearer token to the Git Engine API.
3. Git Engine verifies the token by calling PocketBase `users/auth-refresh`.
4. Git Engine performs server-side operations using a cached PocketBase superuser SDK client.

### Git clone/fetch/push

1. Git client requests `/git/{username}/{slug}.git/...`.
2. Git Engine resolves the metadata record using the unique `path` field.
3. Public read-only requests may proceed without a PAT. Authenticated reads require `repo:read` or `repo:write`; private reads also require repository ownership.
4. Push/receive-pack requires `repo:write` and repository ownership.
5. Git Engine invokes `git-http-backend` with `GIT_PROJECT_ROOT`, a record-ID-based `PATH_INFO`, and `REMOTE_USER` for authenticated users.

## Data ownership

| Data | Source of truth |
|---|---|
| Users and account state | PocketBase |
| Repository name, visibility, owner | PocketBase |
| PAT digest, scopes, expiry, revocation | PocketBase |
| Git refs, commits, trees, blobs, tags | Native bare Git repository |
| Branch/commit UI cache (future) | Derived from Git, never authoritative |

## Deliberate MVP boundaries

- HTTP Smart Git is the implemented transport. SSH is a separate service/milestone.
- PAT auth is Basic auth over HTTP. TLS is mandatory before using it over an untrusted network.
- Collaborator collection is scaffolded, but collaborator authorization is not enabled yet. Current Git write/read ownership is for the repository owner; public anonymous read is allowed.
- Pull requests, issue workflow, webhooks, LFS, package registry and CI runners are future modules.
- GitHub mirroring is not implemented. Avoid a naive two-way mirror; future sync needs explicit direction, refspec policy and non-fast-forward conflict handling.
