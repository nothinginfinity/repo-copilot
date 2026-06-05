# Handoff Prompt — contractor-v003-2-afo
**Last updated:** 2026-06-05  
**Use this prompt verbatim to start a new chat that will build v003-2**

---

## Paste this into the new chat:

---

I'm building contractor demo sites on Cloudflare Workers. I need you to build the next version of a working demo. Here is everything you need to get started — read it fully before doing anything.

---

### Step 1 — Read these two files from GitHub first

Use the `github-mcp` tool to read both files from repo `nothinginfinity/repo-copilot`:

1. `handoffs/contractor-v003-1-afo-handoff.md` — the reference build: architecture, critical JS escaping rules, what's working, lessons learned
2. `handoffs/contractor-v003-2-afo-roadmap.md` — the full feature spec for what to build next, including build order, D1 schema, and technical implementation details

Read both completely before asking any questions or writing any code.

---

### Reference demo (DO NOT TOUCH)

- **URL:** https://contractor-v003-1-afo.jaredtechfit.workers.dev
- **Admin:** https://contractor-v003-1-afo.jaredtechfit.workers.dev/admin (password: `demo`)
- **Worker name:** `contractor-v003-1-afo`
- **Last deployed:** 2026-06-05T20:13:34Z, version 0.1.2
- **Status endpoint:** https://contractor-v003-1-afo.jaredtechfit.workers.dev/api/status

Do not modify this worker, its D1 database, or its Vectorize index. It is the reference. All new work goes into `contractor-v003-2-afo`.

---

### Cloudflare account

- **Account ID:** `280908cb4e54b81745740accf5f0500f`
- **Account subdomain:** `jaredtechfit.workers.dev`

---

### Existing infrastructure — v003-1 (reference only, do not touch)

| Resource | Name | ID |
|---|---|---|
| Worker | `contractor-v003-1-afo` | deployed |
| D1 Database | `contractor_v003_1_afo_db` | `de60f6d2-9244-4699-ba14-3664db55315e` |
| Vectorize Index | `contractor-v003-1-afo-vector` | 768 dims, cosine |
| R2 Bucket | `afo-site-content` | prefix: `contractor-v003-1/uploads/` |

### Target infrastructure — v003-2 (create fresh)

| Resource | Name | Notes |
|---|---|---|
| Worker | `contractor-v003-2-afo` | new, deploy fresh |
| D1 Database | `contractor_v003_2_afo_db` | create new via `afo-d1-admin-mcp` |
| Vectorize Index | `contractor-v003-2-afo-vector` | 768 dims, cosine, bge-base-en-v1.5 |
| R2 Bucket | `afo-site-content` | same bucket, new prefix `contractor-v003-2/` |
| AI Binding name | `AI` | |
| D1 Binding name | `V003_2_DB` | |
| Vectorize Binding | `V003_2_VECTORIZE` | |
| R2 Binding name | `V003_2_R2` | |

---

### MCP tools available — use these to build

All of the following MCP servers are connected and available. Use them instead of asking for manual steps.

**Cloudflare deployment:**
- `cloudflare-multipart-mcp` — deploy workers with bindings, create Vectorize indexes, execute/query D1 SQL, list workers. This is the primary deploy tool.
- `cf-multipart-vnext-r2` — alternative deploy tool, also lists Vectorize indexes
- `afo-d1-admin-mcp` — create and manage D1 databases
- `afo-worker-transport-mcp` — deploy workers from GitHub source

**GitHub:**
- `github-mcp` — read files, list directories, commit files to `nothinginfinity/repo-copilot` (branch: main)
- `afo-gitZip` — push multiple files to GitHub in one call

**Vector/knowledge:**
- `Vector-lab-mcp` — list Vectorize indexes, generate embeddings, upsert vectors, hybrid search

**Receipts go to:** `receipts/contractor-v003-2-afo-*.json` in `nothinginfinity/repo-copilot`

---

### GitHub repo structure

**Repo:** `nothinginfinity/repo-copilot` (branch: `main`)

Key paths:
- `handoffs/` — handoff docs and roadmaps (read these first)
- `receipts/` — deployment receipts written after each build step
- `workers/contractor-v003-1-afo/worker.js` — v003-1 source reference
- `workers/contractor-v003-2-afo/worker.js` — write v003-2 source here when done

---

### What already exists in the Cloudflare account

**Workers** (partial list of contractor-related ones — do not touch any of these):
- `contractor-v001-afo`, `contractor-v002-afo`, `contractor-v003-afo`
- `contractor-v003-1-afo` ← reference demo, hands off
- `contractor-v004-afo` through `contractor-v008-afo`

**D1 databases** (do not touch these):
- `contractor_v003_1_afo_db` (`de60f6d2-9244-4699-ba14-3664db55315e`)
- `contractor_v008_afo_db` (`d9fdc3d3-d748-492d-b6ef-24d1b6b85e93`)
- `contractor_v007_afo_db` (`f6f5b8e5-b5d1-48c7-b5a5-cb334c81bae2`)

**Vectorize indexes** (do not touch these):
- `contractor-v003-1-afo-vector` (768 dims, cosine)
- `contractor-v007-afo-vector` (768 dims, cosine)
- `contractor-v008-afo-vector` (768 dims, cosine)

**R2 Bucket:** `afo-site-content` — shared bucket. New work uses prefix `contractor-v003-2/`. Do not delete or modify existing prefixes.

---

### Critical technical rules — must follow

1. **Never overwrite v003-1.** Always deploy as a brand new worker named `contractor-v003-2-afo`.

2. **Always use `@cf/baai/bge-base-en-v1.5` for embeddings** (768 dims). Never use `bge-large` (1024 dims) — it is incompatible with existing Vectorize indexes.

3. **All frontend JS must use string array concatenation — never template literals.** When JS is embedded inside a Worker's HTML-building function, template literals mangle regex patterns (e.g. `/\*\*(.+?)\*\*/g` becomes broken) and corrupt quote-escaped onclick attributes, silently breaking all click handlers. The correct pattern is:
   ```javascript
   function buildPublicJS() {
     return [
       'var boldRe = new RegExp("\\\\*\\\\*(.+?)\\\\*\\\\*", "g");',
       'safe = safe.replace(boldRe, "<strong>$1</strong>");',
     ].join('\n');
   }
   ```
   This is the single most important technical rule. The handoff doc has the full explanation and pattern.

4. **Vectorize propagation delay.** After upserting vectors to a fresh index, queries return empty for ~1-2 minutes. This is normal. Don't treat it as a bug.

5. **Write receipts to GitHub** after each major step (deploy, schema, seed) as `receipts/contractor-v003-2-afo-{step}.json`.

---

### Company being demoed

**CCS Services Group** — Los Angeles general contractor  
Phone: (818) 624-7212  
License: CSLB #890991  
Services: Kitchen remodeling, bathroom remodeling, ADUs, home additions, new construction, exterior/structural  
Service areas: Silver Lake, Burbank, Glendale, Pasadena (and surrounding LA areas)

The public-facing site keeps the same design as v003-1: navy/gold color scheme (`#1a2744` / `#c8a84b`), Oswald + Inter fonts, same sections (hero, services, portfolio, process, reviews, lead form).

---

### After reading both docs, ask:

"I've read the handoff doc and roadmap. The build has 5 phases. Which phase do you want to start with, or should I build them all in order?"

Do not start writing code until you've asked this and received an answer.
