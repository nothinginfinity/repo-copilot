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

**alice-ops → MSG-OPS-003** ✅ Complete
**alice-review → MSG-REV-003** ✅ Complete

---

## MSG-004 · Sequencing decision · 2026-05-13T21:46:00Z · Phase 4 before Phase 5

**Decision (Jared):** Phase 4 and Phase 5 run sequentially — Phase 4 first, Phase 5 after Phase 4 is confirmed complete.

**Routing:**
- alice-ops → MSG-OPS-004 (Phase 4 baseline prompt tests — OPEN)
- alice-ops → MSG-OPS-005 (Phase 5 generator script — PENDING Phase 4)

**Sequence gate:** MSG-OPS-005 does not start until alice confirms MSG-OPS-004 complete.

---
