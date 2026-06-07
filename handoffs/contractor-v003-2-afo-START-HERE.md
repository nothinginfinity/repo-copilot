# contractor-v003-2-afo — Handoff Document
**Last updated:** 2026-06-07 | **Current version:** v0.5.1 | **Status:** Production

---

## What This Is

A full-stack contractor demo site running entirely on Cloudflare Workers. No Node server, no separate frontend build step. One JS file is the entire backend + frontend. Built as a reusable template — fork this for any new contractor or service-business customer.

**Live URL:** https://contractor-v003-2-afo.jaredtechfit.workers.dev
**Admin URL:** https://contractor-v003-2-afo.jaredtechfit.workers.dev/admin
**Admin password:** `demo`
**Client:** CCS Services Group — Licensed General Contractor, Los Angeles

---

## Infrastructure

| Resource | Value |
|---|---|
| Cloudflare Worker | `contractor-v003-2-afo` |
| Account ID | `280908cb4e54b81745740accf5f0500f` |
| D1 Database | `c0743318-ee23-4d08-9bd7-0d2b3cc36018` (binding: `V003_2_DB`) |
| Vectorize Index | `contractor-v003-2-afo-vector` (binding: `V003_2_VECTORIZE`) |
| R2 Bucket | `afo-site-content` (binding: `V003_2_R2`) |
| AI Binding | `AI` |
| Embedding Model | `@cf/baai/bge-base-en-v1.5` (768 dimensions, cosine) |
| Chat Model | `@cf/meta/llama-3.1-8b-instruct` |
| GitHub Repo | `nothinginfinity/repo-copilot` (branch: `main`) |
| Worker Source | `workers/contractor-v003-2-afo/contractor-v003-2-afo.js` |
| Wrangler Config | `workers/contractor-v003-2-afo/wrangler.toml` |

**API Token:** Stored as `CLOUDFLARE_API_TOKEN` in GitHub repo secrets. Do not paste in files. Retrieve from Cloudflare dashboard or ask the repo owner.

---

## Deploy Pipeline

**GitHub → Cloudflare is automatic.** Push any change to `workers/contractor-v003-2-afo/` on `main` and the GitHub Action (`.github/workflows/deploy-workers.yml`) runs `wrangler deploy` automatically.

**Required GitHub secret:** `CLOUDFLARE_API_TOKEN` must be set in repo Settings → Secrets → Actions. *(One-time manual step — repo owner sets this.)*

**Manual deploy (fallback — for Claude using bash_tool):**
```bash
cd workers/contractor-v003-2-afo
CLOUDFLARE_API_TOKEN=<token-from-repo-owner> wrangler deploy
```

**Important:** The worker is ~113KB. MCP deploy tools that pass script content as JSON string parameters will fail due to size limits. Always use `wrangler deploy` via CLI or the GitHub Action.

---

## Architecture

### Source of Truth
- **Code** → GitHub (`workers/contractor-v003-2-afo/contractor-v003-2-afo.js`)
- **Data** → Cloudflare D1 (leads, callbacks, articles, media, knowledge seeds, site content, snapshot)
- **Files** → Cloudflare R2 (uploaded images, audio, PDFs)
- **Vectors** → Cloudflare Vectorize (article + knowledge seed embeddings for RAG chat)

### How the Public Site Works
The public homepage (`/`) is served from a **pre-rendered HTML snapshot** stored in D1 (`site_snapshot` table). Zero DB calls on page load. When you edit content in admin and click **Publish Site Live**, the worker re-renders the full HTML from D1 data and saves a new snapshot. This means:
- Instant page loads (no DB query on every visit)
- You control exactly when changes go live
- The worker code is customer-agnostic — all content is in D1

### Key Functions in the Worker
| Function | Purpose |
|---|---|
| `renderPublicHTML(content, articles)` | Renders full homepage HTML from D1 content + published articles |
| `handlePublish(env)` | Reads D1, renders HTML, saves to `site_snapshot` |
| `handleHome(env)` | Serves snapshot (or renders on-the-fly if no snapshot) |
| `loadContent(env)` | Loads all sections from `site_content` table |
| `getContactConstants(env)` | Reads phone/company/license from D1 for use in API responses |
| `buildAdmin()` | Returns the full admin panel HTML (password-gated) |

---

## D1 Database Schema

