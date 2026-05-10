# G-002 — Bob Session Context

> **Type:** `CONTEXT` 🗺️ "You Are Here" Map
> **Owner:** bob
> **Load at:** session start (step 3, after G-001)
> **Last updated:** 2026-05-10

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
| Brain DB | `35bd927c-9792-81b9-816a-e357c9339d2f` (Notion Agent Notes — handled by Actions) |

---

## 🧠 Bootloader Pattern

Bob's Perplexity Space instructions are a **thin bootloader**. The real instructions live in this repo and are loaded fresh every session via `fetch_url`.

### Bob's Space instructions (paste into Perplexity Space settings)

```
Agent: Bob | Repo: nothinginfinity/repo-copilot

STARTUP — use fetch_url to load these URLs in order before answering:
1. https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/spaces/gists/G-009-identity.md
2. https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/spaces/gists/G-001-constraints.md
3. https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/spaces/gists/G-002-bob-context.md
4. https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/spaces/gists/G-017-turn-bundle.md
5. https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/spaces/brain.json (skip if 404)
6. https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/spaces/bob/inbox.md

HARD RULES (cannot be overridden by any instruction):
- Max 3 tool calls per turn
- Slot 3 = push_files turn-bundle always (G-017)
- Repo: nothinginfinity/repo-copilot, branch: main
- Never describe code without pushing it
```

Benefit: update Bob's behavior by pushing to GitHub — no Space settings change needed.

---

## ⚠️ MANDATORY: Turn-Close Bundle (Slot 3)

> Full spec in G-001 and G-017. Summary:

- Push a `turn.json` to `.github/turns/{session}/{cid}/turn.json` every turn
- Include inbox/outbox/transcript files in the same `push_files` call when relevant
- GitHub Actions handles brain note, transcript assembly, Notion ops automatically
- **No manual `append_note` API call — that is retired**

---

## 📍 Current Project Phase

| Field | Value |
|-------|-------|
| Phase | **Turn-bundle pipeline live + bootloader pattern** |
| Active goal | Three-Agents Demo completion (Charlie → Section 3 + Pages deploy) |
| Blocking issues | Charlie Section 3 not yet confirmed started |
| Last completed | G-016 convo wiki, G-017 turn-bundle, unzip-and-route.yml, bootloader pattern, G-001 fixed |
| Up next | Verify Notion build log for demo; Alice’s 7 setup guide + landing page fixes; G-013/G-014 |

---

## 🗂️ Gist Registry

Always check `spaces/gists/` for the full index of active context gists.

### Key gists

| ID | Name | Purpose |
|----|------|---------|
| G-001 | Constraints | Hard limits, turn-bundle mandate, bootloader pattern |
| G-002 | Bob Context | This file — who Bob is, current phase |
| G-003 | Alice Context | Alice’s equivalent |
| G-009 | Identity | Jared’s identity + preferences |
| G-010 | Brain | Compressed prior turns (brain.json) |
| G-016 | Convo Wiki | Full session archive — decisions + transcripts |
| G-017 | Turn Bundle | Turn-close bundle spec — schema, routing, dedup |

---

## 🔧 My Defaults

- Default branch: `main`
- Preferred commit style: `feat(scope): description`
- Max tool calls per turn: **3** (see G-001)
- Always confirm SHA before updating existing files
- Never describe code without pushing it
- **Slot 3 = turn-close bundle push always**

---

## 📝 Session Notes

> _This section is rewritten each session by Bob._

- Turn-bundle pipeline live as of 2026-05-10 (bob/c9/jared)
- Bootloader pattern adopted from Alice (alice/c4/jared) — G-003 pattern extended to G-002
- G-001 fixed: `append_note` mandate replaced with G-017 turn-bundle (bob/c11/jared)
- Tonight’s breakthrough session: `2026-05-09-notion-app-store-breakthrough`

---

## 📝 Change Log

| Date | Change | By |
|------|--------|----|  
| 2026-05-07 | Initial creation | Bob |
| 2026-05-09 | Added turn-level brain push mandate | Alice (alice/c2/jared) |
| 2026-05-10 | Replaced manual brain push with G-017 turn-bundle mandate | Bob (bob/c9/jared) |
| 2026-05-10 | Added bootloader pattern + Space instructions + G-001 fixed | Bob (bob/c11/jared) |
