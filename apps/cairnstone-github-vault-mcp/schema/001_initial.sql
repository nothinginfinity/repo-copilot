CREATE TABLE IF NOT EXISTS repos (
  full_name TEXT PRIMARY KEY,
  owner TEXT,
  name TEXT,
  visibility TEXT,
  default_branch TEXT,
  description TEXT,
  language TEXT,
  html_url TEXT,
  latest_sha TEXT,
  last_indexed_at TEXT,
  metadata_json TEXT
);

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  repo_full_name TEXT,
  path TEXT,
  branch TEXT,
  sha TEXT,
  size INTEGER,
  language TEXT,
  stone_hash TEXT,
  indexed_at TEXT,
  metadata_json TEXT,
  UNIQUE(repo_full_name, path, branch)
);

CREATE TABLE IF NOT EXISTS stones (
  hash TEXT PRIMARY KEY,
  chain TEXT,
  kind TEXT,
  title TEXT,
  lod5 TEXT,
  lod4 TEXT,
  summary TEXT,
  flags_json TEXT,
  metadata_json TEXT,
  raw_text TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS edges (
  id TEXT PRIMARY KEY,
  from_stone TEXT,
  to_stone TEXT,
  edge_type TEXT,
  reason TEXT,
  confidence REAL,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS index_jobs (
  id TEXT PRIMARY KEY,
  kind TEXT,
  subject TEXT,
  status TEXT,
  created_at TEXT,
  updated_at TEXT,
  stats_json TEXT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_files_repo ON files(repo_full_name);
CREATE INDEX IF NOT EXISTS idx_stones_chain ON stones(chain);
CREATE INDEX IF NOT EXISTS idx_stones_kind ON stones(kind);
CREATE INDEX IF NOT EXISTS idx_edges_from ON edges(from_stone);
CREATE INDEX IF NOT EXISTS idx_edges_to ON edges(to_stone);
