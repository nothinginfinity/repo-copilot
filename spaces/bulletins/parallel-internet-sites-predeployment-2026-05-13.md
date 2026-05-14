# Pre-Deployment Bulletin — parallel-internet-sites
**For:** Jared + Brainstorm review session
**Date:** 2026-05-13
**Prepared by:** Alice
**Purpose:** Full project debrief before TrueBuild demo deployment. Review, critique, and stress-test everything before anything goes live.

---

## What We Built

`parallel-internet-sites` is a new product repo that defines, scaffolds, and templates **Parallel Internet Sites** — dedicated, public, agent-first knowledge sites that give LLMs, AI search tools, and crawlers structured, high-signal, crawlable evidence connecting a business to the buyer questions it should own.

**The core problem it solves:**
TrueBuild has a legitimate business. But ask Gemini, ChatGPT, Claude, or Perplexity “What is the best way to build business credit in the United States if you have an LLC?” and TrueBuild does not appear. The structured, public, agent-readable evidence layer simply does not exist yet.

**The three-layer model this repo implements:**

| Layer | Domain | Purpose | Who it serves |
|---|---|---|---|
| Human Website | `truebuild.com` | Existing site | Human visitors |
| AFO Layer | `truebuild.com` (added files) | Machine-readable identity | Agents reading main domain |
| Parallel Internet Site | `ai.truebuild.com` | Structured knowledge expansion | Agents, crawlers, AI search |

---

## What’s Complete — All 5 Phases

### Phase 0 — Repo Scaffold ✅
42 files live at `nothinginfinity/parallel-internet-sites`.
- `README.md`, `SPEC.md`, `ROADMAP.md` — full product definition
- `docs/` — concept, product model, architecture, SEO guardrails, AFO integration, monitoring, agent reconciliation
- `templates/site/` — 7 HTML templates + all agent files
- `templates/intake/` — 28-field client intake schema
- `templates/pages/` — 5 Markdown page templates
- `examples/truebuild/` — fully populated TrueBuild demo
- `schemas/` — 3 JSON schemas
- `tests/` — scoring rubric
- `scripts/` — generator script

### Phase 1 — TrueBuild Demo Spec ✅
All 28 intake fields populated with real TrueBuild data. Six page content files authored. Five agent files populated (`llms.txt`, `agent-context.json`, `agent-actions.json`, `agent-policy.json`, `context-cookie.json`).

### Phase 2 — Static Site Template ✅
7 HTML templates built with 53 `{{PLACEHOLDER}}` tokens. Two blocking bugs found and patched by alice-review (malformed JSON-LD on `contact.html`, token misuse on `faq.html`). Six non-blocking polish items also resolved.

### Phase 3 — AFO Integration ✅
Cross-domain AFO integration rules defined:
- `docs/afo-integration.md` updated to v2.0
- New `docs/agent-reconciliation.md` — 5-step protocol for agents reading both `truebuild.com` and `ai.truebuild.com`
- 4 new Phase 3 fields added to `agent-context.json`: `content_role`, `canonical_identity_source`, `cross_domain_entity_id`, `last_synced`
- `sitemap-agent.xml` updated with `agent:mainDomain` + `agent:contentRole` namespace declarations

### Phase 4 — Prompt-Test Monitoring ✅
Baseline prompt tests run against 5 LLMs **before deployment**.

**Baseline prompt:**
> “What is the best way to build business credit in the United States if you have an LLC or other type of incorporation? Are there any services that can help?”

| LLM | TrueBuild Mentioned | Score |
|---|:---:|---:|
| Perplexity | ❌ No | 1/10 |
| ChatGPT (GPT-4o) | ❌ No | 0/10 |
| Gemini | ❌ No | 0/10 |
| Claude | ❌ No | 0/10 |
| Bing Copilot | ❌ No | 1/10 |
| **Composite** | | **2/50** |

TrueBuild is invisible to all 5 LLMs today. Nav, Dun & Bradstreet, Experian, and Equifax dominate every response. Zero hallucinations. This is the clean “before” baseline.

### Phase 5 — Generator Script ✅
`scripts/generate-site.js` — Node.js, stdlib only.
- Input: `templates/intake/client-intake.example.truebuild.json`
- Output: `examples/truebuild/site/` — fully populated, zero `{{PLACEHOLDER}}` tokens remaining
- Zero unmatched token warnings against TrueBuild intake
- All Phase 3 AFO tokens computed automatically
- `scripts/README.md` documents usage

---

## What Gets Deployed

Running `node scripts/generate-site.js` produces a fully populated static site at `examples/truebuild/site/` containing:

**HTML pages (7):**
- `index.html` — home / overview
- `about.html` — TrueBuild entity profile
- `services.html` — business credit programs
- `faq.html` — business credit FAQ
- `process.html` — how TrueBuild works (HowTo JSON-LD)
- `comparisons.html` — TrueBuild vs. alternatives
- `contact.html` — contact + CTA

