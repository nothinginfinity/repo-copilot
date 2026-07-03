-- afo-link-lane v2.6.0: Bounty Vault Foundation / Schema
-- Applied live via the D1 query API ahead of this commit (see
-- AFO Cloudflare API MCP:execute_d1_sql), per project convention:
-- CREATE TABLE IF NOT EXISTS is safe/idempotent, so this file exists purely
-- for documentation and so a fresh environment (or /admin/setup, which
-- iterates the SCHEMA array in worker.js) stays in sync with what's live.
--
-- Scope per roadmap: pure data-model prep before ad gameplay enters
-- navigation. No capture/spawn logic yet - this migration also seeds a
-- handful of fake/sample records (ids prefixed *_sample_*) purely so
-- /bounty-vault and /bounty/:id have something real to render. None of
-- this represents an actual ad campaign or a real user capture.

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id TEXT PRIMARY KEY,
  advertiser_id TEXT,
  name TEXT,
  status TEXT,
  budget_json TEXT,
  targeting_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ad_creatives (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  creative_type TEXT,
  title TEXT,
  copy TEXT,
  media_r2_key TEXT,
  landing_url TEXT,
  reward_json TEXT,
  terms_json TEXT,
  status TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_campaign ON ad_creatives(campaign_id);

CREATE TABLE IF NOT EXISTS ad_entities (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  creative_id TEXT,
  entity_type TEXT,
  spawn_json TEXT,
  state TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bounty_vault_items (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  ad_entity_id TEXT,
  campaign_id TEXT,
  creative_id TEXT,
  status TEXT,
  reward_type TEXT,
  reward_value TEXT,
  coupon_code TEXT,
  claim_url TEXT,
  expires_at TEXT,
  captured_context_json TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bounty_vault_status ON bounty_vault_items(status, created_at);

CREATE TABLE IF NOT EXISTS ad_interaction_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  ad_entity_id TEXT,
  campaign_id TEXT,
  creative_id TEXT,
  vault_item_id TEXT,
  event_type TEXT,
  event_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ad_interaction_vault ON ad_interaction_events(vault_item_id, created_at);

CREATE TABLE IF NOT EXISTS ad_rewards (
  id TEXT PRIMARY KEY,
  vault_item_id TEXT,
  user_id TEXT,
  reward_type TEXT,
  amount TEXT,
  status TEXT,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ad_rewards_vault ON ad_rewards(vault_item_id);

CREATE TABLE IF NOT EXISTS user_ad_preferences (
  user_id TEXT PRIMARY KEY,
  preferences_json TEXT,
  blocked_categories_json TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);
