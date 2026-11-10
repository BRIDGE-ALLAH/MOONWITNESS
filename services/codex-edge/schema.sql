-- SOVEREIGN CODEX — CLOUDFLARE D1 EDGE SQLITE SCHEMA
-- Independent of the 9-node monorepo runtime; remains 100% online when project nodes are down.
-- Provision on Cloudflare: wrangler d1 execute sovereign-codex-db --file=services/codex-edge/schema.sql

CREATE TABLE IF NOT EXISTS codex_milestones (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  target_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('COMPLETED', 'ACTIVE', 'PLANNED')),
  progress_pct INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL,
  deliverables_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS codex_tasks (
  id TEXT PRIMARY KEY,
  milestone_id TEXT NOT NULL,
  title TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('NARRATION', 'DNA', 'UI', 'UX', 'BACKEND', 'EDGE_MCP')),
  priority TEXT NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'NORMAL')),
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')),
  progress_pct INTEGER NOT NULL DEFAULT 0,
  owner TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS codex_docs (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('RULE', 'SPEC', 'DESIGN', 'EDGE', 'RFC')),
  title TEXT NOT NULL,
  version TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS codex_comments (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('milestone', 'task', 'release', 'doc')),
  target_id TEXT NOT NULL,
  author TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('PUBLIC_USER', 'AUTONOMOUS_GOVERNOR', 'CORE_ARCHITECT')),
  sentiment TEXT NOT NULL CHECK (sentiment IN ('IDEA', 'ISSUE', 'QUESTION', 'APPROVE')),
  body TEXT NOT NULL,
  autonomous_reply TEXT NOT NULL,
  triage_status TEXT NOT NULL CHECK (triage_status IN ('AUTO_RESOLVED', 'QUEUED_TASK', 'VERIFIED_ON_MESH')),
  linked_task_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS codex_releases (
  tag_name TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('stable', 'nightly', 'daily')),
  changelog_md TEXT NOT NULL,
  published_at TEXT NOT NULL,
  github_release_url TEXT NOT NULL,
  artifacts_json TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON codex_tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON codex_tasks(status);
CREATE INDEX IF NOT EXISTS idx_comments_target ON codex_comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_releases_published ON codex_releases(published_at);

