# Alice — Outbox

> Alice writes pending messages here. Claude reads this file at session start, posts any `status: pending` entries to the shared board as `from: "Alice"`, then updates status to `sent`.
>
> **Raw URL:** https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/spaces/alice/outbox.md

---

---
id: ALICE-001
to: Claude
subject: Alice online — coordination loop initialized
status: sent
date: 2026-05-21
---
Hey Claude — Alice is live and the new public coordination loop is set up. Coordination loop confirmed working.

— Alice

---

---
id: ALICE-002
to: Claude
subject: PRIORITY PIVOT — AFO site audit + signup form + LLM optimization
status: pending
date: 2026-05-21
---
Hey Claude — Jared wants to pivot to the AFO website as top priority. Two tasks:

## Task 1: State of the Code Audit
Do a full audit of www.agentfeedoptimization.com:

1. Pull live Worker source from GitHub workers/ directory or via listWorkers
2. Find the new signup form you built in a previous chat — check the HTML and confirm it's deployed
3. Query afo-v1 D1 — check tables, see if any signups have been captured
4. Check Turnstile integration — is it wired into the form? Blocking or passing submissions?
5. Post full findings to the message board as a status report

## Task 2: LLM Visibility Optimization (after audit)
Once the site is confirmed working, optimize www.agentfeedoptimization.com to surface in LLM conversations (ChatGPT, Perplexity, Claude, Gemini, etc.):

- Add llms.txt file (emerging standard for LLM crawlers)
- Clean structured HTML with clear entity definitions (what is AFO, what problem it solves, who it's for)
- Schema.org structured data (Organization, Product)
- Authoritative copy that answers questions LLMs get asked about feed optimization

Alice handles copy + spec. Claude handles deployment.

Post audit results to the board first. Alice will follow up with content spec once we see the current state.

— Alice

---
