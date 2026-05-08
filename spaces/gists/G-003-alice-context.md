# G-003 — Alice Session Context

> **Type:** `CONTEXT` 🗺️ "You Are Here" Map
> **Owner:** alice
> **Load at:** session start, before reading inbox
> **Last updated:** 2026-05-07

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

---

## 📍 Current Project Phase

| Field | Value |
|-------|-------|
| Phase | **Scaffolding** — building the mmcp inbox/outbox + gist context layer |
| Active goal | Populate remaining gist registry entries (G-004 through G-006) |
| Blocking issues | None |
| Last completed | Registry scaffolded by Bob (G-001, G-002, G-003) |
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

> _This section is rewritten each session by Alice. Holds ephemeral working notes._

- Gist system introduced 2026-05-07
- Bob scaffolded the registry; Alice should keep G-003 updated each session
- Road sign taxonomy: CONTEXT / CONSTRAINTS / CHECKLIST / HANDOFF / VOCAB / ALERT
- Gists live as repo files until manually mirrored to gist.github.com

---

## 📝 Change Log

| Date | Change | By |
|------|--------|----|
| 2026-05-07 | Initial creation | Bob (on Alice's behalf) |
