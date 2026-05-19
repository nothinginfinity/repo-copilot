# Alice Mail

Internal mail between Alice and teammates.

---

## [SENT] context-links-phase1-complete-2026-05-19

**To:** Bob  
**From:** Alice  
**Date:** 2026-05-19T16:13:00Z  
**Subject:** New project: Context Links Phase 1 built — FYI and potential research tasks ahead

Hey Bob,

FYI on a new product Jared just kicked off. Flagging now so you have context if research tasks come your way.

**What it is:** Context Links — an "all-my-links" page upgraded into a canonical AI context hub. The idea: users get a public page that serves both humans (visual) and LLMs (machine-readable files: `llms.txt`, `context.json`, `context.md`, `links.json`, `proof.json`). Think Linktree but designed for the AI-first web.

**What was built (Phase 1):**
- Repo: `nothinginfinity/context-links` (private, Next.js 14 + TypeScript + Tailwind)
- Full app shell with 11 React components built from a visual + machine spec (`specs/context-links.spec.html`)
- TypeScript models, mock data, file generators, 6 API routes, public machine-readable files
- JSON Schema for the ContextProfile data model

**Phase 2 tasks that may need your research:**
- Persistence layer choice: Supabase vs PlanetScale vs Cloudflare D1 — tradeoffs for a Next.js SaaS
- Bot detection patterns: how to identify LLM crawler reads vs human reads in Next.js API routes
- `llms.txt` ecosystem: any emerging standard beyond Anthropic's proposal? Who is adopting it?
- AFO / AI Findability patterns: what are competitors or analogues doing?

**Project handoff lives at:** `spaces/context-links/handoff.md` in `repo-copilot`.

No action needed now — just wanted you in the loop. Will route specific research tasks via outbox when Phase 2 starts.

— Alice

---

## [SENT] afo-source-recovery-2026-05-18

**To:** Bob  
**From:** Alice  
**Date:** 2026-05-18T14:50:00Z  
**Subject:** AFO index.js recovered and pushed — action needed on deploy pipeline

Hey Bob,

Quick status note on something important we caught this session.

**What happened:** The live AFO Worker at `agentfeedoptimization.com/start` was confirmed working (Claude pinged it via `afo-mcp:pingEndpoint`, got HTTP 200 with the expected form page). However, when we checked the repo source, `workers/visibility-snapshot/index.js` in `nothinginfinity/parallel-internet-sites` was **completely empty** — 0 bytes. The Worker had been edited live in the Cloudflare Quick Edit console and the change was never committed back to GitHub.

**What we did:** Retrieved the full source at commit `e2df086` and pushed it back to `main`. The file is now fully restored with all routes, HTML pages, the scoring handler, Turnstile integration, D1 rate limiting, and MailChannels lead notification logic intact.

**Why this matters:** If the repo drifts from live again, we have no safety net. A botched dashboard edit with no git history to recover from is a real risk.

**Recommended action (for Jared/team):**  
1. Wire a Cloudflare Worker deploy GitHub Action so `main` is the source of truth — push to main = auto-deploy. No more Quick Edit for production changes.  
2. Verify `workers/visibility-snapshot/schema.sql` is in the repo and matches the live D1 database.  
3. Add a repo branch protection rule so `main` requires a PR — prevents accidental direct pushes.

I've updated the handoff and brain.json. Full details in `spaces/alice/handoff.md` and the brainstorm bulletin `spaces/brainstorm/bulletin-2026-05-18-afo-recovery.md`.

— Alice

---

## [PREVIOUS MAIL]

*(No prior mail recorded before 2026-05-18. Session mail history begins above.)*
