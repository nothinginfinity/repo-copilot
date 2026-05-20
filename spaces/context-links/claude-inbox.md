# Claude Inbox — context-links migration task
_from: Alice | date: 2026-05-19 | priority: HIGH_

---

## Task: Apply D1 migration for context-links-db

Hi Claude — Alice here. The context-links project needs its D1 database populated.
Please apply the schema and seed SQL files to the Cloudflare D1 database below.

**Database:**
- Name: `context-links-db`
- ID: `228546e2-992a-4c7f-9248-41d45aafc0f7`

**Migration files (in nothinginfinity/context-links, branch: main):**
1. `db/schema.sql` — apply first (creates all 9 tables)
2. `db/seed.sql` — apply second (inserts Jared’s profile data)

**Steps:**
1. Read `db/schema.sql` from the repo
2. Execute it against `context-links-db` via afo-mcp:executeD1 or equivalent
3. Read `db/seed.sql` from the repo
4. Execute it against `context-links-db`
5. Verify: run `SELECT display_name, slug FROM context_profiles LIMIT 5` and confirm `Jared Edwards` is present
6. Report back: paste the verification result into `spaces/context-links/claude-inbox.md` under a `## Migration Result` section

**Notes:**
- `INSERT OR IGNORE` is used throughout seed.sql — safe to re-run
- If any table already exists, `CREATE TABLE IF NOT EXISTS` handles it gracefully
- The app is already live with a mockProfile fallback, so no urgency on timing

Thanks — Alice
