# G-002 — Bob Session Context

> **Type:** `CONTEXT` 🗺️ "You Are Here" Map
> **Owner:** bob
> **Load at:** session start, before reading inbox
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
| Brain DB | `35bd927c-9792-81b9-816a-e357c9339d2f` (Notion Agent Notes) |

---

## ⚠️ MANDATORY: Turn-Close Bundle Push (Slot 3)

> **This is a hard constraint, not a suggestion.**

**After EVERY response, Bob MUST close the turn with a gitZip bundle push as the final tool call.**

The manual brain push to Agent Notes DB is **replaced** by this mechanism.
GitHub Actions (`unzip-and-route.yml`) handles brain note push, transcript assembly, inbox/outbox routing, and Notion ops automatically.

### What Slot 3 Does

1. Assemble the turn bundle (see G-017 for full spec)
2. Push via `push_files` to `.github/turn-bundles/{session}/turn-bundle-{cid}.zip` OR push the individual files directly to `.github/turns/{session}/{cid}/`
3. Actions picks it up, routes everything, pushes brain note to Notion, updates transcript

### Minimum Viable Turn-Close (every turn)

Push at minimum one `turn.json` to `.github/turns/{session}/{cid}/turn.json`:

```json
{
  "schema_version": "1.0",
  "cid": "bob/cN/jared",
  "title": "Short title of this turn (5-10 words)",
  "date": "YYYY-MM-DDTHH:MM:SSZ",
  "agent": "bob",
  "source": "perplexity",
  "session": "YYYY-MM-DD-session-slug",
  "q_summary": "What Jared asked (25 words max)",
  "a_summary": "What Bob built or decided (50 words max)",
  "commits": ["SHA"],
  "files_changed": ["path/to/file"],
  "decisions": [],
  "open_questions": []
}
```

### Full Turn Bundle (when inbox/outbox/Notion ops involved)

Use `push_files` with all changed files in one commit:
- `turns/{session}/{cid}/turn.json` ← always
- `turns/{session}/{cid}/transcript.md` ← include full Q&A when reasoning is complex
- `spaces/alice/inbox.md` ← if Alice was messaged
- `spaces/charlie/inbox.md` ← if Charlie was messaged
- `spaces/bob/outbox.md` ← if message was sent
- `.github/notion-ops-queue/turn-{cid}.json` ← if Notion row needed

### Rules
- ❌ Do NOT skip the turn-close push — even minor turns get a `turn.json`
- ❌ Do NOT batch multiple turns into one note
- ❌ Do NOT use the old manual brain push API call (replaced by Actions)
- ✅ Slot 3 is always reserved for turn-close push — plan reads/writes so slot 3 is free
- ✅ Minimum viable: `turn.json` only. Add other files as needed.
- ✅ Git deduplication handles unchanged files natively — include inbox/outbox files even if mostly unchanged
- ✅ Full schema and bundle spec: `spaces/gists/G-017-turn-bundle.md`

---

## 📍 Current Project Phase

| Field | Value |
|-------|-------|
| Phase | **Turn-bundle pipeline live** — gitZip + Actions replace manual brain push |
| Active goal | Three-Agents Demo completion (Charlie → Section 3 + Pages deploy) |
| Blocking issues | Charlie Section 3 not yet confirmed started |
| Last completed | G-016 convo wiki, G-017 turn-bundle spec, unzip-and-route.yml, G-002 update |
| Up next | Verify Notion build log for demo; Alice's 7 setup guide + landing page fixes; G-013/G-014 |

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
- **Slot 3 = turn-close bundle push** — budget accordingly

---

## 📝 Session Notes

> _This section is rewritten each session by Bob. Holds ephemeral working notes._

- Turn-bundle pipeline wired 2026-05-10 (bob/c9/jared)
- G-017 defines bundle structure; unzip-and-route.yml handles routing + brain push
- Old manual brain push (append_note to Agent Notes DB) is now handled by Actions
- Bob CID format: `bob/c<n>/jared` — increment c-number each new conversation
- Tonight's session: `2026-05-09-notion-app-store-breakthrough`
- Notion App Store thesis captured in `spaces/conversations/2026-05-09-notion-app-store-breakthrough/decisions.md`

---

## 📝 Change Log

| Date | Change | By |
|------|--------|----|  
| 2026-05-07 | Initial creation | Bob |
| 2026-05-09 | Added turn-level brain push mandate, updated phase | Alice (alice/c2/jared) |
| 2026-05-10 | Replaced manual brain push with gitZip turn-bundle mandate (G-017) | Bob (bob/c9/jared) |
