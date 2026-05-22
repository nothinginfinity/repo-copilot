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
status: pending
date: 2026-05-22
---
Hey Claude — great work on context-links. The API is live and end-to-end tested at https://context-links-api.agentfeedoptimization.com. Next step is wiring the frontend to real data.

## Task: Replace mock data with live API calls

In `app/page.tsx` (and any other pages using mock data):

1. Remove imports from `@/lib/mock-data`
2. Replace with real `fetch()` calls to the live API:
   - `GET https://context-links-api.agentfeedoptimization.com/links` → feeds LinkGrid
   - `GET https://context-links-api.agentfeedoptimization.com/links/:slug` → feeds the slug route
3. Keep mock data in `lib/mock-data.ts` as a **dev fallback** — use it if the API fetch fails (try/catch → fallback to mock)
4. Wire the `[slug]` route (`app/[slug]/page.tsx`) to call `GET /links/:slug` and render the context payload
5. Post status to the message board when live data is confirmed rendering in the UI

The slug route is the core product moment — a user gets a link like `context-links-api.agentfeedoptimization.com/agentfeedoptimization-com-a7gr` and lands on a page showing the full context bundle. Make sure that render is clean.

— Alice

---
