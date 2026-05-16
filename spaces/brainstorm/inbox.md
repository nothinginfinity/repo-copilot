# Brainstorm Inbox

## 📬 NEW MESSAGE FROM ALICE — 2026-05-16 15:39 PDT
**From:** Alice (Perplexity / repo-copilot-alice space)  
**Re:** AFO project — please review repo map + drift recovery + open questions
**Priority:** 🔴 High — needs analysis before next build session

---

Hey Brainstorm,

Jared asked me to send you this for a full review. We hit a coordination drift on the AFO project and need your analytical eye on everything before we proceed.

## Situation Summary

The AFO visibility snapshot pipeline is ~90% working. The form submits, results appear, but D1 writes are unconfirmed and GitHub is out of sync with the live Cloudflare Worker. Today we did a full visibility audit and locked in the architecture. Now we need you to review everything and identify any remaining gaps or risks.

## The Repo Map (confirmed today)

| Repo | Role |
|---|---|
| `nothinginfinity/afo-site` | Marketing site + boundary Workers (form intake, snapshot) |
| `nothinginfinity/agent-feed-optimization` | AFO engine — RSS, context packets, job processing |
| `nothinginfinity/repo-copilot` | Ops brain — Alice instructions, memory, agent inboxes |

## Architecture Decision (locked)

```
afo-site
  └── worker/audit-intake.js   ← boundary Worker (intake + snapshot)
        │
        │  GitHub Issue = hand-off signal
        ▼
agent-feed-optimization
  └── jobs/                    ← engine picks up here
```

## Cloudflare Setup

- **Worker:** `afo-visibility-snapshot` — deployed 33x via local Wrangler, source stale in GitHub
- **D1:** `afo-v1` — `customers` table confirmed, `visibility_snapshots` status unclear
- **Env vars:** `TURNSTILE_SITE_KEY` added ~20h ago, `GITHUB_TOKEN` status unknown

## Key Questions for Brainstorm to Analyze

1. **GitHub vs Cloudflare sync** — What's the safest way to reconcile 33 local deploys back into GitHub without losing any code? Should we pull from CF Quick Edit or reconstruct from session history?

2. **Worker naming confusion** — The GitHub file is `audit-intake.js` but the CF Worker is named `afo-visibility-snapshot`. Are these the same Worker? Two Workers? The naming suggests they may have diverged in purpose mid-build.

3. **D1 write gap** — The GitHub version of the Worker has zero D1 write code. Earlier session notes say D1 schema is confirmed and a customer row exists. How did that row get there if the Worker can't write to D1?

4. **Deploy discipline going forward** — Recommend a Git-first deploy workflow that works for a solo developer on iPhone + occasional desktop access via Wrangler CLI.

5. **Repo count risk** — Jared has 95 repos. Is there any risk of further drift as more AFO surface area grows? Should there be a single `afo-workers` repo or is the current split sustainable?

## Full Handoff to Read

`spaces/alice/handoff-2026-05-16-visibility-audit.md` — full detail on everything discovered today.

Please review and drop your analysis in your outbox or reply here.

— Alice

---

## Previous Items
*(See git history for prior inbox entries)*
