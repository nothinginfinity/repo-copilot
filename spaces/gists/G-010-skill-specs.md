# G-010 — Skill: Spec Writing
_version: 1.0 | agent: alice | last-updated: 2026-05-11_

---

## Overview

This skill defines **how Alice writes specs**. Load this gist only when the task involves drafting, updating, or reviewing a specification document. Unload after the task is complete (do not carry into unrelated turns).

---

## 1. Spec Anatomy

Every spec Alice produces must include these sections in order:

```
SPEC-XXX — [Title]
_version: 1.0 | status: draft | owner: alice | date: YYYY-MM-DD_

## 1. Problem
What problem does this solve? One paragraph, no jargon.

## 2. Goal
What does success look like? Measurable if possible.

## 3. Scope
### In scope
- item
### Out of scope
- item

## 4. Design / Approach
How will it be built or structured? Key decisions and rationale.

## 5. Tasks
| ID | Task | Owner | Status |
|----|------|-------|--------|
| T-001 | ... | alice | pending |

## 6. Open Questions
| # | Question | Owner | Resolved |
|---|----------|-------|----------|
| Q-001 | ... | jared | no |

## 7. Changelog
| Version | Date | Change |
|---------|------|--------|
| 1.0 | YYYY-MM-DD | Initial draft |
```

---

## 2. Spec Numbering

- Specs are numbered sequentially: SPEC-001, SPEC-002, etc.
- Check `brain.json` for the last used spec number before assigning a new one
- Sub-specs (scoped to a parent): SPEC-003a, SPEC-003b
- Never reuse a spec number, even if the spec was abandoned

---

## 3. Spec Statuses

| Status | Meaning |
|--------|---------|
| `draft` | Being written, not yet reviewed |
| `review` | Ready for Jared or agent review |
| `active` | Approved, currently being executed |
| `complete` | All tasks done, merged to brain.json |
| `paused` | Blocked or deprioritized |
| `abandoned` | Dropped — note reason in changelog |

---

## 4. Writing Rules

- **Problem first, solution second.** Never open with implementation details.
- **One spec per concern.** If a spec is trying to solve two unrelated problems, split it.
- **Tasks must be atomic.** Each task should be completable in a single agent turn.
- **Open questions are first-class.** Don’t suppress uncertainty — surface it in Section 6.
- **Scope is a contract.** Out-of-scope items protect Alice from scope creep mid-execution.
- **Version every change.** Even a small edit bumps the version and logs in changelog.

---

## 5. Storage

- Specs live at: `spaces/specs/SPEC-XXX-title.md`
- After a spec reaches `complete`, summarize key decisions into `brain.json`
- Abandoned specs stay in `spaces/specs/` with `status: abandoned` — never delete

---

## 6. Spec → Inbox Flow

When a spec generates tasks for other agents:
1. Write the spec first, push it
2. Then write inbox messages to the relevant agents (alice-ops, alice-review, bob)
3. Reference the spec by ID in every inbox message: `ref: SPEC-XXX`
4. Never describe tasks inline in the inbox — always point to the spec

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-05-11 | Initial spec writing skill |
