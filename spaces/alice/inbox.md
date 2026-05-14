# Alice Inbox

## MSG-001 · From: Charlie · 2026-05-11T03:15:00Z · RE: notion-gamekit landing page shipped

Hey Alice —

Charlie here. Just wrapped the first real build task on the notion-gamekit product.

**What I did:**
- Repo `nothinginfinity/notion-gamekit` already existed — confirmed and used it.
- Pushed `index.html` — a full product landing page to the `main` branch (GitHub Pages ready at root).

**Landing page sections:**
1. Hero — big serif headline, teal glow, CTAs (Get Template $7 + Play demo)
2. How It Works — 3-step card flow (Play → Copy → Paste)
3. What's Included — 4 features + live Notion DB mockup
4. **Live Tic-Tac-Toe demo** — fully playable vs AI, with session log and a "Copy to Notion" modal that outputs real JSON matching the Session schema
5. Pricing — $7 one-time card

**Design:** Instrument Serif + DM Sans · Dark mode default · Teal/warm palette · Mobile responsive.

**Pending (Jared to handle):**
- Enable GitHub Pages on the repo (Settings → Pages → main / root)
- Replace placeholder Gumroad URL with real listing link

**Turn log:** `.github/turns/2026-05-10-session-boot/charlie/t3/turn.json`

— Charlie

---

## MSG-002 · Status note · 2026-05-13T18:22:00Z · parallel-internet-sites Phase 1 in progress

**Phase 0 complete.** `nothinginfinity/parallel-internet-sites` is live with 42 files.

**Phase 1 started.** alice-ops tasked (MSG-OPS-002) with authoring TrueBuild demo content. alice-review on standby (MSG-REV-002) for content audit once ops completes.

**Pending Jared input (TrueBuild client data):**
- Contact name and email
- Phone number
- Business hours
- Clients served count/description

---

## MSG-003 · Brainstorm decisions · 2026-05-13T20:58:00Z · parallel-internet-sites Phase 3 approved

**Source:** Brainstorm verbal review of `spaces/bulletins/parallel-internet-sites-review-2026-05-13.md`
**Logged by:** Alice

### Decisions — Now Canonical

1. **Deployment path:** Use `ai.truebuild.com` as the TrueBuild demo subdomain unless a hard deployment constraint is found.
2. **Main domain AFO = canonical identity.** `truebuild.com` holds the authoritative identity layer.
3. **Parallel Internet Site = canonical explanation/knowledge expansion.** `ai.truebuild.com` is the authoritative knowledge layer.
4. **Identity fields must mirror** between main domain AFO and the Parallel Site (business name, entity type, founding year, contact, CTA, primary URL).
5. **Parallel Site may extend** educational content, FAQ, comparisons, and prompt-test content beyond what the main domain AFO layer contains.
6. **Prompt tests:** Run baseline *before* deployment AND *after* deployment. Before/after proof is a deliverable.
7. **Template cleanup first:** Complete the six non-blocking Phase 2 notes before Phase 3 work begins.
8. **Minimal main-domain AFO install** is part of the Parallel Internet Sites workflow — not a separate engagement.
9. **Build a manual substitution script now:** intake JSON → populated static site folder. Keep it simple (~50 lines, Node.js or Python).

---

### Task Routing from MSG-003

**alice-ops → MSG-OPS-003** (see inbox-ops.md)
Patch six non-blocking Phase 2 template notes:
- Add JSON-LD block to `comparisons.html`
- Add `sitemap-agent.xml` `<link>` to `<head>` on all 5 remaining pages
- Add `sitemap.xml` `<link>` to `<head>` on all 5 remaining pages
- Place `{{IDEAL_CLIENT_PROFILE}}` token in correct location in `about.html`
- Add `{{BRAND_VOICE}}` token to `llms.txt`
- Normalize CSS class naming across all 7 pages

**alice-review → MSG-REV-003** (see inbox-review.md)
Draft Phase 3 AFO integration rules covering:
- Identity mirroring spec (which fields must be identical across both domains)
- Knowledge extension rules (what the Parallel Site may add that main domain AFO cannot)
- Sitemap cross-linking spec (how `sitemap-agent.xml` on each domain references the other)
- Update trigger model (what change on main domain requires a Parallel Site update)
- Agent reconciliation behavior (how an agent that reads both domains should resolve conflicts)

**Both tasks are gated:** alice-review Phase 3 draft may begin in parallel, but no Phase 3 content is pushed to the repo until alice-ops confirms template cleanup is complete.

---
