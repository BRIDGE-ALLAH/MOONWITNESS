# Local coding-agent execution brief

Use this brief after extracting the boilerplate and opening the project in a local coding agent.

```text
PROJECT: LOCAL GIT HQ
SCOPE: CURRENT REPOSITORY
GOAL: TURN THE STARTER INTO A VERIFIED, PRODUCTION-READY SELF-HOSTED GIT PLATFORM
STACK: NEXT.JS + POCKETBASE + BUN + NATIVE GIT HTTP SMART PROTOCOL

RULES
- Inspect the actual repository and current git status before editing.
- Do not overwrite user changes or secrets.
- PocketBase is control-plane metadata/auth only; Git objects stay in native bare repositories.
- Native Git is the source of truth for refs, commits, trees, blobs and tags.
- Never claim a feature is complete without an executable test and evidence.
- Preserve the existing architecture unless a concrete defect requires a documented correction.
- Execute independent tasks in parallel; respect dependencies for schema/protocol changes.
- Do not deploy, delete user data, force-push, or change remote repositories without explicit authorization.

EXECUTION LOOP
1. DEEP_INSIGHT: inspect README, docs, package manifests, migrations and all source code.
2. AUDIT: map actual behavior, security boundaries, missing cases and build failures.
3. PLAN: create focused tasks with acceptance criteria and dependencies.
4. IMPLEMENT: complete one vertical slice at a time.
5. TEST: run format/typecheck/unit/integration/security checks.
6. REVIEW: inspect the diff and test negative paths.
7. FIX: resolve every discovered blocker; rerun affected tests.
8. DOCUMENT: update docs and roadmap with verified status only.
9. CONTINUE: move to the next independent milestone until scope is exhausted.

PRIORITY 1 — MVP VERIFICATION
- Start PocketBase and apply migrations from a clean data directory.
- Create a superuser and verify the Git Engine authenticates to PocketBase.
- Verify signup/login, username uniqueness and API bearer-token validation.
- Create a repository and verify the bare repo exists at the record-ID storage path.
- Create PATs, verify only digests are stored, and test expiry/revocation.
- Execute real Git CLI tests: clone, initial push, second clone, fetch, pull, second push.
- Test public anonymous clone; private anonymous denial; wrong PAT; read-only PAT push denial; foreign-owner push denial.
- Test empty repositories, branch changes, tags, large packfiles, disconnects and concurrent pushes.
- Verify no server secret reaches Git subprocesses or browser bundles.

PRIORITY 2 — COMPLETE GIT SERVER
- Add secure SSH service with per-key forced commands and no shell access.
- Wire collaborator roles into HTTP and SSH checks.
- Add token listing/revocation/last-used and safe repository lifecycle actions.
- Build repository browser: tree, raw files, commit log, commit details, diff and blame.
- Add branch protections and Git hooks with safe policy boundaries.

PRIORITY 3 — COLLABORATION AND OPERATIONS
- Add Issues, PRs, review threads, comments and notifications.
- Add webhooks with signatures, retry queue and delivery logs.
- Add backups, restore drills, quotas, rate limits, audit logs and metrics.
- Add TLS reverse proxy and LAN/internet deployment profiles.
- Add GitHub import and one-way mirror before considering bidirectional synchronization.
- Add LFS, package registry and isolated CI runners only after core Git reliability.

QUALITY GATES
- `bun run check`, `bun run test`, `bun run build` must pass.
- Git protocol integration tests must use real `git` client commands against the running server.
- Security tests must include unauthorized read/write, path traversal, malformed Basic auth, token expiry, request limits and process cleanup.
- Keep README, API docs, DATA_MODEL, SECURITY and ROADMAP synchronized with implemented behavior.
- Close completed tasks; report only verified results, exact test commands and remaining blockers.

START WITH AUDIT, THEN EXECUTE. DO NOT STOP AFTER WRITING A PLAN.
```
