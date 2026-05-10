# Charlie — Inbox

> Bob (and others) append messages here to reach Charlie.
> Charlie reads this file to receive messages.

<!-- messages appear below this line -->

---
## 📩 Message from Bob — 2026-05-10
**Subject:** 🤝 DEMO HANDOFF — Section 2 complete, Section 3 is yours
**cid:** bob/c1/demo → charlie/c1/demo
**demo-phase:** three-agents-demo

Hey Charlie —

Section 2 is done and pushed. Your turn.

---

### What's been built so far

**File:** [`demo/qa-stone-demo-seed.html`](https://github.com/nothinginfinity/repo-copilot/blob/main/demo/qa-stone-demo-seed.html)  
**Alice's commit:** `0150c6a2` — HTML shell + Section 1 (stack diagram, 4-card grid, agent flow diagram)  
**Bob's commit:** this push — Section 2 (build timeline, agent roster table, Bob node lit up in flow diagram)

The page has:
- Full Nexus design system (light + dark mode, Instrument Serif + DM Sans)
- QA.Stone SVG logo mark
- Sticky nav with active CID chip + theme toggle
- Hero: "Three agents. One app. No server."
- Section 1 (Alice ✓): stack diagram — Gist / Inbox / Notion / Pages
- Section 2 (Bob ✓): build timeline + agent roster table
- Section 3: `.inject-placeholder` inside `.section-usecases` — **this is yours**
- Footer CID audit: Alice ✓ done · Bob ✓ done · Charlie ⏳ pending
- Agent color system: Alice = teal, Bob = gold, **Charlie = purple**

---

### Your task — Section 3 (charlie/c1/demo)

**Goal:** Use cases grid + closing CTA + success criteria checklist

**Exactly what to inject** (replace the `.inject-placeholder` div inside `.section-usecases`):

```html
<!-- USE CASES GRID -->
<div class="usecases-grid">
  <!-- 3–6 cards, one per use case -->
  <!-- Suggested: Notion App Store · Multiplayer Games · Team Messaging · CRM · Code-Icles · Identity Gist -->
</div>

<!-- SUCCESS CRITERIA CHECKLIST -->
<div class="success-criteria">
  <!-- Checklist of what this demo proves -->
  <!-- Suggested items:
    ✓ Three agents coordinated purely via git files
    ✓ Zero shared context windows — artifact is the only handoff
    ✓ Every action logged to Notion in real time
    ✓ Entire session orchestrated from an iPhone
    ✓ Live deployment with no terminal, no laptop
  -->
</div>

<!-- CLOSING CTA -->
<div class="cta-block">
  <!-- Headline, sub-copy, and primary button -->
  <!-- Link to: https://github.com/nothinginfinity/repo-copilot -->
</div>
```

**Design rules to follow** (CSS already in file, use Alice/Bob's patterns):
- Agent badges: `<span class="agent-badge charlie"><span class="dot"></span>Charlie</span>`
- Status chips: `<span class="status done">✓ done</span>`
- Cards: `<div class="card">` — hover shadow included
- Section label already written: `Section 3 — Charlie (ChatGPT)` — keep it
- Section heading already written: `Use cases & what this unlocks` — keep it
- Your Charlie node in the flow diagram is NOT highlighted — feel free to add `active` class (optional)

**What NOT to touch:**
- `<html>`, `<head>`, `<style>`, `<nav>`, `<header>`, `<footer>` — leave as-is
- `.section-stack` (Section 1) — leave as-is
- `.section-timeline` (Section 2) — leave as-is
- Footer CID chips — update Charlie's status from `pending` to `done` after your inject ✅

---

### After you inject

1. **Push** the updated file back to `demo/qa-stone-demo-seed.html` on `main`
   - Commit message: `charlie: Section 3 — use cases + CTA + deploy (charlie/c1/demo)`
2. **Notion build log** — append a row via `notion-ops` `append_row` op to DB `35bd927c-9792-8125-97a4-cb3422954698`
   - Fields: `Name = "Section 3 — Charlie"`, `Status = Done`, `Owner = Charlie`, `Phase = Demo`, `Commit = <your SHA>`
3. **Deploy** — trigger the GitHub Pages deploy workflow so the final file goes live
   - The workflow is at `.github/workflows/` — look for a pages or deploy workflow
   - The live URL will be: `https://nothinginfinity.github.io/repo-copilot/demo/qa-stone-demo-seed.html`
4. **Write completion note** to `spaces/bob/inbox.md` with:
   - Your commit SHA
   - Confirmation the Notion row landed
   - The live GitHub Pages URL

---

### Gist note

Pull directly from the repo file path above (not a gist — gist layer is wired in demo v2). Push back to the same path.

---

The flow diagram has your node waiting. Light it up.

— Bob (bob/c1/demo)
