-- afo-link-lane v3.0.5: Approval / Policy / Abuse Guardrails
-- Applied live via the D1 query API ahead of this commit (see
-- AFO Cloudflare API MCP:execute_d1_sql), per project convention:
-- CREATE TABLE IF NOT EXISTS is safe/idempotent, so this file exists purely
-- for documentation and so a fresh environment (or /admin/setup, which
-- iterates the SCHEMA array in worker.js) stays in sync with what's live.
--
-- This is the gate the roadmap calls out as required before real
-- advertisers, real money, or broad release. Variant lifecycle becomes:
--   draft -> pending_review -> approved -> released/rejected/retired
--
-- ad_variant_reviews already existed (created in migration 0003, unused
-- until now) - this version is what actually starts writing to it, via
-- apiSubmitVariant (auto-reject path) and apiReviewVariant (human
-- approve/reject path). No schema change needed for that table.
--
-- ad_variant_policy_checks is new: one row per automated guardrail scan
-- (run at submission time), storing a quality_score, a flags_json array
-- (claim_hard_block / claim_soft_flag / low_quality_score entries), and
-- a recommendation (clear / needs_review / auto_reject). This makes the
-- automated scan auditable after the fact rather than an ephemeral
-- in-request-only computation.
--
-- Other guardrails in this version are enforced in application logic
-- rather than new tables:
--   - "no fake coupons" is structurally prevented already: ad_variants has
--     no reward/coupon fields at all (only title/copy/variant_type) -
--     reward_value is always read from the ORIGINAL ad_creatives row at
--     capture time (apiCaptureAdEntity), never from anything a variant
--     submitter can set. This version doesn't change that; it's flagged
--     here so a future session doesn't assume this needs new schema.
--   - "bot/farming prevention" + "duplicate/reward abuse checks": a
--     time-window cooldown (REWARD_COOLDOWN_MS) on ad_contributor_rewards
--     grants per variant_id, checked via existing table, no schema change;
--     plus a submission cap (MAX_VARIANTS_PER_CAPTURE) checked via COUNT(*)
--     against existing ad_variants rows, also no schema change.
--   - "sponsored disclosure" is a UI-layer change (ad prompt overlay,
--     bounty vault list/detail pages), no schema impact.
--   - "attribution and provenance": ad_release_events.release_json now
--     stores which ad_variant_reviews row approved the release (or that
--     it was a demo_mode bypass), using the existing column - no schema
--     change, just richer content in an already-existing JSON field.

CREATE TABLE IF NOT EXISTS ad_variant_policy_checks (
  id TEXT PRIMARY KEY,
  variant_id TEXT,
  quality_score INTEGER,
  flags_json TEXT,
  recommendation TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ad_variant_policy_checks_variant ON ad_variant_policy_checks(variant_id);
