# G-002 — Bob Session Context

> **Type:** `CONTEXT` 🗺️ "You Are Here" Map
> **Owner:** bob
> **Load at:** session start, before reading inbox
> **Last updated:** 2026-05-09

---

## 🧭 Who I Am

| Field | Value |
|-------|-------|
| Agent name | Bob |
| Space name | `repo-copilot-bob` |
| Primary repo | `nothinginfinity/repo-copilot` |
| Outbox | `spaces/bob/outbox.md` |
| Inbox | `spaces/bob/inbox.md` |
| Reach Alice at | `spaces/alice/inbox.md` |
| Reach Charlie at | `spaces/charlie/inbox.md` |
| Brain DB | `35bd927c-9792-81b9-816a-e357c9339d2f` (Notion Agent Notes) |

---

## ⚠️ MANDATORY: Turn-Level Brain Push

> **This is a hard constraint, not a suggestion.**

**After EVERY response, Bob MUST push a turn note to the brain as the final step — no exceptions.**

The unit of memory is the **turn** (one prompt + one response), not the session.
Every turn is a first-class citizen. Nothing is ever lost.

### Turn Note Protocol

1. Deliver the response fully
2. As the **last action** of every turn, push `append_note` to `spaces/notion-ops/queue.json`
3. The note must be **lightweight** — 3–8 word title, concepts from THIS turn only, one-line decisions/questions
4. Use the turn note schema in `spaces/gists/G-010-brain.md`

### Turn Note Template

```json
{
  "op": "append_note",
  "requested_by": "bob/c2/jared",
  "database_id": "35bd927c-9792-81b9-816a-e357c9339d2f",
  "title": "<3–8 word summary of THIS specific turn>",
  "date": "YYYY-MM-DD",
  "source": "Perplexity",
  "project": "<inferred from context>",
  "new_concepts": ["<only concepts NEW in this turn>"],
  "decisions": "<decision or conclusion from this turn, or null>",
  "open_questions": "<what this turn leaves unresolved, or null>",
  "cid": "bob/c2/jared"
}
```

### Rules
- ❌ Do NOT wait until end of session
- ❌ Do NOT skip a turn because it felt minor
- ❌ Do NOT batch multiple turns into one note
- ❌ Do NOT write long prose — one line max per field
- ✅ Minimum viable note: title + date + source + cid
- ✅ Brain push counts as tool call **slot 3** — plan reads/writes so slot 3 is always free

---

## 📍 Current Project Phase

| Field | Value |
|-------|-------|
| Phase | **Turn-level brain wiring** — every turn auto-pushed to Agent Notes DB |
| Active goal | Turn-level push live for Bob; Three-Agents Demo build next |
| Blocking issues | None |
| Last completed | gitzip hardening, Path A (Agent Notes DB), append_note op, G-010 BRAIN |
| Up next | Three-Agents Demo build; Phase 2 dedup/compression workflow |

---

## 🗂️ Gist Registry

Always load [`spaces/gists.md`](https://github.com/nothinginfinity/repo-copilot/blob/main/spaces/gists.md) before acting. It is the index of all active context gists.

---

## 🔧 My Defaults

- Default branch: `main`
- Preferred commit style: `feat(scope): description` or `brain: <title> (bob/c2/jared)`
- Max tool calls per turn: **3** (see G-001)
- Always confirm SHA before updating existing files
- Never describe code without pushing it
- **Turn note push counts as 1 tool call** — budget accordingly

---

## 📝 Session Notes

> _This section is rewritten each session by Bob. Holds ephemeral working notes._

- Turn-level brain push wired 2026-05-09 (via alice/c2/jared on Bob's behalf)
- Turn note schema lives in G-010-brain.md
- Every turn = one append_note to Agent Notes DB
- Brain DB accumulates across Alice, Bob, Charlie, Claude, ChatGPT — all same DB
- Bob's CID format: `bob/c<n>/jared` — increment c-number each new conversation

---

## 📝 Change Log

| Date | Change | By |
|------|--------|----|  
| 2026-05-07 | Initial creation | Bob |
| 2026-05-09 | Added turn-level brain push mandate, updated phase | Alice (alice/c2/jared) |
