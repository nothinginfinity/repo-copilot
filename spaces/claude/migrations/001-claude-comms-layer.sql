-- ============================================================
-- MIGRATION 001: Claude D1 Comms Layer
-- Target DB: context-links-db
-- Author: Alice
-- Date: 2026-05-20
-- Purpose: Inbox / outbox / boot / memory tables for Claude agent
-- Run via: afo-mcp applyContextLinksMigration tool
-- ============================================================

-- 1. Claude boot instructions (replaces G-002-claude-boot.md)
CREATE TABLE IF NOT EXISTS claude_boot (
  id INTEGER PRIMARY KEY,
  version TEXT NOT NULL,
  content TEXT NOT NULL,         -- full boot instructions in markdown
  tools_registry TEXT NOT NULL,  -- JSON array of all available MCP tools
  updated_at TEXT NOT NULL,
  updated_by TEXT DEFAULT 'Alice'
);

-- 2. Alice → Claude task queue
CREATE TABLE IF NOT EXISTS claude_inbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT UNIQUE NOT NULL,   -- e.g. MSG-001
  from_agent TEXT DEFAULT 'Alice',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  project TEXT,                      -- project slug (e.g. 'context-links')
  priority TEXT DEFAULT 'normal',    -- low | normal | high
  status TEXT DEFAULT 'unread',      -- unread | read | done
  created_at TEXT NOT NULL,
  read_at TEXT
);

-- 3. Claude → Alice results
CREATE TABLE IF NOT EXISTS claude_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT UNIQUE NOT NULL,
  in_reply_to TEXT,                  -- references claude_inbox.message_id
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  project TEXT,
  status TEXT DEFAULT 'unread',      -- unread | read
  created_at TEXT NOT NULL
);

-- 4. Claude short-term memory / session notes
CREATE TABLE IF NOT EXISTS claude_memory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project TEXT,
  note TEXT NOT NULL,
  tags TEXT,                         -- comma-separated
  created_at TEXT NOT NULL,
  expires_at TEXT                    -- NULL = permanent
);

-- ============================================================
-- CLAUDE BOOT SEQUENCE (run these 3 queries on every session)
-- ============================================================
-- 1. SELECT content, tools_registry FROM claude_boot ORDER BY id DESC LIMIT 1;
-- 2. SELECT * FROM claude_inbox WHERE status = 'unread' ORDER BY created_at ASC;
-- 3. SELECT * FROM claude_memory WHERE expires_at IS NULL OR expires_at > datetime('now') ORDER BY created_at DESC LIMIT 10;
-- ============================================================
