# Handoff: CCS Services Group Demo — contractor-v003-1-afo
**Date:** 2026-06-05  
**Status:** ✅ Fully working — use as reference only, never modify  
**Handoff purpose:** Enable a new chat to build polish upgrades as contractor-v003-2-afo

---

## What exists and is working

**Live demo URL:** https://contractor-v003-1-afo.jaredtechfit.workers.dev  
**Admin panel:** https://contractor-v003-1-afo.jaredtechfit.workers.dev/admin  
**Admin password:** `demo`  
**Company:** CCS Services Group (LA general contractor — kitchens, bathrooms, ADUs, additions, new construction)  
**Phone:** (818) 624-7212  

### Infrastructure (DO NOT MODIFY)
| Resource | Name | ID/Detail |
|---|---|---|
| Cloudflare Worker | `contractor-v003-1-afo` | jaredtechfit.workers.dev |
| D1 Database | `contractor_v003_1_afo_db` | `de60f6d2-9244-4699-ba14-3664db55315e` |
| Vectorize Index | `contractor-v003-1-afo-vector` | 768 dims, cosine, bge-base-en-v1.5 |
| R2 Bucket | `afo-site-content` | prefix: `contractor-v003-1/uploads/` |
| AI Binding | `AI` | Llama-3.1-8b-instruct for chat/articles |

### Worker bindings
- `AI` → Cloudflare AI
- `V003_1_DB` → D1
- `V003_1_VECTORIZE` → Vectorize
- `V003_1_R2` → R2

### D1 Tables
`knowledge_seeds`, `faqs`, `service_areas`, `generated_articles`, `customers`, `receipts`, `prompt_requests`, `upload_metadata`

### Seeded vectors (17 total)
- 7 knowledge_seeds (kitchen, bathroom, ADU, additions, new construction, exterior, CCS overview)
- 6 FAQs (pricing, timeline, permits, licensing, service area, estimates)
- 4 service_areas (Silver Lake, Burbank, Pasadena, Glendale)

### Working features
- **Sticky chat FAB** — "Estimate / Chat" button, bottom-right, gold
- **Chat drawer** — slides up from bottom, phone number always pinned at top (tap-to-call)
- **Estimate flow** — state machine: init → project type → location → call or upload
- **QA/RAG** — Vectorize semantic search + Llama answers, always appends CTA
- **Lead form** — full form (name, email, phone, project type, budget, timeline, message) → D1
- **File upload** — photos/video → R2, logged in D1 with `notified=0` flag
- **Admin panel** — password-gated, dark navy/gold theme
  - System status cards
  - Seed Knowledge Base (per-table buttons)
  - Knowledge Search Tester
  - AI Article Generator (working — 1 article created)
  - Saved Articles list
- **Portfolio** — 6 project cards with lightbox, filter by type
- **Services tabs** — Kitchen / Bathroom / ADU / New Construction / Exterior
- **Reviews section** — 3 testimonials
- **Process steps** — 3-step section

### Routes
| Route | Method | Description |
|---|---|---|
| `/` | GET | Public frontend |
| `/admin` | GET | Password-gated admin |
| `/chat` | POST | Chat + estimate state machine |
| `/leads` | POST | Lead form submission |
| `/upload` | POST | R2 file upload |
| `/api/status` | GET | System health |
| `/api/knowledge/search` | GET | Vector search (`?q=`) |
| `/api/knowledge/seed` | POST | Embed pending rows |
| `/api/generate-article` | POST | AI article generation |
| `/api/articles` | GET | List saved articles |

---

## Critical lessons learned — must carry forward

### 1. JS in Cloudflare Workers — NEVER use template literals for the script block
The Worker builds HTML via string concatenation (`+`). When frontend JS is embedded inside a JS template literal (backtick string), regex patterns like `/\*\*(.+?)\*\*/g` get mangled and `\'` quote escapes render as literal backslash-quote in the browser, silently breaking all click handlers.

**The fix (already in v003-1):** `buildPublicJS()` is a dedicated function that returns the entire frontend JS as an array of plain strings joined with `\n`. Zero template literals in the JS block. Regex constructed via `new RegExp(...)` to survive the string pipeline.

