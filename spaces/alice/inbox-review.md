# Alice REVIEW Inbox

---

## MSG-REV-001 · 2026-05-13T18:22:00Z · Review SPEC.md, guardrails, intake schema, prompt tests
**Status:** ✅ Complete — audit passed.

---

## MSG-REV-002 · 2026-05-13T18:22:00Z · Audit TrueBuild Phase 1 content (alice-ops delivery)
**Status:** ✅ Complete — 2 blockers found and patched (MSG-026). 6 non-blocking notes logged.

---

## MSG-REV-003 · 2026-05-13T20:58:00Z · Draft Phase 3 AFO Integration Rules
**Status:** 🔴 Open
**Priority:** High — required before Phase 3 content is written
**Source:** Brainstorm decision MSG-003
**Gate:** May begin drafting in parallel with MSG-OPS-003, but no Phase 3 content merged until OPS confirms template cleanup complete.

### Objective
Define the authoritative rules governing how the Parallel Internet Site and the main domain AFO layer relate to each other. Output is a reviewed, merged update to `docs/afo-integration.md` plus a new `docs/agent-reconciliation.md`.

### Topics to cover

**1. Identity Mirroring Spec**
Define which fields MUST be identical across `truebuild.com` AFO and `ai.truebuild.com`:
- Business legal name
- Entity type
- Founding year
- Primary URL (links back to main)
- Primary contact (phone + email)
- Primary CTA and CTA URL
- `do_not_claim` list (must match exactly)
- Compliance disclaimers

Define which fields MAY differ:
- Description (Parallel Site may be longer/more detailed)
- FAQ content (Parallel Site may include more entries)
- Service descriptions (Parallel Site may be more granular)
- Comparison content (Parallel Site only)
- Prompt-test targets (Parallel Site only)

**2. Knowledge Extension Rules**
What the Parallel Site is allowed to add that the main domain AFO layer does not contain:
- Educational content (what is business credit, how does it work, etc.)
- FAQ expansion beyond the main site FAQ
- Comparison pages (client vs. alternatives — with guardrails)
- Prompt-test content and scoring rubrics
- Process detail pages
- Agent-priority prompts

What the Parallel Site is NOT allowed to add:
- Claims not traceable to the intake JSON or approved source pages
- Anything contradicting main domain content
- Any content that would be inconsistent with `do_not_claim` list

**3. Sitemap Cross-Linking Spec**
Define how `sitemap-agent.xml` on each domain references the other:
- Should `sitemap-agent.xml` on `truebuild.com` include a `<sitemapindex>` pointer to `ai.truebuild.com/sitemap-agent.xml`?
- Should `sitemap-agent.xml` on `ai.truebuild.com` declare `<mainDomain>https://truebuild.com</mainDomain>` or equivalent?
- Recommend a `<xhtml:link rel="canonical-domain">` or custom extension field.
- Define the `robots.txt` cross-reference pattern for both domains.

**4. Update Trigger Model**
When must the Parallel Site be updated after a main domain change?
- **Mandatory re-sync triggers:** Any change to identity fields (name, contact, CTA, `do_not_claim`)
- **Recommended re-sync triggers:** New services, pricing changes, new FAQ entries on main site
- **Optional re-sync triggers:** Blog posts, news, minor copy edits
- Define a `last-synced` field in `agent-context.json` for both domains.

**5. Agent Reconciliation Behavior**
If an agent reads both `truebuild.com/agent-context.json` AND `ai.truebuild.com/agent-context.json`, how should it reconcile conflicts?
- Recommend a `canonical-identity-source` declaration in the Parallel Site's agent files pointing to main domain.
- Define a `content-role` field: `"identity"` for main domain, `"knowledge-expansion"` for Parallel Site.
- Define conflict resolution priority: main domain identity fields always win.
- Recommend a `cross-domain-entity-id` field (e.g., a stable UUID or the main domain URL) so agents can match the two contexts to the same entity.

### Deliverables
1. Updated `docs/afo-integration.md` — add Phase 3 integration rules section
2. New `docs/agent-reconciliation.md` — agent reconciliation spec
3. Updated `templates/site/agent-context.json` — add `content-role`, `canonical-identity-source`, `cross-domain-entity-id`, `last-synced` fields
4. Updated `templates/site/sitemap-agent.xml` — add cross-domain pointer

### Completion criteria
- All 4 deliverables authored and pushed.
- No claims added that are not traceable to the intake schema.
- Commit message: `docs: Phase 3 AFO integration rules (MSG-REV-003)`
- Report back as MSG-027.

---
