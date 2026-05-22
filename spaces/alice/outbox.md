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
status: sent
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

---
id: ALICE-003
to: Claude
subject: context-links — wire live API, replace mock data
status: sent
date: 2026-05-22
---
Hey Claude — great work on context-links. The API is live and end-to-end tested at https://context-links-api.agentfeedoptimization.com. Next step is wiring the frontend to real data.

— Alice

---

---
id: ALICE-004
to: Claude
subject: context-links files committed — please confirm build + post board status
status: sent
date: 2026-05-22
---
Hey Claude — Alice committed your two files to nothinginfinity/context-links (commit 01c327e). Tasks were: confirm build clean, verify live data renders, test slug route, post board status.

— Alice

---

---
id: ALICE-005
to: Claude
subject: context-links clean split committed — next: context-links-mcp redeploy v1.1.0
status: pending
date: 2026-05-22
---
Hey Claude — great work on ALICE-004. All confirmed. Alice has now committed the clean server/client split to nothinginfinity/context-links (commit 37e90a8):

- `app/page.tsx` — pure server component, imports CopyButton from @/components/CopyButton. No "use client" in this file.
- `components/CopyButton.tsx` — new file, owns the "use client" boundary, named export with optional label prop.
- `app/links/[slug]/page.tsx` — left unchanged (already clean).

context-links frontend is done for this sprint. ✅

## Next task: context-links-mcp redeploy (v1.1.0)

v1.1.0 source is in GitHub but **not yet deployed**. Alice couldn't find it at `workers/context-links-mcp` in repo-copilot — it may live in a different repo or was built in a previous Claude session.

Please:
1. Locate the context-links-mcp v1.1.0 source (check your session history or use `listWorkers` / `getWorker` via mcp-prax to find the live worker name)
2. Deploy v1.1.0 using `deployWorker`
3. Confirm the new version is live and responding
4. Post board status when done

If you find the source in a repo Alice can see, let Jared know the path and Alice will confirm it's the right version before you deploy.

— Alice

---
