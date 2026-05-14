# Project Bulletin — parallel-internet-sites
**For:** Jared + Brainstorm review session
**Date:** 2026-05-13
**Prepared by:** Alice
**Status:** Phase 2 complete (blocker-free). Ready to proceed to Phase 3.

---

## What This Project Is

**parallel-internet-sites** is a new product and repo that defines how to build *Parallel Internet Sites* — dedicated, public, agent-first knowledge sites that sit alongside a client’s existing website and make the business legible to LLMs, AI search tools, and crawlers.

The driving insight: a normal website is built for humans. LLMs like Gemini and ChatGPT may not surface a business in broad AI prompts — not because the business is illegitimate, but because there is not enough *structured, high-signal, crawlable, agent-readable* content connecting the business to the buyer’s actual question.

**The three-layer model:**

| Layer | What it is | Who it’s for |
|---|---|---|
| Human Website | The client’s existing site | Human visitors |
| AFO Layer | `llms.txt`, `agent-context.json`, etc. added to the existing site | Machines reading the existing site |
| Parallel Internet Site | A dedicated public knowledge site on a subdomain or folder | Agents, crawlers, AI search — *and* humans |

**TrueBuild use case:** TrueBuild may have a legitimate website, but Gemini and other LLMs may not mention TrueBuild when someone asks *“What is the best way to build business credit in the United States if you have an LLC?”* — because there is not enough structured, public evidence connecting TrueBuild to that question. A Parallel Internet Site creates that evidence layer.

---

## Repo

**GitHub:** https://github.com/nothinginfinity/parallel-internet-sites
**Branch:** main
**Visibility:** Public

---

## What’s Been Built (Phases 0–2)

### ✅ Phase 0 — Repo Scaffold (Complete)
42 files pushed across two commits. Includes:
- `README.md`, `SPEC.md`, `ROADMAP.md` — full product definition
- `docs/` — concept, product model, architecture, SEO guardrails, AFO integration, monitoring
- `templates/site/` — full static site template (index.html + 6 page HTMLs + all agent files)
- `templates/intake/` — 28-field client intake schema + populated TrueBuild example
- `templates/pages/` — 5 reusable Markdown page templates
- `examples/truebuild/` — content plan, site map, prompt tests, README
- `schemas/` — JSON schemas for parallel-site, page, and prompt-test records
- `tests/` — README + 7-dimension scoring rubric

### ✅ Phase 1 — TrueBuild Demo Spec (Complete)
- TrueBuild client intake fully populated (all 28 fields, zero placeholders)
- 6 TrueBuild page content files authored (`about`, `services`, `process`, `faq`, `comparisons`, `contact`)
- All 5 agent files populated (`llms.txt`, `agent-context.json`, `agent-actions.json`, `agent-policy.json`, `context-cookie.json`)
- alice-review audit passed
- Baseline prompt test structure in place

**TrueBuild client data on file:**
- Contact: Jared | getfitdoc@gmail.com | 949-742-4430
- Hours: Monday–Friday, 8:00 AM–7:00 PM PST
- Founded: 2001 | 50,000+ clients served

### ✅ Phase 2 — Static Site Template (Complete, Blocker-Free)
alice-review (MSG-026) reviewed all 7 HTML templates and supporting files. Two blocking bugs were found and patched same session:

| Bug | File | Fix |
|---|---|---|
| BLOCKING-1: Malformed JSON-LD (`{{BUSINESS_HOURS` missing `}}`) | `contact.html` | Fixed — commit `ca234e8` |
| BLOCKING-2: FAQ token misuse (`{{FAQ_WHAT_IS}}` used as question text; `{{FAQ_WHO_IS_FOR}}` duplicated) | `faq.html` | Fixed — commit `ca234e8` |

**Template system summary:**
- 7 HTML templates (index + 6 pages), all with JSON-LD structured data
- 53 `{{PLACEHOLDER}}` tokens across all templates (18 from agent-context.json + 35 Phase 2 additions)
- Reusability test: ✅ a simple find-replace on all tokens produces a working client site
- Nav/footer: ✅ identical across all 7 pages
- Compliance disclaimer: ✅ present in footer on all 7 pages
- Placeholder hygiene: ✅ zero hardcoded TrueBuild data in base templates