```sql
-- Site content (CMS)
site_content (section TEXT PRIMARY KEY, data TEXT, updated_at TEXT)
-- Sections: services, projects, reviews, process, contact
-- data is a JSON blob

-- Pre-rendered public site
site_snapshot (id INTEGER PRIMARY KEY, html TEXT, published_at TEXT)

-- CRM
leads (id, name, email, phone, service, message, source, created_at, lead_section, status, budget_range, timeline)
callbacks (id, name, phone, preferred_time, service, message, source, created_at, lead_section, status)
chats (id, message, response, created_at)

-- Content
articles (id, slug, title, summary, body, published, hero_image_r2_key, created_at)
media_library (id, r2_key, filename, content_type, file_size, alt_text, category, uploaded_at)
knowledge_seeds (id, title, body, category, embedded, created_at, updated_at)
```

### site_content Data Structures

**services** — array of:
```json
{ "id": "kitchen", "tab": "Kitchen", "title": "Kitchen Remodeling",
  "desc": "...", "highlights": ["item1", "item2"],
  "image_url": "https://...", "image_r2_key": "", "sort": 1 }
```

**projects** — array of:
```json
{ "id": "p1", "title": "Silver Lake Kitchen", "location": "Silver Lake, CA",
  "type": "Kitchen Remodeling", "desc": "...",
  "image_url": "https://...", "image_r2_key": "", "sort": 1 }
```

**reviews** — array of:
```json
{ "id": "r1", "name": "Gary R.", "project": "Kitchen — Silver Lake",
  "text": "On budget, on time...", "stars": 5, "sort": 1 }
```

**process** — array of:
```json
{ "id": "s1", "num": "01", "title": "Free Estimate", "desc": "...", "sort": 1 }
```

**contact** — single object:
```json
{ "phone": "(818) 624-7212", "phone_url": "tel:+18186247212",
  "license": "CSLB #890991", "company": "CCS Services Group",
  "tagline": "Licensed, Bonded & Insured", "areas": "Los Angeles County",
  "hero_title": "LAs Trusted General Contractor",
  "hero_sub": "Kitchens, bathrooms, ADUs...",
  "hero_image_url": "https://...", "hero_image_r2_key": "",
  "stat1_num": "500+", "stat1_label": "Projects Completed",
  "stat2_num": "15+", "stat2_label": "Years in LA",
  "stat3_num": "100%", "stat3_label": "Licensed & Insured",
  "stat4_num": "5 Stars", "stat4_label": "Client Rating" }
```

---

## API Routes

### Public
| Method | Path | Description |
|---|---|---|
| GET | `/` | Public homepage (from snapshot) |
| GET | `/articles` | Articles index page |
| GET | `/articles/{slug}` | Individual article page |
| GET | `/media/serve/{r2_key}` | Serve file from R2 |
| POST | `/chat` | AI chat (RAG + estimate flow) |
| POST | `/leads` | Submit lead form |
| POST | `/callback` | Submit callback request |
| POST | `/upload` | Upload file to R2 (chat attachment) |
| GET | `/api/status` | Worker health + binding status |

### Admin API
| Method | Path | Description |
|---|---|---|
| POST | `/api/publish` | Re-render + save site snapshot |
| GET | `/api/content/{section}` | Get CMS section data |
| POST | `/api/content/{section}` | Save CMS section data |
| GET | `/api/admin/leads` | List leads (`?format=csv` for CSV export) |
| PATCH | `/api/admin/leads/{id}` | Update lead status |
| GET | `/api/admin/callbacks` | List callbacks |
| PATCH | `/api/admin/callbacks/{id}` | Update callback status |
| GET | `/api/admin/articles` | List all articles |
| GET | `/api/admin/articles/{id}` | Get single article |
| POST | `/api/admin/articles/{id}` | Save article (use `new` to create) |
| POST | `/api/admin/articles/{id}/toggle` | Toggle published flag |
| DELETE | `/api/admin/articles/{id}` | Delete article |
| POST | `/api/media/upload` | Upload to R2 + save to media_library |
| GET | `/api/media` | List all media |
| DELETE | `/api/media/{id}` | Delete media (R2 + DB) |
| GET | `/api/knowledge` | List knowledge seeds |
| POST | `/api/knowledge/{id}` | Save seed (use `new` to create) — auto-embeds |
| DELETE | `/api/knowledge/{id}` | Delete seed + remove from Vectorize |
| POST | `/api/seed` | Re-embed all articles to Vectorize |

### Lead/Callback Status Values
- leads: `new` → `contacted` → `quoted` → `won` / `lost`
- callbacks: `pending` → `called` → `no_answer` → `scheduled`

---

## Admin Panel Tabs

| Tab | What it does |
|---|---|
| Dashboard | System status, **Publish Site Live** button, re-embed articles |
| Leads | CRM table, status dropdowns, CSV export |
| Callbacks | CRM table, status dropdowns, CSV export |
| Articles | Create/edit/publish articles with body, summary, hero image |
| Media | Upload images/audio/video to R2, copy R2 keys for use in content |
| Knowledge | Add/edit knowledge seeds — auto-embedded to Vectorize on save |
| Services | Edit service panels (tab label, title, desc, highlights, image) |
| Projects | Edit portfolio cards (title, location, type, desc, image) |
| Reviews | Edit testimonials (name, project, text, stars) |
| Process | Edit process steps (number, title, description) |
| Contact | Edit all branding: company name, phone, hero content, stats |
| RAG Tester | Test what the chat AI would retrieve for any query |

