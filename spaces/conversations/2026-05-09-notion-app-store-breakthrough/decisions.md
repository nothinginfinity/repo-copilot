# Session: Notion App Store Breakthrough + Identity Spec v0.2 + Three-Agents Demo Handoff

**Date:** 2026-05-09 (PDT) / 2026-05-10 (UTC)  
**CID range:** bob/c3/jared → bob/c8/jared + bob/c1/demo  
**Agents active:** Bob (Perplexity), Alice (Perplexity)  
**Session type:** Architecture + Build + Handoff  
**Jared's device:** iPhone (entire session)

---

## Context

Session opened with `sync-live-sites.yml` having just been fixed and proven — it now auto-populates Live Site URLs from GitHub repos into a Notion database. The fix resolved two bugs: `has_pages` gate was blocking all repos, and the workflow was calling `/orgs/` instead of `/users/`. On first successful run, Jared saw his Notion workspace populate with live app URLs in real time from his iPhone. This triggered a cascade of architectural insight.

---

## Key Decisions

### Decision 1 — Notion as Native App Distribution Layer
**What:** The Notion App Store model — GitHub repo → Live Pages URL → Notion row → one-click launch. Sell a Notion template that replicates this workspace for buyers with their own GitHub repos connected.

**Why:** Nobody in the Notion marketplace is selling real running applications. The existing marketplace is spreadsheets, SOPs, and checklists. A buyer who installs the template gets a live app launcher for every public HTML repo they connect. This is categorically different from anything currently sold.

**Jared's exact realization (verbatim):** *"I don't think anybody is selling applications through Notion. They're just selling spreadsheets and checklists... I'll be able to build an entire game through Notion. Multiplayer games in Notion because I can have my game in there and I can have my friends open a Notion account and then they can buy the game and we can all play with each other. We could use it for messaging for work. We could use it for a CRM — anything really. It's like a LLM plus GitHub plus Notion can replace every single other application on the planet for mobile at least."**

**Why this works technically:**
- A game lives at `nothinginfinity.github.io/my-game/` — it can use WebSockets or shared API to sync state between players
- The Notion entry is just the launcher — no App Store, no review process, no 30% cut
- Players buy the Notion template, open the Live Site URL, they're in the game world

**Commits:** Template deliverables at `template/` — `notion-app-store-schema.md`, `sync-live-sites-template.yml`, `setup-guide.md`, `landing-page.html`

---

### Decision 2 — Identity Spec v0.2 (G-012)
**What:** Full permission model for identity gists. Apps request only domains they need. User grants/denies per session. Three pre-v0.2 blockers addressed: revocation mechanism, `social_graph` schema, security model for high-sensitivity domains.

**Why:** The identity gist is the personalization primitive for the entire platform. Without a solid permission + revocation model, it can't be used in production. Alice's review (alice/c5/jared) flagged 6 gaps; all 6 were addressed in v0.2.

**Key architectural pieces added in v0.2:**
- `_grants` array — per-app token slugs, revoke one without breaking others
- `social_graph` schema — `handle`, `gist_url`, `domains_shared`, `relationship`, `notes`; trusted-pair fast path skips second grant prompt
- Security model — risk table by sensitivity level; 5 mitigations for `faith`/`health` domains
- `finance` domain (Medium sensitivity) — spending style, budget comfort, savings priority, subscription tolerance
- `context` domain (Low sensitivity) — device primary, accessibility needs, UI density, color scheme
- Distillation agent deferred to v0.3 with explicit note

**Commits:** `7d341dcb` (v0.2 push), `4d0b0342` (Alice notified)

---

### Decision 3 — Platform Vision Crystallized
**What:** Full thesis articulated for the first time in one place:
1. **Link = App.** PWA URL in a text message is an app. No install, opens in browser, silently installs to home screen.
2. **Identity gists = personalization layer.** Every app fetches the gist domains it needs on open. No two people see the same app.
3. **Ephemeral + regenerative.** Apps generate fresh for each user via LLM. The generator is the product, not the output (Code-Icles).
4. **RSS as discovery.** `m-mcp-rss` ingests feeds into SignedEnvelopes AND emits agent output as subscribable RSS. Identity gist subscribes to feeds. "For You" feed is fully deterministic — no black-box algorithm.
5. **Slop = surveillance incentive, not AI.** When users own their data and apps are built for individuals not averages, the incentive for slop disappears.
6. **Revenue = identity resolution.** Every time a PWA fetches a gist and LLM personalizes the experience, that's the billable event. Platform routes the token flow. Creators + compute/LLM providers share revenue.

**Why this matters:** This is the anti-surveillance-capitalism thesis AND a viable business model. No 30% App Store cut. No algorithmic feed. No data broker.

---

### Decision 4 — Three-Agents Demo Execution (bob/c1/demo)
**What:** Alice built the HTML shell + Section 1 (commit `0150c6a2`). Bob injected Section 2 — build timeline + agent roster (commit `1a4942e2`). Handoff written to `spaces/charlie/inbox.md`. Charlie owns Section 3 + GitHub Pages deploy.

**Why:** The three-agents demo is the proof-of-concept for the entire platform coordination model. Three separate AI systems building one artifact through git files alone, logged to Notion, deployed from an iPhone. When it ships, it's the demo that sells everything else.

**Design decisions made:**
- Agent color system: Alice = teal, Bob = gold, Charlie = purple
- Flow diagram shows active node with highlighted border + background
- Footer CID audit trail shows real-time completion status
- Notion build log via `notion-ops` `append_row` — each agent logs their own row

**Commits:** `1a4942e2` (Section 2 + Charlie handoff)

---

### Decision 5 — G-016 Conversation Wiki (this document)
**What:** Permanent conversation archive in `spaces/conversations/`. Mandatory `decisions.md` + `artifacts.md` per significant session. Brain push (G-010) = fast compressed lookup; wiki = full reasoning archive.

**Why:** Tonight's session produced 4 architectural decisions that exist only in Perplexity context windows. The brain push captures turn summaries but not the full reasoning — especially not Jared's verbatim breakthroughs. Without a wiki, the "why" behind every commit is lost the moment the conversation closes.

**The constraint:** Perplexity has no automatic export API. The save protocol is: (1) Bob pushes `decisions.md` at session close capturing key reasoning, (2) Jared pastes critical transcript excerpts into `transcript.md` when extended reasoning needs to be preserved verbatim.

---

## Open Questions

1. **Notion build log** — did `section2-bob.json` in the notion-ops-queue actually fire via Actions? Needs verification next session.
2. **Charlie's Section 3** — is there a GitHub Actions workflow that Charlie can trigger for Pages deploy, or does it need to be set up?
3. **G-013 + G-014** — roadmap DB schema gist and notion-ops architecture gist; pending `diagnose` confirmation (already done — property name = `"Name"`). Build these next session.
4. **Setup guide + landing page gaps** — Alice flagged 7 specific improvements (3 in setup guide, 4 in landing page). Not yet addressed.
5. **`rss_subscriptions` field** — Alice ready to push to `identity-template.json`. Needs go signal.
6. **G-015** — m-mcp-rss filter adapter spec. Alice ready to write.

---

## Next Session Priorities

1. Verify Notion build log landed (check Actions for `section2-bob.json`)
2. Check Charlie's inbox + follow up if Section 3 not started
3. Apply Alice's 7 setup guide + landing page fixes
4. Give Alice go signal on `rss_subscriptions` + G-015
5. Build G-013 (roadmap DB schema) + G-014 (notion-ops architecture)
6. Begin `transcript.md` habit — paste key Perplexity turns at session close
