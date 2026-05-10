# G-017 — Turn Bundle Spec

| Field | Value |
|---|---|
| **Gist number** | G-017 |
| **Type** | Protocol spec |
| **Owner** | Bob (all agents follow) |
| **Status** | 🟢 Active |
| **Created** | 2026-05-10 |

## Purpose

Defines the turn-close bundle format that replaces the manual brain push. Every significant Perplexity turn closes with one `gitZip` push containing all turn artifacts. GitHub Actions (`unzip-and-route.yml`) handles routing, transcript assembly, deduplication, and brain note push automatically.

---

## Bundle Structure

```
turn-bundle-{cid}.zip
  ├── turns/{session}/{cid}/
  │     ├── turn.json              ← REQUIRED — structured turn summary
  │     └── transcript.md         ← OPTIONAL — full verbatim Q&A for this turn
  ├── spaces/bob/outbox.md        ← include if message sent this turn
  ├── spaces/alice/inbox.md       ← include if Alice was messaged
  ├── spaces/charlie/inbox.md     ← include if Charlie was messaged
  └── .github/notion-ops-queue/
        turn-{cid}.json           ← include if Notion row should be logged
```

Only include files that changed this turn. Git deduplication handles identical content natively.

---

## turn.json Fields

See `.github/turns/schema/turn.json` for the full template.

| Field | Required | Description |
|-------|----------|-------------|
| `cid` | ✅ | Turn ID — `agent/cN/session` |
| `title` | ✅ | 5-10 word turn title |
| `date` | ✅ | ISO 8601 UTC |
| `agent` | ✅ | `bob` / `alice` / `charlie` |
| `session` | ✅ | Session slug matching `spaces/conversations/` directory |
| `q_summary` | ✅ | What Jared asked (25 words max) |
| `a_summary` | ✅ | What was built/decided (50 words max) |
| `commits` | ✅ | SHA list of commits made this turn |
| `files_changed` | ✅ | List of files touched |
| `decisions` | ⬜ | Key decisions made |
| `open_questions` | ⬜ | Unresolved items |
| `inbox_messages_sent` | ⬜ | Messages sent to other agents |
| `notion_ops_queued` | ⬜ | Notion op filenames queued |

---

## What GitHub Actions Does

`unzip-and-route.yml` triggers on push to `.github/turn-bundles/**`:

1. **Unzips** the bundle
2. **Routes** each file to its correct repo path
3. **Deduplicates** inbox/outbox — skips files with identical SHA to current HEAD
4. **Assembles** `spaces/conversations/{session}/transcript.md` from all turn.json `q_summary`/`a_summary` fields
5. **Pushes brain note** to Agent Notes DB (Notion) using `turn.json` content — replaces manual brain push
6. **Commits** all routed files in one clean commit

---

## Turn Slot Mandate (replaces G-002 brain push)

| Slot | Use |
|------|-----|
| 1 | Read — gists, inbox, context files |
| 2 | Build — the actual work (code, spec, message) |
| 3 | **gitZip turn-close bundle push** |

Slot 3 is now one call that does everything: transcript, brain, inbox/outbox routing, Notion ops. No manual brain push API call needed.

---

## Deduplication Strategy

| Layer | Mechanism | Handles |
|-------|-----------|--------|
| Git native | Identical blob SHA = no new object | Unchanged files, re-pushed content |
| Actions SHA check | `sha256sum` compare before copy | Inbox/outbox append dedup |
| Transcript guard | `grep -q "## $CID"` before append | Prevents duplicate turn entries |

A pre-zip local dedup script is optional — git handles the common cases natively.

---

## Session Index (G-016 cross-ref)

Every bundle that contains a `turn.json` with `decisions` populated should also trigger an update to the G-016 session index. The Actions workflow handles this automatically when `decisions` is non-empty.
