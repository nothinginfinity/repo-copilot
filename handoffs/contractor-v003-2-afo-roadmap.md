# contractor-v003-2-afo — Full Feature Roadmap
**Status:** Planning — build from v003-1 as reference  
**Reference demo:** https://contractor-v003-1-afo.jaredtechfit.workers.dev (DO NOT TOUCH)  
**Reference source:** `workers/contractor-v003-1-afo/worker.js`  
**Handoff doc:** `handoffs/contractor-v003-1-afo-handoff.md`  
**Target worker:** `contractor-v003-2-afo`  
**Target URL:** `contractor-v003-2-afo.jaredtechfit.workers.dev`

---

## Overview

v003-2 is a full upgrade of v003-1. The public-facing site stays the same design (navy/gold, CCS Services Group). The major work is rebuilding the admin panel into a real operations hub — a CRM, content manager, knowledge base editor, notification router, and site customizer — all in one password-protected page. The final stretch goal is an admin chat interface powered by Cloudflare AI so the owner can make updates by typing natural language commands instead of clicking buttons.

Everything gets built as manual UI first. The AI admin chat comes last, after all manual buttons exist and work.

---

## Naming & Infrastructure

| Resource | Name |
|---|---|
| Worker | `contractor-v003-2-afo` |
| D1 Database | `contractor_v003_2_afo_db` |
| Vectorize Index | `contractor-v003-2-afo-vector` (768 dims, cosine, bge-base-en-v1.5) |
| R2 Bucket | `afo-site-content` (same bucket, new prefix `contractor-v003-2/`) |
| AI Binding | `AI` |
| Bindings | `V003_2_DB`, `V003_2_VECTORIZE`, `V003_2_R2` |

**Critical rule:** Never overwrite v003-1. Always deploy as a brand new worker.  
**Critical rule:** Always use `@cf/baai/bge-base-en-v1.5` (768 dims). Never bge-large.  
**Critical rule:** All frontend JS must be built via string array concatenation — never template literals. See handoff doc for explanation and pattern.

---

## D1 Schema Additions for v003-2

On top of the v003-1 tables, add:

```sql
-- Site configuration (replaces hardcoded constants)
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Email notification routing
CREATE TABLE IF NOT EXISTS notification_routes (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,  -- 'new_lead', 'new_upload', 'new_chat_lead'
  email TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

-- Articles now have published status and featured image
-- (alter generated_articles to add: published INTEGER DEFAULT 0, hero_image_r2_key TEXT)

-- Media library
CREATE TABLE IF NOT EXISTS media_library (
  id TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size INTEGER,
  alt_text TEXT,
  category TEXT,  -- 'hero', 'project', 'article', 'team'
  used_in TEXT,   -- JSON array of references
  uploaded_at TEXT NOT NULL
);

-- Service areas (replaces hardcoded list)
CREATE TABLE IF NOT EXISTS service_configs (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'CA',
  zip_codes TEXT,  -- JSON array
  area_code TEXT,
  active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
```

---

## Feature Spec — Admin Panel Sections

### 1. Dashboard (already exists — enhance it)
- System status cards: D1, Vectorize, R2, AI, leads count, articles count
- **Add:** New leads since last visit (badge), unread chat leads, storage used
- **Add:** Quick action buttons: "View new leads", "Publish pending articles"

---

### 2. Knowledge Base Manager (upgrade from seed-only)

**What exists in v003-1:** Seed buttons that push pending rows to Vectorize. No way to view, edit, or add knowledge.

**What v003-2 needs:**
- **View all knowledge seeds** — paginated table: ID, title, body preview, vector status, indexed date
- **Add new knowledge seed** — form: title + body text → saves to D1 + immediately embeds to Vectorize
- **Edit existing seed** — click row → edit title/body → re-embed on save
- **Delete seed** — removes from D1 and Vectorize
- **Search knowledge** — semantic search bar (already exists, keep it) + keyword filter
- **Same for FAQs and service areas** — tabbed view

---

### 3. CRM — Leads & Customers

**What exists in v003-1:** Leads saved to D1, no UI to see them.

