-- afo-link-lane v2.9.0: Improve Captured Ad
-- Applied live via the D1 query API ahead of this commit (see
-- AFO Cloudflare API MCP:execute_d1_sql), per project convention:
-- CREATE TABLE IF NOT EXISTS is safe/idempotent, so this file exists purely
-- for documentation and so a fresh environment (or /admin/setup, which
-- iterates the SCHEMA array in worker.js) stays in sync with what's live.
--
-- This begins the human-in-the-loop ad improvement engine. Per the
-- intelligence ladder in the roadmap orientation stone, actual AI-generated
-- variants are explicitly later-phase work (v3.3.0 Research Intelligence,
-- v3.4.0 Generative Intelligence). v2.9.0's "Improve" flow is a human
-- proposing their own changes (headline/copy/rationale) via a form - real
-- D1 writes, no generative model calls.
--
-- ad_variant_reviews is created now per the roadmap's v2.9.0 table list,
-- but no review/approval UI is built yet - that's v3.0.5's explicit scope
-- ("Approval / Policy / Abuse Guardrails").

CREATE TABLE IF NOT EXISTS ad_variants (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  parent_ad_id TEXT,
  parent_creative_id TEXT,
  creator_user_id TEXT,
  source_capture_id TEXT,
  variant_type TEXT,
  title TEXT,
  copy TEXT,
  media_r2_key TEXT,
  prompt_r2_key TEXT,
  status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ad_variants_capture ON ad_variants(source_capture_id, created_at);

CREATE TABLE IF NOT EXISTS ad_variant_changes (
  id TEXT PRIMARY KEY,
  variant_id TEXT,
  change_type TEXT,
  before_json TEXT,
  after_json TEXT,
  rationale TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ad_variant_changes_variant ON ad_variant_changes(variant_id);

CREATE TABLE IF NOT EXISTS ad_variant_reviews (
  id TEXT PRIMARY KEY,
  variant_id TEXT,
  reviewer_type TEXT,
  status TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ad_variant_reviews_variant ON ad_variant_reviews(variant_id);
