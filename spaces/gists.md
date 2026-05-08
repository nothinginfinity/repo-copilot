# Gist Registry — Persistent Context Layer

Gists are **sticky notes** alongside the inbox/outbox mail system.
Every agent should load relevant gists at session start before reading messages.

> **Protocol:** Check this file first → load the gist files listed below → then read inbox.

---

## How to Use Gists

| Step | Action |
|------|--------|
| 1 | Load this registry at session start |
| 2 | Fetch each gist relevant to your task |
| 3 | Apply constraints / context before acting |
| 4 | Update a gist when its contents change (edit in-place — gists are versioned) |
| 5 | Add new rows to the Active Gists table below when a new gist is created |

---

## Gist Types (Road Sign System)

| Type Tag | Road Sign Analogy | Purpose |
|----------|-------------------|---------|
| `CONTEXT` | "You Are Here" map | Project phase, active goals, who's involved |
| `CONSTRAINTS` | Speed limit sign | Token budgets, file size rules, turn plan limits |
| `CHECKLIST` | Toll booth | Pre-push gate items every agent must verify |
| `HANDOFF` | Road construction sign | Partial work state + next steps when switching agents |
| `VOCAB` | Street name signs | Agreed shorthand, naming conventions, format rules |
| `ALERT` | Flashing warning light | Known issues, breaking changes, active incidents |

---

## Active Gists

| ID | Type | Owner | Title | Path / URL | Last Updated |
|----|------|-------|-------|------------|--------------|
| G-001 | `CONSTRAINTS` | both | Build & Push Rules | `spaces/gists/G-001-constraints.md` | 2026-05-07 |
| G-002 | `CONTEXT` | bob | Bob Session Context | `spaces/gists/G-002-bob-context.md` | 2026-05-07 |
| G-003 | `CONTEXT` | alice | Alice Session Context | `spaces/gists/G-003-alice-context.md` | 2026-05-07 |
| G-004 | `CHECKLIST` | both | Pre-Push Gate Checklist | `spaces/gists/G-004-checklist.md` | 2026-05-07 |
| G-005 | `HANDOFF` | both | Active Handoff State | `spaces/gists/G-005-handoff.md` | 2026-05-07 |
| G-006 | `VOCAB` | both | Shared Vocabulary & Conventions | `spaces/gists/G-006-vocab.md` | 2026-05-07 |

> **Note:** Gists hosted in this repo use repo-relative paths until mirrored to github.com/gists.
> When a public Gist URL is created, replace the path with the full `https://gist.github.com/...` URL.

---

## Message Header Convention

```
---
from: <agent>
to: <agent>
date: YYYY-MM-DD HH:MM UTC
subject: <imperative verb phrase>
context: <gist-path-or-url>   ← include when a gist is relevant
---
<body>
---
```

---

## Gist Update Rules

- **Edit in-place** — gists are versioned; editing does not break existing path/URL references.
- **Secret gists** are unlisted (anyone with the URL can view) — do not store sensitive credentials.
- **HANDOFF gists** should be rewritten at each task boundary; do not append — overwrite.
- **CONSTRAINTS and CHECKLIST gists** are authoritative truth; Space instructions defer to them.
- **Add new rows** to the Active Gists table above when a new gist is created.
- **Retire gists** by marking path as `_archived_` and adding a note — do not delete rows.

---

## Ownership

This file is maintained by both Bob and Alice.
Either agent may add new gist entries; both agents must respect CONSTRAINTS and CHECKLIST gists.
