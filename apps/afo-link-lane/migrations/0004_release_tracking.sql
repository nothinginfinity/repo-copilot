-- afo-link-lane v3.0.0: Release Improved Ad + Reward Tracking
-- Applied live via the D1 query API ahead of this commit (see
-- AFO Cloudflare API MCP:execute_d1_sql), per project convention:
-- CREATE TABLE IF NOT EXISTS is safe/idempotent, so this file exists purely
-- for documentation and so a fresh environment (or /admin/setup, which
-- iterates the SCHEMA array in worker.js) stays in sync with what's live.
--
-- Scope note: v3.0.5 ("Approval / Policy / Abuse Guardrails") is where a
-- real approval gate gets added on top of this ("cannot release unless
-- approved or in demo mode"). Until that lands, every release here is
-- implicitly demo-mode - draft variants can release directly. This
-- matches the roadmap's own phrasing rather than jumping ahead to build
-- v3.0.5's restriction early.

CREATE TABLE IF NOT EXISTS ad_release_events (
  id TEXT PRIMARY KEY,
  variant_id TEXT,
  released_by_user_id TEXT,
  release_pool TEXT,
  status TEXT,
  release_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ad_release_events_variant ON ad_release_events(variant_id);

CREATE TABLE IF NOT EXISTS ad_performance_events (
  id TEXT PRIMARY KEY,
  variant_id TEXT,
  campaign_id TEXT,
  event_type TEXT,
  value TEXT,
  context_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ad_performance_events_variant ON ad_performance_events(variant_id, created_at);

CREATE TABLE IF NOT EXISTS ad_contributor_rewards (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  variant_id TEXT,
  reward_type TEXT,
  amount TEXT,
  status TEXT,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ad_contributor_rewards_user ON ad_contributor_rewards(user_id, created_at);
