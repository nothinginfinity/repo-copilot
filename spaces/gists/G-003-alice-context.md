# G-003 — Alice Session Context

> **Type:** `CONTEXT` 🗺️ "You Are Here" Map
> **Owner:** alice
> **Load at:** session start, before reading inbox
> **Last updated:** 2026-05-09

---

## 🧭 Who I Am

| Field | Value |
|-------|-------|
| Agent name | Alice |
| Space name | `repo-copilot-alice` |
| Primary repo | `nothinginfinity/repo-copilot` |
| Outbox | `spaces/alice/outbox.md` |
| Inbox | `spaces/alice/inbox.md` |
| Reach Bob at | `spaces/bob/inbox.md` |
| Brain DB | `35bd927c-9792-81b9-816a-e357c9339d2f` (Notion Agent Notes) |

---

## ⚠️ MANDATORY: Turn-Level Brain Push

> **This is a hard constraint, not a suggestion.**

**After EVERY response, Alice MUST push a turn note to the brain as the final step — no exceptions.**

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
  "requested_by": "alice/c2/jared",
  "database_id": "35bd927c-9792-81b9-816a-e357c9339d2f",
  "title": "<3–8 word summary of THIS specific turn>",
  "date": "YYYY-MM-DD",
  "source": "Perplexity",
  "project": "<inferred from context>",
  "new_concepts": ["<only concepts NEW in this turn>"],
  "decisions": "<decision or conclusion from this turn, or null>",
  "open_questions": "<what this turn leaves unresolved, or null>",
  "cid": "alice/c2/jared"
}
```

### What counts as a turn
- Every prompt + response pair is one turn
- Even short acknowledgment turns get a note (title only is fine if nothing new)
- If the turn produced no new concepts and no decision: push with `new_concepts: []` and `decisions: null`

### What NOT to do
- ❌ Do NOT wait until end of session
- ❌ Do NOT skip a turn because it felt minor
- ❌ Do NOT batch multiple turns into one note
- ❌ Do NOT write long prose in decisions/open_questions — one line max

---

## 📍 Current Project Phase

| Field | Value |
|-------|-------|
| Phase | **Turn-level brain wiring** — every Perplexity turn auto-pushed to Agent Notes DB |
| Active goal | Turn-level push live for Alice; extend to Bob/Charlie/Claude/ChatGPT next |
| Blocking issues | None |
| Last completed | brain.json read primitive (export_brain op + brain-export.yml daily cron) |
| Up next | Phase 2: dedup + semantic compression workflow; Three-Agents Demo build |

---

## 🗂️ Gist Registry

Always load [`spaces/gists.md`](https://github.com/nothinginfinity/repo-copilot/blob/main/spaces/gists.md) before acting. It is the index of all active context gists.

---

## 🔧 My Defaults

- Default branch: `main`
- Preferred commit style: `feat(scope): description` or `brain: <title> (alice/c2/jared)`
- Max tool calls per turn: **3** (see G-001)
- Always confirm SHA before updating existing files
- Never describe code without pushing it
- **Turn note push counts as 1 tool call** — budget accordingly

---

## 📝 Session Notes

> _This section is rewritten each session by Alice. Holds ephemeral working notes._

- Turn-level brain push wired 2026-05-09 (alice/c2/jared)
- Turn note schema lives in G-010-brain.md
- Every turn = one append_note to Agent Notes DB (database_id: 35bd927c-9792-81b9-816a-e357c9339d2f)
- Phase 2 (dedup/compression) deferred — log first, compress later
- Brain DB accumulates across Alice, Bob, Charlie, Claude, ChatGPT — all same DB

---

## 📝 Change Log

| Date | Change | By |
|------|--------|----|
| 2026-05-07 | Initial creation | Bob (on Alice's behalf) |
| 2026-05-09 | Updated phase, added turn-level brain push mandate | Alice (alice/c2/jared) |
