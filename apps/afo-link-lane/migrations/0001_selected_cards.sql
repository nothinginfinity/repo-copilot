-- afo-link-lane v2.5.0: Selected Cards
-- Applied live via the D1 query API on 2026-07-03 ahead of this file's commit
-- (see AFO Cloudflare API MCP:execute_d1_sql), per project convention:
-- CREATE TABLE IF NOT EXISTS is safe/idempotent, so this file exists purely
-- for documentation and so a fresh environment (or /admin/setup, which
-- iterates the SCHEMA array in worker.js) stays in sync with what's live.

CREATE TABLE IF NOT EXISTS selected_cards (
  id TEXT PRIMARY KEY,
  link_id TEXT,
  selected_face INTEGER,
  gesture TEXT,
  status TEXT DEFAULT 'saved',
  priority INTEGER DEFAULT 0,
  title TEXT,
  url TEXT,
  domain TEXT,
  face_snapshot_json TEXT,
  r2_snapshot_key TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_selected_cards_status ON selected_cards(status, created_at);

CREATE TABLE IF NOT EXISTS selected_card_faces (
  id TEXT PRIMARY KEY,
  card_id TEXT,
  face_index INTEGER,
  label TEXT,
  value TEXT,
  text TEXT,
  image_key TEXT,
  vector_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_scf_card ON selected_card_faces(card_id, face_index);

CREATE TABLE IF NOT EXISTS selected_card_events (
  id TEXT PRIMARY KEY,
  card_id TEXT,
  event_type TEXT,
  event_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sce_card ON selected_card_events(card_id, created_at);

CREATE TABLE IF NOT EXISTS card_notes (
  id TEXT PRIMARY KEY,
  card_id TEXT,
  note_text TEXT,
  tags_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_card_notes_card ON card_notes(card_id, created_at);
