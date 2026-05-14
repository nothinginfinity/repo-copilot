# Alice Inbox

## MSG-001 · From: Charlie · 2026-05-11T03:15:00Z · RE: notion-gamekit landing page shipped
**status:** read — _[archived]_

---

## MSG-002 · Status note · 2026-05-13T18:22:00Z · parallel-internet-sites Phase 1 in progress
**status:** read — _[archived]_

---

## MSG-003 · Brainstorm decisions · 2026-05-13T20:58:00Z · parallel-internet-sites Phase 3 approved
**status:** read — _[archived]_

---

## MSG-004 · Sequencing decision · 2026-05-13T21:46:00Z · Phase 4 before Phase 5
**status:** read — _[archived]_

---

## MSG-005 · Brainstorm pre-deployment review · 2026-05-13T22:25:00Z · BLT-015 decisions locked

**Source:** Brainstorm review of `spaces/bulletins/parallel-internet-sites-predeployment-2026-05-13.md`
**Reference:** BLT-015
**Logged by:** Alice

### Brainstorm Position — Now Canonical

**Overall status: 🟡 Yellow-Green**
Technically ready. Not public-launch ready until all 3 gates are closed.

---

**Decision 1 — Deployment hold**
Do NOT deploy the public TrueBuild demo until all three gates are confirmed closed:
- `ai.truebuild.com` DNS created and pointed
- Form action URL resolved (real endpoint wired into `contact.html`)
- Jared / client content approval on all rendered pages

**Decision 2 — Comparison page**
`comparisons.html` is the highest-risk page. Before launch it must either:
- Receive focused manual review by Jared confirming every claim is accurate and approved, OR
- Be temporarily removed from the deployed site and added back after review
This is a hard gate, not a recommendation.

**Decision 3 — Main-domain AFO sequencing**
Minimal main-domain AFO install (`llms.txt`, `agent-context.json`, `sitemap-agent.xml` on `truebuild.com`) must deploy **before or alongside** `ai.truebuild.com` — not after as a loose future step. The Parallel Site’s `canonical_identity_source` and `cross_domain_entity_id` point to `truebuild.com`; if those files don’t exist on the main domain at launch, agent reconciliation breaks.

**Decision 4 — Post-deployment prompt test cadence**
Do not run after-deployment tests immediately and present them as proof. Use this cadence:
- **Day 7:** Light check — confirm site is indexed and accessible to crawlers
- **Day 30:** Serious check — run full rubric, compare to baseline, look for first movement
- **Day 60–90:** Follow-up — trend analysis, before/after proof deliverable

**Decision 5 — Generator script is sufficient**
CLI script (`scripts/generate-site.js`) is the right delivery format for the first client. GitHub Action automation is premature. Recommended next layer is **Deployment Pack v1** (see Decision 6).

**Decision 6 — Deployment Pack v1 (next build task)**
Before Phase 6 automation, build a Deployment Pack v1: a structured checklist + asset bundle that a human can follow to deploy a Parallel Internet Site for a client without Alice’s involvement. Should include:
- Pre-deployment checklist (DNS, form URL, content approval, comparison review)
- Run instructions for `scripts/generate-site.js`
- Netlify / GitHub Pages deploy steps
- Post-deployment verification checklist (robots.txt, sitemap, llms.txt, agent-context.json publicly accessible)
- Day 7 / Day 30 / Day 60–90 prompt test schedule
- Handoff doc template for client

---

### Task Routing from MSG-005

**alice-ops → MSG-OPS-006** — Build Deployment Pack v1
- Output: `docs/deployment-pack-v1.md` in `nothinginfinity/parallel-internet-sites`
- Covers: pre-deploy checklist, run instructions, host deploy steps, post-deploy verification, prompt test cadence, client handoff template
- Commit message: `docs: Deployment Pack v1 (MSG-OPS-006)`
- Report back as MSG-032

**alice-review → MSG-REV-004** — Manual review of `comparisons.html` (TrueBuild populated version)
- Read `examples/truebuild/site/comparisons.html` (generated output, not template)
- Verify every claim against `templates/intake/client-intake.example.truebuild.json`
- Flag any claim that is unsupported, overstated, or not traceable to intake data
- Recommend: approve as-is, approve with edits, or remove before launch
- Report back as MSG-033

**Both tasks run in parallel. Neither is gated on the other.**

---
