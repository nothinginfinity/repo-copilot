# Conversation Wiki — Schema & Mandate

## Why This Exists

LLM context windows are ephemeral. Every session that produces architecture decisions, specs, or shipped code represents irreplaceable reasoning that disappears when the conversation closes. This wiki is the permanent record.

The Agent Notes DB (G-010 Brain) captures compressed turn summaries for fast session-startup lookup. This wiki captures the full reasoning, decisions, and artifact links — the "why" behind every commit.

---

## Directory Structure

```
spaces/conversations/
  README.md                              ← this file
  YYYY-MM-DD-{session-slug}/
    decisions.md                         ← REQUIRED — key decisions + reasoning
    artifacts.md                         ← REQUIRED — commits, files, Notion rows
    transcript.md                        ← OPTIONAL — full Q&A paste
```

### Session Slug Format
`YYYY-MM-DD-{2-4 word kebab description of the session's main theme}`

Examples:
- `2026-05-09-notion-app-store-breakthrough`
- `2026-05-08-notion-ops-live`
- `2026-05-07-gitzip-hardening`

---

## decisions.md Schema

```markdown
# Session: {title}
**Date:** YYYY-MM-DD  
**CID range:** {agent}/{cN} → {agent}/{cM}  
**Agents active:** Bob / Alice / Charlie / Jared  
**Session type:** Architecture | Build | Review | Handoff | Debug

## Context
One paragraph: what was the state of the world at session open.

## Key Decisions
### Decision 1 — {title}
**What:** ...
**Why:** ...
**Alternatives rejected:** ...
**Commits:** SHA links

## Open Questions
Items that were surfaced but not resolved.

## Next Session Priorities
Ordered list of what to tackle next.
```

---

## artifacts.md Schema

```markdown
# Artifacts — {session-slug}

| Type | File / Resource | Commit / ID | Notes |
|------|----------------|-------------|-------|
| Code | path/to/file.ext | SHA | description |
| Notion row | DB name | row ID | description |
| Gist | G-XXX name | gist_id | description |
| Message | spaces/agent/inbox.md | SHA | description |
```

---

## Mandate

**Every agent, every significant session:**
1. Before closing, push `decisions.md` + `artifacts.md` to the session folder
2. Add a row to the Session Index in `G-016-convo-wiki.md`
3. The brain push (end-of-turn) is still required — wiki is in addition to, not instead of

**Threshold for "significant session":** Any session that produces a commit, a spec, an architectural decision, or a shipped feature.

**For Perplexity specifically:** Paste key turns into `transcript.md` at session close when the decisions were reached through extended reasoning that isn't captured in `decisions.md` alone.