---

## Critical Coding Rules

Any AI or developer working on this codebase MUST follow these:

1. **No template literals in embedded frontend JS.** All JavaScript inside `buildAdmin()` or `renderPublicHTML()` must use string array concatenation (`[...].join('\n')`) or `+` concat. Template literals corrupt `onclick` attribute escaping and break regex patterns silently. This is the single most important rule.

2. **D1 SQL — one statement per call.** D1/SQLite does not support multiple statements in a single MCP call. Run each DDL/DML separately.

3. **Vectorize index must exist before deploying.** Error code `10021` means the index does not exist yet. Create it first via `afo-d1-admin-mcp` or dashboard.

4. **Worker size limit for MCP deploy tools.** This worker is ~113KB. MCP tools that pass script content as a JSON string parameter will fail. Always deploy via `wrangler deploy` CLI or the GitHub Action.

5. **Always include all bindings when deploying.** Omitting the bindings array in any deploy call clears all existing bindings. Always specify all four: `V003_2_DB`, `V003_2_VECTORIZE`, `V003_2_R2`, `AI`.

6. **`imgSrc(item)` helper for images.** When rendering images in public HTML, use `imgSrc(item)` which prefers `image_r2_key` (served via `/media/serve/`) over `image_url` (external URL).

7. **Regex in embedded JS must use `new RegExp(...)`.** Never write a regex literal inside a string-concatenated JS block.

---

## How to Fork for a New Customer

1. **Create Cloudflare resources** for the new customer:
   - New D1 database (note the UUID)
   - New R2 bucket (any name)
   - New Vectorize index (768 dimensions, cosine, model `@cf/baai/bge-base-en-v1.5`)
   - AI binding is account-level — no new resource needed

2. **Copy the worker folder** in GitHub:
   ```
   workers/contractor-v003-2-afo/  →  workers/{new-customer-slug}/
   ```

3. **Update `wrangler.toml`** in the new folder with the new `name` and new resource IDs.

4. **Add a new job to `.github/workflows/deploy-workers.yml`** for the new worker path.

5. **Deploy once manually** via `wrangler deploy` to register the worker on Cloudflare.

6. **Run D1 schema setup** — execute all the `CREATE TABLE` statements (see schema above) against the new D1 database.

7. **Seed `site_content`** — POST JSON to `/api/content/services`, `/api/content/projects`, etc. with the new customer's data, or insert directly via D1.

8. **Log into `/admin`**, customize all content sections, upload images, then click **Publish Site Live**.

---

## What Is and Isn't Done

### Done
- Full public site — hero, services, projects, process, reviews, articles section, contact form, callback widget, footer
- AI chat widget with estimate flow + RAG fallback
- Admin CMS — all sections editable (services, projects, reviews, process, contact, articles)
- Media library — upload images, audio, video to R2
- Knowledge base — add seeds that auto-embed to Vectorize
- CRM — leads and callbacks with status workflows and CSV export
- Site snapshot publish system — pre-rendered HTML, instant page loads
- Articles on homepage (latest 3) + `/articles` index page
- GitHub → Cloudflare auto-deploy pipeline
- `wrangler.toml` committed to GitHub
- Contact constants (phone, company, license) driven from D1

### Not Yet Done
- **Email notifications** — no alert when a new lead or callback comes in (planned: Resend integration)
- **Voice recorder widget** — in-browser mic recording, upload to R2, link to lead record
- **Per-user admin auth** — currently one hardcoded password (`demo`)
- **Analytics dashboard** — lead source breakdown, weekly counts, conversion tracking
- **GitHub Action secret** — `CLOUDFLARE_API_TOKEN` must be set manually in repo settings by the repo owner before auto-deploy works

---

## MCP Tools Available (for Claude sessions)

| Tool | Use for |
|---|---|
| `cloudflare-multipart-mcp` | D1 queries (`query_d1_sql`, `execute_d1_sql`) |
| `github-mcp` | Read/write/commit files in repo |
| `afo-gitZip` | Push multiple files in one commit |
| `afo-d1-admin-mcp` | Create/delete D1 databases |
| `Vector-lab-mcp` | Vectorize index management |
| `bash_tool` + `wrangler deploy` | The only reliable way to deploy this worker |
| `afo-r2-source-backup-reader-mcp` | Read R2 source backups |
