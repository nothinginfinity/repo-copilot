# G-002 — Bob Session Context

> **Type:** `CONTEXT` 🗺️ "You Are Here" Map
> **Owner:** bob
> **Load at:** session start, before reading inbox
> **Last updated:** 2026-05-07

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

---

## 📍 Current Project Phase

| Field | Value |
|-------|-------|
| Phase | **Scaffolding** — building the mmcp inbox/outbox + gist context layer |
| Active goal | Create and populate the full gist registry (G-001 through G-006) |
| Blocking issues | None |
| Last completed | G-001 Constraints, G-002 Bob Context, G-003 Alice Context |
| Up next | G-004 Pre-Push Checklist, G-005 Handoff, G-006 Vocab |

---

## 🗂️ Gist Registry

Always load [`spaces/gists.md`](https://github.com/nothinginfinity/repo-copilot/blob/main/spaces/gists.md) before acting. It is the index of all active context gists.

---

## 🔧 My Defaults

- Default branch: `main`
- Preferred commit style: `feat(scope): description`
- Max tool calls per turn: **3** (see G-001)
- Always confirm SHA before updating existing files
- Never describe code without pushing it

---

## 📝 Session Notes

> _This section is rewritten each session. It holds ephemeral working notes that don't belong in a message._

- Gist system introduced 2026-05-07 by user
- Road sign taxonomy: CONTEXT / CONSTRAINTS / CHECKLIST / HANDOFF / VOCAB / ALERT
- Gists live as repo files until manually mirrored to gist.github.com; swap path → URL in registry when done

---

## 📝 Change Log

| Date | Change | By |
|------|--------|----|
| 2026-05-07 | Initial creation | Bob |
