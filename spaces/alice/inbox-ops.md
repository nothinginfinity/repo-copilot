# Alice OPS Inbox

---

## MSG-OPS-001 · 2026-05-13T18:22:00Z · Create nothinginfinity/parallel-internet-sites
**Status:** ✅ Complete — 42 files pushed.

---

## MSG-OPS-002 · 2026-05-13T18:22:00Z · Author TrueBuild demo content (Phase 1)
**Status:** ✅ Complete — all client data populated, content authored, alice-review audit passed.

---

## MSG-OPS-003 · 2026-05-13T20:58:00Z · Patch six non-blocking Phase 2 template notes
**Status:** 🔴 Open
**Priority:** High — must complete before Phase 3 content is merged
**Source:** Brainstorm decision MSG-003 + alice-review MSG-026

### Tasks

**1. `comparisons.html` — Add JSON-LD block**
- This is the only page template missing JSON-LD structured data.
- Add a `<script type="application/ld+json">` block with `@type: WebPage` including `name`, `url`, `description`, `publisher` (from `{{BUSINESS_NAME}}`), and `isPartOf` pointing to `{{PARALLEL_SITE_URL}}`.
- Follow the same pattern used in `about.html` and `services.html`.

**2. All 5 remaining pages — Add `sitemap-agent.xml` to `<head>`**
- Pages: `about.html`, `services.html`, `process.html`, `comparisons.html`, `index.html`
- Add `<link rel="sitemap" type="application/xml" title="Agent Sitemap" href="/sitemap-agent.xml">`
- `contact.html` and `faq.html` already patched in commit `ca234e8`.

**3. All 5 remaining pages — Add `sitemap.xml` to `<head>`**
- Same pages as above.
- Add `<link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml">`

**4. `about.html` — Place `{{IDEAL_CLIENT_PROFILE}}` token**
- Token is declared in the template token list but never placed in the page body.
- Add it to the About page body in a clearly labeled section (e.g., under a heading like `Who This Is For`).
- Should appear before the CTA block.

**5. `llms.txt` — Add `{{BRAND_VOICE}}` token**
- Add a `Brand-Voice:` field to `llms.txt` with value `{{BRAND_VOICE}}`.
- Place it after the `Description:` field and before the `Primary-CTA:` field.
- Example line: `Brand-Voice: {{BRAND_VOICE}}`

**6. CSS class naming — Normalize across all 7 pages**
- `faq.html` and `process.html` use minified/abbreviated class names.
- All 7 pages should use the same semantic class naming convention as `about.html`, `services.html`, `comparisons.html`, `contact.html`, `index.html`.
- Review and update `faq.html` and `process.html` class names to match the shared convention.

### Completion criteria
- All 6 items patched in a single commit.
- Commit message: `fix: resolve six non-blocking Phase 2 template notes (MSG-OPS-003)`
- Report back in MSG-026 thread or open MSG-027.

---
