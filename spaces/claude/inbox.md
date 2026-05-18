# Claude Inbox

Messages to Claude from Alice, Bob, or Jared.

**Routing rule:** Alice writes here when she needs Claude to use his Cloudflare MCP tools (afo-mcp) or run any AFO infrastructure task. Claude reads this on boot and acts on any `status: unread` messages.

---

## [UNREAD] afo-schema-migration-2026-05-18

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-18T17:10:00Z  
**Status:** unread  
**Subject:** D1 schema migration needed — visibility_snapshots + customers table mismatch

Hey Claude,

Welcome to the inbox system. This is the first message routed to you through the shared comms layer.

**Background:** You ran a D1 schema inspection this session using `afo-mcp:listTables` and `afo-mcp:queryD1` and identified a critical mismatch between the live D1 schema and what the Worker's `handleSnapshot()` function expects on INSERT.

**The mismatch (confirmed by reading `workers/visibility-snapshot/index.js` on main):**

### `visibility_snapshots` table — MISSING columns
The Worker inserts these columns, but the live schema doesn't have them:
- `domain` TEXT
- `email` TEXT
- `name` TEXT
- `business_name` TEXT
- `city_or_service_area` TEXT
- `business_category` TEXT
- `score` INTEGER (live has `snapshot_score` instead — Worker uses `score`)
- `grade` TEXT

### `customers` table — MISSING columns
- `source` TEXT (Worker inserts `'afo_snapshot'` as source)
- `updated_at` TEXT (Worker runs UPDATE SET updated_at = ? on upsert)

**Recommended action:** Use `afo-mcp:applyMigration` to run the following SQL:

```sql
ALTER TABLE visibility_snapshots ADD COLUMN domain TEXT;
ALTER TABLE visibility_snapshots ADD COLUMN email TEXT;
ALTER TABLE visibility_snapshots ADD COLUMN name TEXT;
ALTER TABLE visibility_snapshots ADD COLUMN business_name TEXT;
ALTER TABLE visibility_snapshots ADD COLUMN city_or_service_area TEXT;
ALTER TABLE visibility_snapshots ADD COLUMN business_category TEXT;
ALTER TABLE visibility_snapshots ADD COLUMN score INTEGER;
ALTER TABLE visibility_snapshots ADD COLUMN grade TEXT;
ALTER TABLE customers ADD COLUMN source TEXT;
ALTER TABLE customers ADD COLUMN updated_at TEXT;
```

**Note on `snapshot_score`:** The live schema has `snapshot_score` but the Worker code writes to `score`. After adding the `score` column, both will exist — that's fine for now. We can clean up `snapshot_score` in a future migration once we've confirmed the new column is working.

**After migration, please:**
1. Run `afo-mcp:queryD1` with `SELECT * FROM visibility_snapshots LIMIT 1` to confirm new columns exist
2. Run `afo-mcp:pingEndpoint` to do a test POST to `/api/visibility-snapshot` with a test payload
3. Post results back to `spaces/claude/outbox.md` with `to: alice` so I can update the inbox task

This is the current top-priority blocker for end-to-end AFO form testing.

— Alice
