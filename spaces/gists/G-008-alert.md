# G-008 — ALERT 🚨

> **Type:** `ALERT` 🚨
> **Road sign:** Flashing warning light
> **Owner:** any agent
> **Load order:** Step 5 — after handoff (G-005), before inbox
> **glow_channel:** `context.alert`

---

## Purpose

G-008 is the ALERT gist type. Any agent can create an ALERT gist to broadcast a **time-sensitive, blocking flag** to the other agent without requiring them to read the full handoff or inbox.

Use an ALERT when:
- A branch, file, or system is mid-migration and must not be touched
- A secret, credential, or key has been rotated and agents need to use the new value
- A workflow is broken and no agent should push until it is fixed
- Any state exists that would cause the other agent to make a destructive or incorrect action if they proceeded without this knowledge

Do **not** use ALERT for normal task handoffs — use G-005 HANDOFF for that.

---

## Schema

An ALERT gist is a single Markdown file with the following structure:

```markdown
# ALERT 🚨 — <short title>

> **Severity:** BLOCKING | WARNING | INFO
> **Raised by:** <agent/cid>
> **Raised at:** YYYY-MM-DDTHH:MM:SSZ
> **Expires:** YYYY-MM-DD | never | on-condition: <condition>
> **Affects:** <repo, branch, file, or system>

## What happened

<1–3 sentences — what is wrong or in-progress>

## What NOT to do

- <specific action to avoid>
- <specific action to avoid>

## Safe to proceed when

<condition that clears this alert — e.g. "Bob confirms merge is complete">

## Cleared by

> _(leave blank until resolved)_
> Cleared by: <agent/cid> at YYYY-MM-DDTHH:MM:SSZ
```

---

## Severity Levels

| Severity | Meaning |
|----------|---------|
| `BLOCKING` | Do not proceed — acting without reading this will cause damage |
| `WARNING` | Proceed with caution — read before acting on affected area |
| `INFO` | FYI — no immediate action needed, but important context |

---

## Lifecycle

1. **Raise** — any agent creates an ALERT gist file (e.g. `spaces/gists/G-008-alert-<slug>.md`) and adds it to the Active Gists table in `spaces/gists.md` with type `ALERT 🚨`
2. **Load** — both agents load ALERT gists at session startup **step 5**, before reading inbox
3. **Clear** — the agent that resolves the condition fills in the "Cleared by" block and marks the row `_archived_` in the registry

> Multiple ALERTs can be active simultaneously. Each gets its own numbered file or slug suffix.

---

## Example

```markdown
# ALERT 🚨 — gitzip-push validate-and-unpack mid-refactor

> **Severity:** BLOCKING
> **Raised by:** bob/c1/jared
> **Raised at:** 2026-05-09T03:15:00Z
> **Expires:** on-condition: Bob confirms refactor merged
> **Affects:** nothinginfinity/gitzip-push — main branch — .gitzip/validate-and-unpack.js

## What happened

Bob is mid-refactor on validate-and-unpack.js. The current main branch has
an incomplete intermediate state. Pushing any changes to this file will
cause merge conflicts and break the security fix.

## What NOT to do
- Do not push changes to `.gitzip/validate-and-unpack.js`
- Do not merge any PR targeting this file

## Safe to proceed when

Bob posts "validate-and-unpack refactor merged" in Alice's inbox.

## Cleared by

> Cleared by: bob/c1/jared at 2026-05-09T04:22:00Z
```

---

## Notes

- This gist **type** (G-008) is the **specification** for the ALERT system.
- Actual active alerts get their own files (e.g. `G-008-alert-gitzip.md`) registered in `spaces/gists.md`.
- Currently no active ALERT is raised — this is a clean stack.
- Proposed in `alice/c1/jared` session; formalized `2026-05-09` by Alice (alice/c2/jared).
