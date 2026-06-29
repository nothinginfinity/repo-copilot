-- Calitree FBI/CDE aggregate crime statistics backstop.
-- R2 stores raw immutable/replayable FBI/CDE files; D1 stores compact indexed aggregates for MCP/LLM queries.

CREATE TABLE IF NOT EXISTS fbi_crime_stats (
  year INTEGER NOT NULL,
  state TEXT NOT NULL,
  agency TEXT DEFAULT '',
  offense_type TEXT NOT NULL,
  offense_count INTEGER NOT NULL,
  population INTEGER,
  source_url TEXT,
  fetched_at TEXT NOT NULL,
  PRIMARY KEY (year, state, agency, offense_type)
);

CREATE INDEX IF NOT EXISTS idx_fbi_state_offense_year
ON fbi_crime_stats (state, offense_type, year);

CREATE INDEX IF NOT EXISTS idx_fbi_offense_year
ON fbi_crime_stats (offense_type, year);

CREATE TABLE IF NOT EXISTS fbi_crime_rollups (
  year INTEGER NOT NULL,
  state TEXT NOT NULL,
  offense_type TEXT NOT NULL,
  offense_count INTEGER NOT NULL,
  population INTEGER,
  rate_per_100k REAL,
  source_url TEXT,
  fetched_at TEXT NOT NULL,
  PRIMARY KEY (year, state, offense_type)
);

CREATE INDEX IF NOT EXISTS idx_fbi_rollups_state_offense_year
ON fbi_crime_rollups (state, offense_type, year);

CREATE VIEW IF NOT EXISTS crime_rollup_v AS
SELECT
  year AS y,
  state AS s,
  offense_type AS o,
  offense_count AS c,
  population AS p,
  rate_per_100k AS r
FROM fbi_crime_rollups;

INSERT OR IGNORE INTO schema_migrations
  (migration_id, worker_name, description, applied_at, checksum)
VALUES
  ('0002_fbi_crime_rollups',
   'calitree-cannabis-feed-mcp',
   'Add FBI/CDE aggregate crime stats and rollup view for private crime MCP',
   '2026-06-29T00:00:00.000Z',
   NULL);
