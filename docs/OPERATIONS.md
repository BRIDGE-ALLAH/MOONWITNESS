# Operations

## Start / stop

```bash
docker compose up -d --build pocketbase git-engine
bun run dev

docker compose logs -f pocketbase git-engine
docker compose down
```

## PocketBase admin

Open `http://127.0.0.1:8090/_/`. The initial collection migrations are applied automatically when PocketBase starts.

## Backup

Run `./scripts/backup.sh`. It stops PocketBase and Git Engine, archives `data/pocketbase` and `data/git`, then starts the services again. Store the archive off-device and preserve `.env` separately.

## Restore outline

1. Stop services: `docker compose down`.
2. Move current `data/` out of the way.
3. Extract the archive so it restores `data/pocketbase` and `data/git` in the project root.
4. Restore the matching `.env` (especially the original `TOKEN_PEPPER`).
5. Start services and verify `/healthz`, PocketBase admin, and a test clone.

## Repository consistency

Git objects and refs are owned by native Git. PocketBase metadata records include the generated storage key. If the metadata exists but the bare repo directory is missing, treat it as an integrity incident; do not silently initialize over an unknown path.