**What v003-2 needs:**
- **Leads table** — sortable columns: name, email, phone, project type, budget, location, date, source (form vs chat vs upload), status
- **Status workflow** — New → Contacted → Quoted → Won / Lost (dropdown per lead)
- **Lead detail view** — expand row or modal: all fields, notes field, attached uploads (R2 links), chat transcript if available
- **Notes** — free text notes per lead, timestamped
- **Search leads** — by name, email, phone, project type, date range
- **Export** — CSV download of leads (filtered or all)
- **Mark as notified** — sets `notified=1` in D1

---

### 4. Email Notification Routing

**What exists in v003-1:** `notified=0` flag on leads, no actual sending.

**What v003-2 needs:**
- **Email config UI** — Add one or multiple email addresses per event type
  - Event types: `new_lead` (form submit), `new_chat_lead` (chat estimate complete), `new_upload` (file uploaded)
- **Test button** — sends a test email to the configured address
- **Email sending:** Use Resend API (simplest) or a Cloudflare Email Worker
  - Store Resend API key in a D1 `site_config` row (never in source code)
  - Admin UI has a field to paste the API key — saved to D1, never exposed
  - On lead save → fetch active notification routes for that event type → POST to Resend
- **Per-lead notification log** — show if email was sent, when, to whom

---

### 5. Media Library & File Manager

**What exists in v003-1:** File upload to R2 via chat, no UI to view or manage files.

**What v003-2 needs:**
- **Upload UI** — drag-and-drop or file picker in admin
  - Categories: Hero image, Project photo, Article image, Team photo, Other
  - Stores to R2 under `contractor-v003-2/media/{category}/{timestamp}-{filename}`
  - Saves to `media_library` D1 table
- **Media grid** — thumbnail grid of all uploaded files (R2 presigned URLs or public URLs)
- **Alt text editor** — click image → edit alt text → save to D1
- **Copy URL button** — copies the R2 key or public URL for use in articles
- **Delete** — removes from R2 and D1
- **Filter by category**

---

### 6. Article Manager (upgrade from generate-only)

**What exists in v003-1:** Generate article via AI, view list in admin, no public display.

**What v003-2 needs:**
- **Article list** — title, topic, status (draft/published), created date, publish toggle
- **Publish toggle** — sets `published=1` in D1, article becomes live at `/articles/{slug}`
- **Public articles page** — `GET /articles` → lists all published articles with title, excerpt, date
- **Public article detail** — `GET /articles/{slug}` → full article rendered as HTML page, styled to match site
- **Hero image picker** — in admin article editor, select image from media library → sets `hero_image_r2_key`
- **Edit article body** — textarea in admin to edit generated text before publishing
- **Article embed on homepage** — section at bottom of public page: "From Our Blog" — shows last 3 published articles with title + excerpt + "Read more" link
- **Generate + publish flow:** Generate → review in editor → pick hero image → publish → live immediately

---

### 7. Site Customizer

**What exists in v003-1:** Company name, phone, colors are hardcoded constants in the worker source.

**What v003-2 needs — all values stored in `site_config` D1 table, editable in admin:**

