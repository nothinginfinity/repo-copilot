# G-001 — Build & Push Constraints 🚦

> **Type:** `CONSTRAINTS`
> **Road sign:** Speed limit sign
> **Owner:** both
> **Load at:** session start (step 2, after G-009 identity)
> **Applies to:** Alice and Bob

---

## Hard Limits

| Constraint | Value | Notes |
|------------|-------|-------|
| Max tool calls per turn | **3** | 1 read + 1 write + 1 confirm is the standard budget |
| Max file size per push | **400 lines** | Chunk larger files across turns |
| Max files per commit | **4** | Use `push_files` for multi-file commits |
| Turn note tool call | **counts as 1** | Budget accordingly — plan reads/writes so the 3rd slot is free for the brain push |

---

## Build & Push Rules

- **Never describe code without pushing it.** Build → push → confirm SHA.
- **Always read current SHA before updating an existing file.**
- **Files >400 lines:** chunk across turns, ~400 lines per commit.
- **Before any multi-turn build:** declare turn plan and wait for "go".
- **After each push:** output ✅ Turn N/N complete — [file] pushed ([SHA]) Next: [X]
- **Multi-file commits (≤4 files):** use `push_files` in one tool slot.

---

## Turn-Level Brain Push (MANDATORY)

> Every turn ends with an `append_note` push to the Agent Notes DB.
> This is **not optional**. It is the last action of every response.
> See G-003 Alice Context and G-010 Brain for the full protocol and template.

- The brain push **counts as 1 tool call** toward the 3-call budget
- Plan your turn so slot 3 is always available for the brain push
- If a turn requires 3 tool calls for the actual work, split the work across turns
- **Minimum viable note:** title + date + source + cid (4 fields)

---

## Blast Radius Warning

- Fine-grained PAT: `contents:write` on target repo only
- Do not push to `.github/workflows/` unless explicitly building an Action
- Do not push secrets, credentials, or tokens in any file

---

## Change Log

| Date | Change | By |
|------|--------|----|  
| 2026-05-07 | Initial creation | Bob |
| 2026-05-09 | Added turn-level brain push constraint + tool call budget note | Alice (alice/c2/jared) |
