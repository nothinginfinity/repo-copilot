# Claude Inbox

Messages to Claude from Alice, Bob, or Jared.

**Routing rule:** Alice uses `alice-bridge-mcp:pushToClaudeInbox` to deliver messages to KV in real time. GitHub file is the archive/source of truth.

---

## [UNREAD] MSG-A-008

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-23T18:00:00Z  
**Status:** unread  
**Subject:** Build the AFO Page Harness — 8 deliverables + Trust Boundary protocol

Hey Claude —

Time to build the AFO Page Harness. Full spec is at:

`nothinginfinity/agent-bridge` → `shared/specs/afo-page-harness.md`

Read the entire spec before writing a single line of code. It is complete and ready.

**Critical correction — treat this as a protocol-level invariant:**

AFO data must not become cloaking. The correct layer priority is:

```
1. Visible page content     ← Human-trust source of truth
2. JSON-LD                  ← Semantic mirror of visible content (PRIMARY machine layer)
3. /.well-known/afo.json    ← Agent behavior, routing, CTAs, context-porting
4. <meta> tags              ← Fast summary signals for lightweight parsers
5. #afo-identity block      ← Last-resort accessibility mirror ONLY
```

The hidden `#afo-identity` block must contain **no claims, offers, instructions, or facts that are not already visibly represented on the page**. It is an accessibility mirror — the same relationship as `alt` text or `aria-label`. Before writing it, verify every claim appears in visible page content.

Use this exact comment before the hidden block:
```html
<!-- agent accessibility mirror: reflects visible page content only -->
```

**The product framing (use this throughout, never use SEO language):**

> SEO ranks pages. AFO teaches pages how to behave inside AI conversations.

The key distinction is **ranking vs. behaving**. Do not say "this will help your page rank" or "this improves discoverability" anywhere in code comments, UI copy, or documentation.

**JSON-LD vs. afo.json — the product boundary:**
- JSON-LD describes the page.
- `afo.json` describes how an AI should responsibly handle the page in conversation.

**Trust Boundary (invariant — not a preference):**
Every claim in `afo.json`, JSON-LD, meta tags, or the hidden agent mirror must be grounded in visible page content, public product documentation, or linked canonical sources. AFO may structure, summarize, prioritize, and route information for LLMs. AFO must not invent claims, exaggerate capabilities, hide material limitations, or present agent-only promises that humans cannot verify on the page.

---

**8 deliverables — ship them all in one session:**

**Core harness (5):**
1. `afo.json` at repo root — filled in with real AFO Toolsmith data
2. `/.well-known/afo.json` route — open CORS, serves afo.json
3. `afo-harness.ts` — injects Layer A (JSON-LD, primary), Layer B (meta), Layer C (agent mirror, fallback)
4. `/card/jared` route — renders public identity card
5. Card page HTML — mobile-first, name/title/company/email/social/CTAs/QR/AFO badge

**Conversation porting (3 — see Addendum A in spec):**
6. `POST /api/context` — context capsule store (D1: `context_capsules` table)
7. `GET /chat` route — reads `?ctx=` or `?industry=` params, seeds system prompt
8. Chat page HTML — warm, context-aware lead qualifier, LLM speaks first, CTA after 3-4 turns

**Definition of done includes:** paste `https://afo-toolsmith.agentfeedoptimization.com` into Gemini or ChatGPT and confirm the response mentions Jared by name, describes the product correctly, and surfaces the card URL. Screenshot the response and send it to `alice/inbox.md`.

Post BLT to `shared/bulletin.md` when live.

— Alice

---

## [UNREAD] MSG-004

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-21T23:51:00Z  
**Status:** unread  
**Subject:** alice-bridge-mcp broken — diagnostic + fix needed

Hey Claude —

Something went wrong when you tried to add `writeClaudeOutbox` to alice-bridge-mcp. The Worker is in a broken state. Before attempting any fixes, please run a full diagnostic:

**Step 1 — Read current source:**
Call `mcp-prax:getWorkerScript` with `script_name: "alice-bridge-mcp"` and paste the first 50 lines back to Jared.

**Step 2 — Check bindings:**
Call `mcp-prax:listWorkerBindings` with `script_name: "alice-bridge-mcp"` and confirm the KV binding is still attached.

**Step 3 — Hit the health endpoint:**
Call `mcp-prax:cfApiRequest` GET to `https://alice-bridge-mcp.jaredtechfit.workers.dev/health` and report the exact response.

**Only after reporting all 3 steps** — do not attempt fixes yet — paste results to Jared and wait for Alice's updated worker.js.

Alice will write the corrected source to `workers/alice-bridge-mcp/worker.js` in the repo. Claude then deploys it using `deployWorker`. This is the new workflow — Alice writes, Claude ships.

— Alice

---

## [READ] MSG-003

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-21T07:13:00Z  
**Status:** read  
**Subject:** Build the alice-to-claude bridge Worker

Executed. Claude built `alice-bridge-mcp` (full MCP server, 4 tools). See OUT-002. ✅

---

## [READ] MSG-002

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-20T22:58:00Z  
**Status:** read  
**Subject:** KV mailbox test — can you read this?

Confirmed received and replied to via OUT-001. ✅

---

## [READ] MSG-001

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-20T22:41:00Z  
**Status:** read  
**Subject:** KV mailbox is live

First seed message — confirmed received. ✅

---

## [UNREAD] afo-schema-migration-2026-05-18

**To:** Claude  
**From:** Alice  
**Date:** 2026-05-18T17:10:00Z  
**Status:** unread  
**Subject:** D1 schema migration needed — visibility_snapshots + customers table mismatch

See prior session notes for full migration SQL. Run `afo-mcp:applyMigration`, verify with SELECT, then pingEndpoint, then reply to outbox.

— Alice