**Business Info**
- Company name
- Phone number (shown in nav, chat bar, footer, trust bar)
- License number (CSLB #)
- Business address (for footer)
- Business hours

**Service Areas**
- Add / remove cities with quick-select buttons in chat
- Add / remove zip codes per city
- Add / remove area codes (used for phone validation)
- Active/inactive toggle per city

**Chat Customization**
- Opening message text
- Estimate flow: add/remove/reorder project type buttons (Kitchen, Bathroom, ADU, etc.)
- Estimate flow: add/remove/reorder location quick-select buttons
- QA system prompt (the instructions sent to the AI)

**Hero Section**
- Hero headline text
- Hero subheadline text
- Hero background image (select from media library)
- CTA button labels

**Stats Bar** (the 4 stats under hero)
- Each stat: number + label (editable)

**Reviews**
- Add / edit / delete testimonials (name, project type, location, text)

**Trust Bar**
- Add / remove trust badges

**Footer**
- Footer text
- Social links

**Implementation approach:**
- On worker boot, load config from D1 `site_config` table once per request (or cache in memory with a short TTL)
- `buildPublic()` reads from the loaded config object instead of hardcoded constants
- Admin "Site Settings" section has a form per group above → save → D1 → next page load reflects changes

---

### 8. Admin Chat (build last, after all manual UI works)

A chat interface inside the admin panel, powered by Cloudflare AI (Llama) with tool-calling capability. The owner types natural language and the AI executes admin actions.

**Example commands it should handle:**
- "Add a new FAQ: question is X, answer is Y" → inserts to D1 + embeds to Vectorize
- "Show me all leads from this week" → queries D1, formats as a table in the chat
- "Change the hero headline to 'LA's #1 Contractor'" → updates site_config
- "Generate an article about kitchen remodels in Pasadena and publish it" → runs generate + sets published=1
- "Add Encino to the service areas" → inserts to service_configs
- "Send a test email to joseph@ccs.com" → triggers notification test

**Implementation:**
- The admin chat POST endpoint gets a system prompt that describes all available D1 tables, R2 structure, and available "tool" functions
- Tools are defined as JSON schemas (standard function-calling format)
- The worker executes tool calls server-side (no API key needed — uses the bound AI model)
- Alternatively, if owner wants to use Claude or GPT-4 for better quality: store the API key in `site_config`, fetch it at runtime, POST to the external API
- Start with Cloudflare AI (free, no key needed) — add external API key support as an option

---

## Build Order

Build in this sequence — each phase is independently testable:

**Phase 1 — Infrastructure**
1. Create D1 database + Vectorize index for v003-2
2. Run schema migrations (all tables including new ones)
3. Deploy worker skeleton (all routes return stubs)
4. Verify bindings: D1 ✅ Vectorize ✅ R2 ✅ AI ✅
5. Seed knowledge base

**Phase 2 — Public Site**
6. Port v003-1 public frontend exactly (same design)
7. Add `site_config` loading — phone, company name, hero text all come from D1
8. Add `/articles` and `/articles/{slug}` public routes
9. Add "From Our Blog" section to homepage (shows last 3 published articles)
10. Verify chat, lead form, file upload all work

**Phase 3 — Admin Core**
11. Admin auth (keep sessionStorage password for now)
12. Dashboard with live stats
13. Knowledge Base Manager (view/add/edit/delete seeds, FAQs, service areas)
14. Leads CRM (table, search, status workflow, detail view, export CSV)
15. Media Library (upload, grid, alt text, copy URL, delete)

**Phase 4 — Admin Advanced**
16. Article Manager (list, edit body, hero image picker, publish toggle)
17. Email Notification Routing (config UI, Resend integration, test button)
18. Site Customizer (business info, service areas, chat config, hero, reviews)

**Phase 5 — Admin Chat**
19. Admin chat UI (message input, conversation display)
20. Tool definitions for all admin actions
21. Cloudflare AI tool-calling backend
22. Optional: external API key support (Claude / GPT-4)

---

## Key Technical Decisions for the Builder

**Config loading pattern:**
```javascript
async function loadConfig(env) {
  const rows = await dbAll(env, 'SELECT key, value FROM site_config');
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}
// In fetch handler:
const config = await loadConfig(env);
// Pass config into buildPublic(config), buildAdmin(config)
```

**R2 media serving:**
- Store files under `contractor-v003-2/media/{category}/{id}-{filename}`
- Serve via a `GET /media/{key}` route that streams from R2 with correct Content-Type
- For admin thumbnails: same route, add `?thumb=1` to return resized (or just serve full size)

**Article routing:**
- `GET /articles` → published article index
- `GET /articles/{slug}` → single article page
- Both routes styled to match the site (nav + footer + content)

**Email via Resend:**
```javascript
async function sendEmail(apiKey, to, subject, html) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'CCS Services <noreply@yourdomain.com>', to, subject, html })
  });
}
// API key stored in site_config table, fetched at runtime
```

**CSV export:**
```javascript
function leadsToCSV(leads) {
  const headers = ['ID','Name','Email','Phone','Project','Budget','Timeline','Source','Status','Date'];
  const rows = leads.map(l => [l.id,l.name,l.email,l.phone,l.project_type,l.budget_range,l.timeline,l.source,l.status,l.created_at]);
  return [headers, ...rows].map(r => r.map(v => '"'+(v||'').replace(/"/g,'""')+'"').join(',')).join('\n');
}
// Return as: new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="leads.csv"' } })
```

---

## What the Builder Should Read First

1. `handoffs/contractor-v003-1-afo-handoff.md` — critical JS escaping rules, infrastructure details, lessons learned
2. Live reference at `https://contractor-v003-1-afo.jaredtechfit.workers.dev` — see what's working
3. This roadmap — decide with the owner which phase to start with
4. Then ask: "Which phase do you want to start with, or should I build all phases in order?"
