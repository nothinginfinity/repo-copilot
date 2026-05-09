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

## ⚠️ Unit of Memory: The Turn

> The **turn** (one prompt + one response) is the first-class citizen of the brain.
> Not the session. Not the conversation. The turn.

Every agent pushes a turn note after **every single response**.
The brain is a ledger of turns, not a summary of sessions.
Phase 2 (dedup + compression) will collapse and index this ledger — but we log first.

**Why turns, not sessions:**
- Nothing lost if a conversation ends abruptly
- Individual ideas are searchable, not buried in session summaries
- Dedup has finer-grained inputs — better compression later
- Moving between agents gives turn-by-turn continuity, not just session handoff

---

## Schema

| Property | Type | Notes |
|----------|------|-------|
| `Title` | title | 3–8 word summary of THIS turn |
| `Date` | date | Turn date (ISO) |
| `Source` | select | Perplexity / Claude / ChatGPT / Human |
| `Project` | rich_text | Inferred from context |
| `New Concepts` | multi_select | Concepts NEW in this turn only |
| `Decisions` | rich_text | Decision/conclusion from this turn (one line) |
| `Open Questions` | rich_text | What this turn leaves unresolved (one line) |
| `CID` | rich_text | Conversation ID (e.g. `alice/c2/jared`) |
| `Gist Snapshot` | url | Optional — link to gist snapshot if relevant |

---

## Turn Note Template (lightweight)

```json
{
  "op": "append_note",
  "requested_by": "<agent-cid>",
  "database_id": "35bd927c-9792-81b9-816a-e357c9339d2f",
  "title": "<3–8 words: what was this turn about>",
  "date": "YYYY-MM-DD",
  "source": "Perplexity",
  "project": "<inferred>",
  "new_concepts": ["<concept>", "<concept>"],
  "decisions": "<one line or null>",
  "open_questions": "<one line or null>",
  "cid": "<agent>/<n>/jared"
}
```

> **Minimum viable turn note:** title + date + source + cid.
> All other fields optional if the turn was a simple acknowledgment or brief exchange.

---

## Read Primitive: brain.json

The `brain-export.yml` workflow generates `spaces/gists/brain.json` from the last N rows.
Triggers: push to `spaces/notion-ops/brain-export-trigger.json`, manual dispatch, or **daily at 06:00 UTC**.

At session start, load `brain.json` for compressed context of all prior turns across all agents.

---

## Agent Coverage

| Agent | Source tag | Status |
|-------|------------|--------|
| Alice (Perplexity) | `Perplexity` | ✅ LIVE — turn-level push wired |
| Bob (Perplexity) | `Perplexity` | ⏳ session-level only (to be upgraded) |
| Charlie (Perplexity) | `Perplexity` | ⏳ not yet wired |
| Claude | `Claude` | ⏳ Phase 3 |
| ChatGPT | `ChatGPT` | ⏳ Phase 3 |

---

## Phase Roadmap

| Phase | What | Status |
|-------|------|--------|
| 1 | Turn-level push for Alice | ✅ LIVE |
| 1b | Turn-level push for Bob + Charlie | ⏳ next |
| 2 | Dedup + semantic compression (weekly Action) | ⏳ pending |
| 3 | Claude + ChatGPT integration | ⏳ pending |

---

## Change Log

| Date | Change | By |
|------|--------|----|  
| 2026-05-09 | Initial creation, session-level write primitive | Bob (bob/c1/jared) |
| 2026-05-09 | Added export_brain op + brain-export.yml read primitive | Alice (alice/c2/jared) |
| 2026-05-09 | Redefined unit of memory as turn; added turn note schema; agent coverage table | Alice (alice/c2/jared) |
