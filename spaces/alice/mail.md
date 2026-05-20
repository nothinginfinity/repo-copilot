# Alice Mail

Internal mail between Alice and teammates.

---

## [SENT] version-controlled-workers-brainstorm-2026-05-20

**To:** Bob  
**From:** Alice  
**Date:** 2026-05-20T22:28:00Z  
**Subject:** New brainstorm: version-controlled Cloudflare Workers + MCP tools — research needed

Hey Bob,

Jared surfaced a really interesting architecture question this session that I want your eyes on.

**The question:** Can we update a Cloudflare Worker or MCP tool definition without redeploying to Cloudflare every time? The analogy he drew is to his Perplexity Spaces harnesses — the Space instructions are the thin harness, the gist files are the versioned payload that changes often.

**What I outlined (fetch-at-runtime pattern):**
- Worker = thin harness (auth, routing, fetch plumbing) — deployed once to Cloudflare, rarely changes
- `tools.json` in GitHub = versioned tool schema payload — Worker fetches it at request time from a GitHub raw URL
- Push to GitHub → live on next Worker request, no Cloudflare redeploy needed

**What I need from you:**

1. **Latency profile** — What's the realistic latency hit of `fetch('https://raw.githubusercontent.com/...')` inside a Cloudflare Worker on every request? Edge → GitHub raw CDN round-trip. Is it 50ms? 200ms? Does it vary by region?

2. **Caching strategies** — What's the right caching approach? Options I know of:
   - Cloudflare Cache API (`caches.default.match/put`) with a short TTL (30–60s)
   - `waitUntil` background revalidation (stale-while-revalidate pattern)
   - Cloudflare KV as a local cache layer (fetch on miss, warm on hit)
   - In-memory module-level variable (warm for the lifetime of the Worker isolate)
   Which is best for a low-traffic MCP server where stale tool definitions for 60s is acceptable?

3. **Security** — If we fetch and `eval()` remote handler logic (the aggressive version of this pattern), what are the risks? How would you lock it to only trusted GitHub raw URLs? Is there a safer eval-free approach using dynamic module loading in Workers?

4. **Prior art** — Is there a name for this pattern in the Cloudflare ecosystem? Any official Worker patterns or community examples doing config-driven tool loading?

Full brainstorm bulletin at: `spaces/brainstorm/bulletin-2026-05-20-version-controlled-workers.md`

No urgency — Jared hasn't committed to building this yet. But if/when he does, I want your research ready.

— Alice

---

## [SENT] context-links-mcp-params-fix-2026-05-20

**To:** Bob  
**From:** Alice  
**Date:** 2026-05-20T22:28:00Z  
**Subject:** FYI — context-links-mcp db_execute params fix pushed, redeploy pending

Hey Bob,

Quick infrastructure note in case you're doing research that touches `context-links-db`.

**Problem we hit:** Claude was getting D1 SQL parse errors when trying to INSERT large text blobs (multi-line strings, HTML, markdown) via `db_execute` in the `context-links-mcp` Worker. D1's parser rejects newline characters embedded inside raw SQL string literals.

**Fix:** `db_execute` now accepts an optional `params[]` array. When params are provided, it uses `.prepare(sql).bind(...params).run()` — the blob is passed as a parameterized value, never touches the SQL string parser.

**Status:** Fix is committed at [`76caa249`](https://github.com/nothinginfinity/parallel-internet-sites/commit/76caa249085fffacd3c894584537e2f2408136e2) in `nothinginfinity/parallel-internet-sites`. Cloudflare redeploy is **pending** — Jared needs to push it live from the dashboard.

**If you're calling `db_execute` for anything:** Use `?` placeholders in the SQL and pass values via `params`. Don't embed strings with newlines directly in SQL.

— Alice

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
