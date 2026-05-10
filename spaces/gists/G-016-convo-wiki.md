# G-016 — Conversation Wiki

| Field | Value |
|---|---|
| **Gist number** | G-016 |
| **Type** | Conversation archive + decision log |
| **Owner** | Bob (maintained by all agents) |
| **Location** | `spaces/conversations/` in `nothinginfinity/repo-copilot` |
| **Status** | 🟢 Active |
| **Created** | 2026-05-10 |

## Purpose

Captures full session decisions, architectural reasoning, and artifact links for every significant LLM work session. Prevents loss of breakthrough thinking that exists only in transient context windows.

## Structure

```
spaces/conversations/
  README.md                          ← schema + mandate
  YYYY-MM-DD-{session-slug}/
    decisions.md                     ← key decisions, reasoning, open questions
    artifacts.md                     ← commits/files produced, linked by SHA
    transcript.md                    ← optional full Q&A paste (manual)
```

## Session Index

| Date | Session | Key Decision | Commits |
|------|---------|-------------|--------|
| 2026-05-09 | notion-app-store-breakthrough | Notion as app distribution layer; Identity gist v0.2; Three-agents demo handoff | `7d341dcb` `1a4942e2` `4d0b0342` |

## Mandate

Every agent must push a `decisions.md` before closing a significant session.
The brain push (G-010) captures compressed notes; this wiki captures the full reasoning.
They are complementary — brain = fast lookup, wiki = deep archive.