```javascript
// WRONG — will mangle regex and quotes:
function buildPublic() {
  return `<script>
    text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  </script>`;
}

// RIGHT — safe pattern used in v003-1:
function buildPublicJS() {
  return [
    'var boldRe=new RegExp("\\\\*\\\\*(.+?)\\\\*\\\\*","g");',
    'safe=safe.replace(boldRe,"<strong>$1</strong>");',
  ].join('\n');
}
```

### 2. Embedding model — always bge-base-en-v1.5 (768 dims)
Never use `bge-large` (1024 dims) — it crashes the Vectorize index. The index is created for 768 dims and cannot be changed without deleting and recreating it.

### 3. onclick attributes in string-concatenated HTML
Use plain single quotes inside double-quoted HTML attributes:
```javascript
// RIGHT:
'<button onclick="openChat(\'estimate_start\')">...'  // renders: onclick="openChat('estimate_start')"

// WRONG — browser sees literal backslash:
'<button onclick="openChat(\\\'estimate_start\\\')">...'
```

### 4. Vectorize propagation delay
On a fresh index, vector queries return empty for ~1-2 minutes after upsert. This is normal Cloudflare behavior and resolves automatically.

### 5. D1 lead capture
All leads have `notified=0` flag — ready to wire to email/SMS (Cloudflare Queue, webhook, Resend, or Twilio) in a future version.

---

## How to build the next version (v003-2)

### Naming convention
- New worker: `contractor-v003-2-afo`
- New D1: `contractor_v003_2_afo_db`
- New Vectorize: `contractor-v003-2-afo-vector`
- New URL: `contractor-v003-2-afo.jaredtechfit.workers.dev`
- New bindings: `V003_2_DB`, `V003_2_VECTORIZE`, `V003_2_R2` (same R2 bucket, new prefix `contractor-v003-2/uploads/`)

### Process
1. Read the v003-1 worker source from GitHub: `workers/contractor-v003-1-afo/worker.js`
2. Copy it as the starting point for v003-2
3. Make all changes to the copy
4. Deploy as a new worker — never overwrite v003-1
5. Create a new D1 database and Vectorize index for v003-2
6. Re-seed the new Vectorize index after deploy
7. Write receipts to `receipts/contractor-v003-2-afo.*.json`

### MCP tools available
- `cloudflare-multipart-mcp` — deploy workers, create Vectorize indexes, execute D1 SQL
- `afo-d1-admin-mcp` — create/manage D1 databases
- `github-mcp` — read source files, commit receipts
- `afo-gitZip` — push multiple files to GitHub

---

## Suggested polish upgrades for v003-2

These are ideas — pick and choose based on priority:

**Chat improvements**
- Collect name + phone number earlier in the estimate flow (before "call or upload" step)
- Save partial estimate leads to D1 mid-flow (not just on upload completion)
- Better handling of free-text city entry (currently only Silver Lake/Burbank/Glendale/Pasadena as quick buttons)
- "Schedule a callback" quick action that pre-fills lead form and scrolls to it

**Lead form**
- Success state should clear the form fields
- Add address/zip field for better lead qualification
- Optional: add a file attach field directly in the lead form (not just chat)

**Notification hookup**
- Wire `notified=0` leads to email via Resend or webhook
- Could be a Cloudflare Queue consumer or a simple fetch to a webhook URL on lead save

**Design**
- Real project photos (replace Unsplash placeholders with actual CCS project photos)
- Google reviews widget or embed
- Add a "Service Areas" section with a map or city list
- Mobile: chat drawer takes full screen width (already done) but could use a taller message area

**Admin**
- View leads list (currently no UI to see submitted leads)
- Export leads as CSV
- Mark leads as contacted / notified

**SEO / content**
- Meta tags for each service (currently one generic meta description)
- Published articles page (currently articles are generated but not publicly displayed)

---

## GitHub receipts
- `receipts/contractor-v003-1-afo.create.json`
- `receipts/contractor-v003-1-smoke-tests.json`
- `receipts/contractor-v003-1-seed.json`
- `handoffs/contractor-v003-1-afo-handoff.md` ← this file

## Source
Worker source should be saved at: `workers/contractor-v003-1-afo/worker.js`  
(If not yet committed, the Claude session that built this has the full source in context — ask it to commit before closing.)