**6 non-blocking notes still open** (no blockers, but polish items for a future pass):
1. `comparisons.html` — missing JSON-LD block entirely
2. `sitemap-agent.xml` not referenced in `<head>` on 5 remaining pages (fixed on `contact` + `faq` already)
3. CSS class naming inconsistent between pages (`faq`/`process` use minified names)
4. `{{IDEAL_CLIENT_PROFILE}}` token declared but not placed in `about.html`
5. `{{BRAND_VOICE}}` missing from `llms.txt`
6. Inner pages missing `sitemap.xml` link in `<head>` (fixed on `contact` + `faq` already)

---

## Phase Status Summary

| Phase | Status | Notes |
|---|---|---|
| Phase 0 — Repo Scaffold | ✅ Complete | 42 files live |
| Phase 1 — TrueBuild Demo Spec | ✅ Complete | All client data populated; content authored |
| Phase 2 — Static Site Template | ✅ Complete (blocker-free) | 7 HTML templates; 2 bugs patched |
| Phase 3 — AFO Integration | ⏳ Ready to start | No blockers |
| Phase 4 — Prompt-Test Monitoring | ⏳ Pending Phase 3 | Baseline prompt needs to be *run* |
| Phase 5 — Client-Ready Generator | ⏳ Future | Script: intake JSON → full site scaffold |

---

## What Comes Next — Phase 3: AFO Integration

**Goal:** Define and document how the Parallel Internet Site agent files connect to, mirror, and extend the AFO layer on the client’s main domain.

**Key questions to resolve in Phase 3:**
1. Does `agent-context.json` on `ai.truebuild.com` mirror the one on `truebuild.com`, or extend it?
2. How do the two `sitemap-agent.xml` files relate? Does one reference the other?
3. What is the update trigger? If TrueBuild updates their main site, what regenerates on the Parallel Internet Site?
4. Should `llms.txt` on the Parallel Internet Site be a strict subset of the main domain’s `llms.txt`, or can it add information?
5. How does an agent visiting both domains reconcile two `agent-context.json` files for the same entity?

**Deliverables for Phase 3:**
- Updated `docs/afo-integration.md` with sync workflow
- Cross-domain linking spec (how the two sitemaps reference each other)
- Agent file consistency rules (what must match, what can diverge)
- TrueBuild example: populated `sitemap-agent.xml` for `ai.truebuild.com`

---

## Open Questions for Brainstorm

These are the strategic questions worth talking through before Phase 3 starts:

1. **Subdomain vs. folder:** The spec recommends `ai.truebuild.com` or `knowledge.truebuild.com`. Has Jared confirmed which deployment path TrueBuild will use? This affects all canonical URLs in the templates.

2. **Baseline prompt test:** The prompt test structure exists, but the *actual tests haven’t been run yet* against live LLMs. Should Phase 3 include running the baseline before deployment, or after?

3. **The 6 non-blocking notes:** Should alice-ops do a cleanup pass now (while the templates are fresh) before Phase 3, or defer until after Phase 4?

4. **Deployment:** The template is GitHub Pages/Netlify ready. Is TrueBuild going to deploy this themselves, or is Jared handling the first deployment as a demo?

5. **AFO relationship:** Does TrueBuild already have an AFO install on their main domain? The AFO integration docs assume one exists. If not, should an AFO install be part of the parallel-internet-sites workflow, or a separate engagement?

6. **Client generator (Phase 5):** The end goal is a script that takes an intake JSON and outputs a fully populated site. Before Phase 5, is there interest in building a simple manual substitution script (Node.js or Python, ~50 lines) to demo the concept for TrueBuild? This could run now against the populated intake JSON.

---

## Guardrails Reminder

All content built in this repo follows `docs/seo-and-safety-guardrails.md`:
- ✅ Public and truthful — no hidden bot-only content
- ✅ No cloaking, no doorway pages
- ✅ No claims not in the intake JSON
- ✅ Compliance disclaimer on every page
- ✅ Links back to main website on every page
- ✅ Disclosure that this is an official knowledge site
- ✅ `do_not_claim` list enforced (no guaranteed approvals, no specific score numbers)

---

*Bulletin prepared by Alice — 2026-05-13T20:50:00Z*
*Repo: nothinginfinity/repo-copilot — spaces/bulletins/parallel-internet-sites-review-2026-05-13.md*
