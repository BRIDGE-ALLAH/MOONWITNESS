# PocketBase data model

The initial migration creates these collections:

| Collection | Purpose | Authoritative data |
|---|---|---|
| `users` | Auth accounts, username and display name | Yes |
| `repositories` | Owner, path, visibility, default branch and storage key | Yes for metadata |
| `personal_access_tokens` | HMAC token digest, prefix, scopes, expiry and revocation state | Yes |
| `collaborators` | Future repository-level membership and role | Scaffold only; not enforced by Git Engine yet |
| `activities` | Future audit/activity stream | Scaffold only |
| `organizations` | Future organization ownership | Scaffold only |

## Repository storage mapping

`repositories.storage_key` is set to the PocketBase record ID after the bare repository is initialized. The on-disk path is `<GIT_DATA_DIR>/<record-id>.git`. The public route path (`username/slug`) is a lookup key only; it is never used as a filesystem path.

## Git source of truth

Commits, trees, blobs, refs, tags and reflogs live in native Git. A future repository explorer may cache commit/branch metadata in PocketBase, but such data must be rebuildable from the bare repository. Do not model Git object contents as PocketBase records.

## Migration operations

PocketBase applies JS migrations under `services/pocketbase/pb_migrations` on `serve`. Commit migration files to source control. Do not edit an existing applied migration to change production schema; add a new migration instead.
