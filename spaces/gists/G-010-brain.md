# G-010 — BRAIN 🧠 — Agent Notes DB

**Type:** `BRAIN`
**Owner:** jared
**Status:** LIVE
**Created:** 2026-05-09 by `bob/c1/jared` via notion-ops `create_database`

---

## Notion Database

| Field | Value |
|-------|-------|
| `database_id` | `35bd927c-9792-81b9-816a-e357c9339d2f` |
| `database_url` | https://www.notion.so/35bd927c979281b9816ae357c9339d2f |
| Parent page | PraX (`35bd927c-9792-805b-8b12-f35f86e3d665`) |
| Created via | `notion-ops` → `create_database` op |
| Completed at | `2026-05-09T06:32:39.066Z` |

---

## Schema

| Property | Type | Notes |
|----------|------|-------|
| `Title` | title | Note title / session summary |
| `Date` | date | Session date (ISO) |
| `Source` | select | Perplexity / Claude / ChatGPT / Human |
| `Project` | rich_text | Project name |
| `New Concepts` | multi_select | Concepts introduced this session |
| `Decisions` | rich_text | Decisions made |
| `Open Questions` | rich_text | Unresolved questions / next unknowns |
| `CID` | rich_text | Conversation ID (e.g. `bob/c1/jared`) |
| `Gist Snapshot` | url | Link to a gist snapshot of session state |

---

## How to Write a Note

Push this to `spaces/notion-ops/queue.json` to append a row:

```json
{
  "op": "append_note",
  "requested_by": "<agent-cid>",
  "database_id": "35bd927c-9792-81b9-816a-e357c9339d2f",
  "title": "<session summary>",
  "date": "2026-05-09",
  "source": "Perplexity",
  "project": "repo-copilot",
  "new_concepts": ["concept-a", "concept-b"],
  "decisions": "<what was decided>",
  "open_questions": "<what is still unknown>",
  "cid": "<agent>/<n>/jared",
  "gist_snapshot": "https://gist.github.com/..."
}
```

---

## Purpose

This database is the **write primitive** for the agent second brain.
Every session end, distill:
- New concepts introduced
- Decisions made
- Open questions / blockers

Push an `append_note` op. The DB accumulates across all agents and sessions.
In the future, a GitHub Action will re-generate `brain.json` (G-010 read primitive)
from the last N rows — giving every new session a pre-loaded compressed history.
