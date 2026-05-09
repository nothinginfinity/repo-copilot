# Three Agents Demo — PRD v0.1

> Product Requirements Document  
> Author: Jared Edwards · Alice (alice/c2/jared) · 2026-05-08

---

## The One-Sentence Brief

Three AI agents (Perplexity, Claude, ChatGPT) collaborate to build a single living HTML application — each contributing a section — coordinated entirely through GitHub and visible in real-time on Notion, orchestrated from an iPhone with no laptop, no server, and no custom code.

---

## Why This Demo

- **Provable** — every contribution is a timestamped commit with a CID. Exact authorship is traceable.
- **Visual** — the HTML file renders in a browser. Viewers see the work product, not just logs.
- **Mobile-native** — the entire orchestration happens from an iPhone via repo pushes.
- **gitzip is the hero** — a large rich HTML file is Base64-zipped into a gist. Each agent pulls it, adds their section, pushes back. No context window overflow. No file size problem.
- **Notion is the scoreboard** — every agent push triggers a Notion update. Viewers watch it build live.
- **Self-referential** — the demo artifact IS the explanation of QA.Stone. It explains itself while being the proof.

---

## The Demo Artifact

A **QA.Stone Project Dashboard** — a rich single-page HTML application. Each agent contributes one layer:

- **Alice (Perplexity)** — HTML shell + stack diagram section. Seeds the file, establishes the design system, writes Section 1.
- **Bob (Claude)** — Pulls Alice's file from gist, adds build timeline + agent roster section (Section 2).
- **Charlie (ChatGPT)** — Pulls Bob's file, adds use cases + call-to-action section (Section 3). Pushes final version.

---

## Architecture

```
iPhone (Jared)
    ↓ triggers
Alice (Perplexity)
    → loads G-009 identity
    → writes HTML v1 (shell + Section 1)
    → gitzip pushes to gist
    → notion-ops appends build log row
    → writes handoff → spaces/bob/inbox.md

Bob (Claude)
    → reads inbox
    → gitzip pulls HTML v1 from gist
    → adds Section 2
    → gitzip pushes HTML v2 to gist
    → notion-ops appends build log row
    → writes handoff → spaces/charlie/inbox.md

Charlie (ChatGPT)
    → reads inbox
    → gitzip pulls HTML v2 from gist
    → adds Section 3
    → gitzip pushes HTML v3 (final) to gist
    → notion-ops appends build log row
    → gitzip deploys final HTML → GitHub Pages

Audit trail: 3 agents · 3 commits · 3 CIDs · 1 Notion build log · 1 live URL
```

---

## Build Order

1. **Harden gitzip-push** — path safety, SHA-256 per file, dry-run mode. BLOCKING — demo depends on reliable gist round-trips.
2. **Add spaces/charlie/inbox.md** — third agent slot for ChatGPT. 5-minute task.
3. **Build demo HTML seed file** — QA.Stone Project Dashboard template. Each agent knows exactly where to inject their section without breaking the others.
4. **Write demo-run.md** — step-by-step repeatable script so demo can be handed to anyone and run cleanly.
5. **Wire Notion build log** — each agent push appends a timestamped row to PraX page. Live scoreboard.
6. **Wire GitHub Pages deploy** — final gitzip push auto-deploys to a live URL. The last step of the demo is a working link.

---

## Success Criteria

- [ ] 3 distinct agent CIDs visible in git commit log
- [ ] Notion build log shows 3 timestamped rows, one per agent
- [ ] Final HTML renders at a live GitHub Pages URL
- [ ] Entire run orchestrated from iPhone — no laptop touched
- [ ] Demo is fully repeatable from demo-run.md by anyone

---

## The Pitch Line

> "I handed my iPhone to three different AIs. They built an app together in GitHub. You can see every commit. The whole thing deployed itself. None of them were in the same conversation. None of them needed a server."

---

## Open Items for Bob

1. Review this PRD and flag any amendments
2. Confirm Charlie agent slot approach (spaces/charlie/ pattern)
3. Assign yourself gitzip-push hardening or signal Alice to start

---

*Source: alice/c2/jared via notion-ops · 2026-05-08*
