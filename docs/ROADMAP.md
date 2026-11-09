# Roadmap

## Milestone 0 — Local runnable MVP

- [x] Bun workspace foundation
- [x] Next.js custom dashboard and PocketBase auth
- [x] PocketBase schema migrations
- [x] Git Engine JSON API
- [x] Repository create/list and bare storage
- [x] Personal access token generation and HMAC digest storage
- [x] Native Git HTTP Smart Protocol gateway
- [x] Public clone and owner-scoped private read/write
- [ ] Run end-to-end acceptance test on the target developer machine

## Milestone 1 — Complete Git hosting

- [ ] Add Git transport integration test matrix: clone, fetch, push, empty repo, large pack, invalid auth, private/public.
- [ ] Add read-only SSH access and forced-command SSH push without shell access.
- [ ] Add collaborator/team permission checks to both HTTP and SSH transports.
- [ ] Add token listing, revocation, last-used timestamp and per-token expiry UI.
- [ ] Add repository delete/rename with safe filesystem transaction and recovery journal.
- [ ] Add branch/tag/ref endpoints and a repository tree/commit explorer.
- [ ] Add server-side rate limits and resource ceilings.

## Milestone 2 — Collaboration

- [ ] Issues, labels, milestones and comments.
- [ ] Pull requests and review threads.
- [ ] Merge strategies and protected branches.
- [ ] Notifications and activity feed.
- [ ] Webhooks with signature verification and retry queue.

## Milestone 3 — Operations

- [ ] Caddy/TLS deployment profile.
- [ ] Backup scheduler and restore verification.
- [ ] Storage quotas and repository maintenance.
- [ ] Logs, metrics, health and alerting.
- [ ] Git LFS support.
- [ ] GitHub import and one-way mirror first; carefully designed bidirectional sync later.

## Milestone 4 — Scale and ecosystem

- [ ] CI runner registration and isolated runner execution.
- [ ] Package registry.
- [ ] Multi-node architecture only after repository storage/locking strategy is designed.
- [ ] Desktop companion / Rocksoul / Moonships integrations.
