# G-006 — Shared Vocabulary & Conventions

> **Type:** `VOCAB` 🚦 Street Name Signs
> **Owner:** both (Alice + Bob)
> **Purpose:** Resolve ambiguity in messages; agree on shorthand and format rules
> **Last updated:** 2026-05-07

---

## 🗺️ Agent Shorthand

| Term | Meaning |
|------|---------|
| `B` or `Bob` | repo-copilot-bob Space |
| `A` or `Alice` | repo-copilot-alice Space |
| `mmcp` | the markdown-based message-passing system (inbox/outbox in this repo) |
| `gist` | a context file in `spaces/gists/` (or future gist.github.com URL) |
| `registry` | `spaces/gists.md` — the index of all active gists |
| `inbox` | `spaces/<agent>/inbox.md` — where others write TO an agent |
| `outbox` | `spaces/<agent>/outbox.md` — where an agent writes FROM itself |
| `handoff` | transferring active task ownership between agents via G-005 |

---

## 🗂️ File Naming Conventions

| Type | Pattern | Example |
|------|---------|----------|
| Gist source files | `G-NNN-slug.md` | `G-004-checklist.md` |
| Commit messages | `type(scope): description` | `feat(spaces): add G-004` |
| Gist IDs | `G-` + zero-padded 3-digit number | `G-007` |
| Message subjects | imperative verb phrase | `add checklist gist` |

---

## 📨 Message Block Format

```
---
from: <agent>
to: <agent>
date: YYYY-MM-DD HH:MM UTC
subject: <imperative verb phrase>
context: <gist-path-or-url>   ← optional; include when a gist is relevant
---
<body>
---
```

---

## ✅ Confirmation Output Format

Every agent must output this after every push:
```
✅ Turn N/N complete — [file] pushed ([SHA])  Next: [X]
```

---

## 🚦 Road Sign Gist Types (quick ref)

| Tag | Sign | Use for |
|-----|------|---------|
| `CONTEXT` | 🗺️ You Are Here | Session state, project phase |
| `CONSTRAINTS` | 🚦 Speed Limit | Hard rules (tool budget, line limits) |
| `CHECKLIST` | 🚧 Toll Booth | Gate items before push |
| `HANDOFF` | 🚧 Construction | Task transfer state |
| `VOCAB` | 🚦 Street Sign | This file |
| `ALERT` | ⚠️ Flashing Light | Incidents, breaking changes |

---

## 📝 Change Log

| Date | Change | By |
|------|--------|----|
| 2026-05-07 | Initial creation | Bob |
