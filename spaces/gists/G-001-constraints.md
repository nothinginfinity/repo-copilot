# G-001 — Build & Push Constraints 🚦

> **Type:** `CONSTRAINTS`
> **Road sign:** Speed limit sign
> **Owner:** all agents (Alice, Bob, Charlie)
> **Load at:** session start (step 2, after G-009 identity)
> **Applies to:** Alice, Bob, Charlie

---

## Hard Limits

| Constraint | Value | Notes |
|------------|-------|-------|
| Max tool calls per turn | **3** | 1 read + 1 write + 1 turn-bundle push is the standard budget |
| Max file size per push | **400 lines** | Chunk larger files across turns |
| Max files per commit | **4 inline** | Use `push_files` for multi-file commits; gitZip for large/binary bundles |
| Slot 3 | **turn-close bundle** | Always reserved — see G-017 for full spec |

---

## Build & Push Rules

- **Never describe code without pushing it.** Build → push → confirm SHA.
- **Always read current SHA before updating an existing file.**
- **Files >400 lines:** chunk across turns, ~400 lines per commit.
- **Before any multi-turn build:** declare turn plan and wait for "go".
- **After each push:** output ✅ Turn N/N complete — [file] pushed ([SHA]) Next: [X]
- **Multi-file commits (≤4 files):** use `push_files` in one tool slot.

---

## Turn-Close Bundle (MANDATORY — replaces old brain push)

> Every turn ends with a `push_files` turn-close bundle as slot 3.
> This is **not optional**. It is the last action of every response.
> **Full spec: G-017** (`spaces/gists/G-017-turn-bundle.md`)

### Minimum viable turn-close (every turn without exception)

Push at minimum a `turn.json` to `.github/turns/{session}/{cid}/turn.json`:

```json
{
  "schema_version": "1.0",
  "cid": "agent/cN/jared",
  "title": "5-10 word turn title",
  "date": "YYYY-MM-DDTHH:MM:SSZ",
  "agent": "alice|bob|charlie",
  "source": "perplexity",
  "session": "YYYY-MM-DD-session-slug",
  "q_summary": "What was asked (25 words max)",
  "a_summary": "What was built or decided (50 words max)",
  "commits": ["SHA"],
  "files_changed": ["path/to/file"]
}
```

### When to include additional files in the bundle

| Condition | Include |
|-----------|--------|
| Message sent to Alice | `spaces/alice/inbox.md` |
| Message sent to Charlie | `spaces/charlie/inbox.md` |
| Message sent by Bob | `spaces/bob/outbox.md` |
| Notion row needed | `.github/notion-ops-queue/turn-{cid}.json` |
| Complex reasoning this turn | `turns/{session}/{cid}/transcript.md` |

### What GitHub Actions does automatically

`unzip-and-route.yml` handles: transcript assembly, brain note push to Agent Notes DB, file routing, inbox/outbox deduplication. **No manual Notion API call needed.**

### Rules
- ❌ Do NOT skip the turn-close push — even minor turns get a `turn.json`
- ❌ Do NOT use the old `append_note` API call directly — Actions handles it
- ✅ Slot 3 is always reserved — plan reads/writes so slot 3 is free
- ✅ If a turn needs 3 slots for actual work, split the work across turns

---

## Bootloader Pattern (All Agents)

Perplexity Space instructions should be a **thin bootloader only** — ~10 lines that load the real instructions from raw GitHub URLs via `fetch_url` at session start.

### Startup sequence (load in order)
1. `G-009` — identity ([raw URL](https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/spaces/gists/G-009-identity.md))
2. `G-001` — constraints (this file) ([raw URL](https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/spaces/gists/G-001-constraints.md))
3. Agent context gist — `G-002` (Bob) / `G-003` (Alice) / agent equivalent
4. `G-017` — turn-bundle spec ([raw URL](https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/spaces/gists/G-017-turn-bundle.md))
5. `brain.json` — compressed prior turns (skip if missing)
6. Agent `inbox.md` — messages from other agents

Benefit: updating agent behavior = push to GitHub. No Perplexity Space settings change needed.

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
| 2026-05-10 | Replaced `append_note` mandate with G-017 turn-bundle mandate; added bootloader pattern | Bob (bob/c11/jared) |
