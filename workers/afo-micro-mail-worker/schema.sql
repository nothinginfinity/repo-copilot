-- AFO Micro Mail Worker D1 schema
-- Apply with:
-- wrangler d1 execute afo-micro-mail-db --file=./schema.sql

CREATE TABLE IF NOT EXISTS mailboxes (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  address TEXT,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  llm_enabled INTEGER NOT NULL DEFAULT 1,
  ttl_seconds INTEGER,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  closed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_mailboxes_status ON mailboxes(status);
CREATE INDEX IF NOT EXISTS idx_mailboxes_expires_at ON mailboxes(expires_at);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  mailbox_id TEXT NOT NULL,
  r2_key TEXT,
  vector_id TEXT,
  from_addr TEXT,
  to_addr TEXT,
  subject TEXT,
  clean_text TEXT,
  summary TEXT,
  intent TEXT,
  headers_json TEXT,
  received_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (mailbox_id) REFERENCES mailboxes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_mailbox_id ON messages(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_messages_received_at ON messages(received_at);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  filename TEXT,
  content_type TEXT,
  size_bytes INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);

CREATE TABLE IF NOT EXISTS exports (
  id TEXT PRIMARY KEY,
  mailbox_id TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'json',
  status TEXT NOT NULL DEFAULT 'ready',
  created_at TEXT NOT NULL,
  FOREIGN KEY (mailbox_id) REFERENCES mailboxes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_exports_mailbox_id ON exports(mailbox_id);

CREATE TABLE IF NOT EXISTS lifecycle_receipts (
  id TEXT PRIMARY KEY,
  mailbox_id TEXT NOT NULL,
  slug TEXT,
  r2_object_count INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  vector_count INTEGER NOT NULL DEFAULT 0,
  action_at TEXT NOT NULL,
  receipt_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_receipts_mailbox_id ON lifecycle_receipts(mailbox_id);

CREATE TABLE IF NOT EXISTS agent_events (
  id TEXT PRIMARY KEY,
  mailbox_id TEXT,
  message_id TEXT,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_events_mailbox_id ON agent_events(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_agent_events_type ON agent_events(event_type);
