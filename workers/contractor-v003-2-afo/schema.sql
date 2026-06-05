-- contractor-v003-2-afo D1 schema
-- Extends v003-1 with admin operations hub tables.

CREATE TABLE IF NOT EXISTS knowledge_seeds (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  vector_id TEXT,
  indexed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  vector_id TEXT,
  indexed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_areas (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  body