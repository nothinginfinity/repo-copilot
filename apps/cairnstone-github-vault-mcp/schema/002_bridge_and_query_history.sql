-- Migration 002: bridge to CairnStone V5 + persistent query/discovery history
--
-- Context: cairnstone-github-vault-mcp originally duplicated CairnStone V5's
-- job (raw content storage, its own stone/edge graph). As of this migration
-- the worker delegates actual file stoning to CairnStone V5 via a
-- CAIRNSTONE_V5 service binding (see wrangler.jsonc) - `stones.hash` is now
-- a real CairnStone V5 stone_hash, not a locally-computed digest, and
-- `stones.raw_text` is no longer populated (content lives in V5/R2).
--
-- The `stones`/`edges`/`files` tables are kept, but repurposed as a thin
-- local cache: fast compatibility-feature search and heuristic
-- cross-repo "can pair with" edges (podcast+3D, worker+config, etc.) - a
-- different concept from CairnStone V5's own documents/supersedes/patches/
-- reviews/references graph, so it stays local rather than migrating.
--
-- New in this migration: a persistent, searchable log of every
-- query_github_vault / discover_repo_combinations call and its result, so
-- past compatibility searches don't have to be re-run to recall what was
-- found.

CREATE TABLE IF NOT EXISTS queries (
  id TEXT PRIMARY KEY,
  kind TEXT,              -- 'query_github_vault' | 'discover_repo_combinations'
  query_text TEXT,
  repo_scope TEXT,
  params_json TEXT,
  result_summary TEXT,
  result_json TEXT,
  result_count INTEGER,
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_queries_kind ON queries(kind);
CREATE INDEX IF NOT EXISTS idx_queries_repo ON queries(repo_scope);
CREATE INDEX IF NOT EXISTS idx_queries_created ON queries(created_at);