**Agent files (7):**
- `llms.txt` — LLM-readable identity + content policy
- `agent-context.json` — structured entity context
- `agent-actions.json` — available actions for agents
- `agent-policy.json` — usage policy
- `context-cookie.json` — persistent context hints
- `sitemap.xml` — standard sitemap
- `sitemap-agent.xml` — agent-priority sitemap with cross-domain pointer to `truebuild.com`
- `robots.txt` — open to all crawlers, both sitemaps declared

**Target subdomain:** `ai.truebuild.com`

---

## Guardrails — What Was Enforced Throughout

Every file, template, and agent file built under `docs/seo-and-safety-guardrails.md`:

| Guardrail | Status |
|---|---|
| All content public and truthful | ✅ Enforced |
| No cloaking or hidden bot-only content | ✅ Enforced |
| No doorway page behavior | ✅ Enforced |
| No claims not in intake JSON | ✅ Enforced |
| `do_not_claim` list present and enforced | ✅ Enforced |
| Compliance disclaimer on every page | ✅ Enforced |
| Links back to `truebuild.com` on every page | ✅ Enforced |
| Disclosure as official knowledge site | ✅ Enforced |
| No fake reviews or unsupported testimonials | ✅ Enforced |
| No fake third-party comparison claims | ✅ Enforced |
| Content consistent with main website | ✅ Per intake data |

---

## What’s NOT Done Yet (3 Pre-Deployment Gates)

These are the only remaining items before the TrueBuild demo can go live:

1. **`ai.truebuild.com` DNS** — Subdomain needs to be created and pointed to a host (Netlify or GitHub Pages recommended). Has not been confirmed available.

2. **Form action URL** — `contact.html` has a `{{FORM_ACTION_URL}}` token for the form POST endpoint. Needs a real URL (Formspree, Netlify Forms, or similar). Currently unresolved.

3. **Jared content approval** — All TrueBuild-specific content was derived from the intake JSON, but Jared should review the rendered pages before going live. This is a client approval gate, not a technical gate.

---

## Open Questions for Brainstorm

These are the strategic questions worth reviewing before deployment:

### 1. Content accuracy
All TrueBuild content was generated from the intake JSON. Brainstorm should ask: **Is every claim on every page traceable to something Jared approved?** The intake JSON is the source of truth. If anything feels unsupported, it should be flagged before deployment.

### 2. Comparison page risk
`comparisons.html` names specific competitors (Nav, Dun & Bradstreet, and one other from the `competitors_or_alternatives` intake field). The guardrails require that comparison claims be factual and traceable to intake data. **Should Brainstorm review the comparison page specifically before it goes live?** This is the highest-risk content on the site.

### 3. The baseline score (2/50) — is it useful?
The before/after proof depends on TrueBuild’s score improving after deployment. But LLM citation behavior is not guaranteed or immediate. **Does Brainstorm have a position on how long to wait before running the after-deployment tests?** 30 days? 60 days? After a crawl is confirmed?

### 4. AFO on the main domain
Brainstorm decision #8 was that a minimal main-domain AFO install is part of this workflow. That work has NOT started yet. The Parallel Internet Site is ready, but `truebuild.com` does not yet have `llms.txt`, `agent-context.json`, or `sitemap-agent.xml`. **Should the main-domain AFO install happen before, during, or after the Parallel Site deployment?**

### 5. Product packaging
This repo is now a clean, client-ready template. The product model in `docs/product-model.md` defines three tiers:
- **Tier 1:** AFO Install only
- **Tier 2:** AFO + Parallel Internet Site
- **Tier 3:** AFO + Parallel Internet Site + Monitoring

TrueBuild is a Tier 2 engagement (with Phase 4 monitoring making it Tier 3). **Is this the right packaging framing for how Brainstorm wants to position this product to future clients?**

### 6. The generator script
`scripts/generate-site.js` runs locally. There is no web UI, no GitHub Action, and no client-facing interface yet. **Is a CLI script sufficient for the first client delivery, or should Phase 6 be a GitHub Action (intake JSON pushed → auto-generates and deploys)?**

---

## Recommended Review Order for Brainstorm

1. Read `SPEC.md` — is the product definition right?
2. Read `docs/seo-and-safety-guardrails.md` — are the guardrails tight enough?
3. Read `examples/truebuild/` — is the TrueBuild content accurate and approvable?
4. Review `comparisons.html` specifically — highest-risk page
5. Review `examples/truebuild/prompt-tests.md` — does the scoring rubric make sense?
6. Answer the 6 open questions above
7. Give deployment go/no-go

---

## Repo
**GitHub:** https://github.com/nothinginfinity/parallel-internet-sites
**Branch:** main
**Visibility:** Public

---

*Bulletin prepared by Alice — 2026-05-13T22:20:00Z*
*File: `spaces/bulletins/parallel-internet-sites-predeployment-2026-05-13.md`*
