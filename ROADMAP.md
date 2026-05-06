# repo-copilot Roadmap

> **Vision:** A mobile-first, single-file AI IDE protocol — GitHub as backend, multi-LLM chat as engine, inter-agent mailboxes as nervous system.
>
> Last updated: 2026-05-06

---

## ✅ Shipped

- [x] GitHub file tree browser with checkbox selection
- [x] Export as `REPO_DUMP.txt` or `.zip`
- [x] Multi-provider LLM chat (OpenAI, Groq, xAI, Cerebras, Fireworks, Mistral, DeepSeek, Gemini)
- [x] Stage code fences → push to GitHub via Contents API
- [x] **Push Self to GitHub** button (app updates itself from within)
- [x] `.gitzip` maildrop pattern + `gitzip-unpack.yml` GitHub Action
- [x] `spaces/*/inbox.md` + `spaces/*/outbox.md` mailbox rendering

---

## 🚧 In Progress / Next Up

These are the immediate improvements scoped and reviewed by both DeepSeek and Perplexity. Build order follows the critical path (metadata foundation first, features on top).

### Phase 0 — UI Scrollability & Layout Fix (Do First, Low Risk)

The current layout clips panels on mobile — some sections are unreachable without knowing to scroll. Fix this before any other UI work so new features land in a usable shell.

- [ ] **Audit all panel heights** — identify every section using `overflow: hidden` or fixed `height` that prevents scrolling
- [ ] **Make each panel independently scrollable** — file tree, chat, mailbox, and config each get their own `overflow-y: auto` scroll region; the outer shell never clips them
- [ ] **Sticky tab bar** — tabs stay pinned at top/bottom so the user always knows what panel they're in
- [ ] **"Scroll to bottom" button in chat** — appears when user scrolls up; taps to jump to latest message
- [ ] **Collapsed sections** — long config/mailbox content gets an accordion `▶ / ▼` toggle so the panel doesn't eat the whole screen
- [ ] **Test at 375px (iPhone SE) and 390px (iPhone 14)** — every panel must be fully reachable with thumb scrolling only

> ⚠️ **Constraint:** All changes are CSS/layout only — no JS logic touching `chatHistory`, `stagedFiles`, or API calls. Zero risk of breaking core functionality.

### Phase 1 — Foundation (enables everything else)

- [ ] **Rich message metadata** — add `turnNumber`, `timestamp`, `provider`, `model` to every `chatHistory` entry
- [ ] **`customPath` param** on `stageFile()` — enables staging to arbitrary paths like `docs/reviews/`

### Phase 2 — Quick Wins

- [ ] **LLM Reference Links in Config Panel** — small `↗ docs` link per provider to their model catalog
  - OpenAI → `https://platform.openai.com/docs/models`
  - Groq → `https://console.groq.com/docs/models`
  - xAI → `https://docs.x.ai/docs/models`
  - Cerebras → `https://inference-docs.cerebras.ai/introduction`
  - DeepSeek → `https://api-docs.deepseek.com/`
  - Gemini → `https://ai.google.dev/gemini-api/docs/models`

- [ ] **Per-Turn ⬇ Save Button** — every assistant bubble gets a download button
  - Downloads as `turn-N-YYYY-MM-DD.md`
  - Format: metadata header + `## Prompt` + `## Response`
  - Requires Phase 1 metadata

### Phase 3 — Stage as `.md`

- [ ] **"Stage as .md" secondary action** on the Save button
  - Push turn to `docs/reviews/turn-N-YYYY-MM-DD.md` (or custom path)
  - Uses existing `pushFiles()` + new `customPath` param
  - Requires Phase 1 + Phase 2

### Phase 4 — Workflows Tab

- [ ] **Preset Prompt Sequences (Workflows)** — sub-panel inside Chat tab
  - `activeWorkflow` queue object wrapping `sendMessage()`
  - First kit: **Code Review** (5-step sequence)
    1. High-level architecture review
    2. Bug & edge case scan
    3. Security audit
    4. Refactor suggestions
    5. Generate review summary `.md`
  - Each step auto-fills the input; user hits Send (manual step-through, not auto-fire)
  - User can customize any prompt mid-sequence before sending
  - "Save workflow output" at end stages all 5 turns as a single `.md`

### Phase 5 — Mailbox Compose

- [ ] **Mailbox tab upgrade** — promote from pinned section to full tab
- [ ] **Compose UI** — textarea + Send button
  - Append-only writes: GET current `inbox.md` → append timestamped entry → PUT back
  - Can target any `spaces/*/inbox.md` in the loaded repo
  - Simple entry format: `---\n**From:** [repo] **At:** [timestamp]\n\n[message]\n`
- [ ] **Read view** — rendered inbox messages with timestamps, newest first

---

## 🔬 Robustness & Bug Fixes (from DeepSeek's Analysis)

These are architectural concerns flagged in the DeepSeek code review. Not blocking new features but should be addressed before wider sharing.

- [ ] **PAT support for rate-limited repos** — GitHub unauthenticated API is 60 req/hr. A PAT field in config would raise this to 5,000/hr and unblock heavy use
- [ ] **Large repo handling** — `recursive=1` tree fetch breaks on repos with 10k+ files. Add paginated fallback + warning UI when tree is truncated
- [ ] **Token budget accuracy** — current `content.length / 4` estimate is rough. Add per-provider heuristics (GPT-4 ≈ cl100k, Gemini ≈ different ratio) or a slider-based manual limit
- [ ] **Context window overflow handling** — for large selections, add a warning + auto-truncation with indicator showing what was cut
- [ ] **Partial export error recovery** — if a file fetch fails mid-export, surface a warning listing failed files instead of silent partial output

---

## 📦 Ecosystem: Standalone `gitzip-push` Tool

The `.gitzip` maildrop pattern is one of the most powerful and reusable ideas in this project — agents push a zip to a repo, a GitHub Action unpacks it, and commits happen without manual intervention. The problem: large HTML files and other big files can't be staged through the single-file app reliably.

**The plan:** Extract the gitzip mechanism into its own focused repo — `nothinginfinity/gitzip-push` — so it can be used as a standalone tool by any agent, app, or script.

### Why a Separate Repo

- The `repo-copilot.html` file is already large (~80KB) and will grow. Bundling a zip-pack engine inside it adds weight and complexity.
- A standalone tool can be used by Perplexity Spaces, m-mcp workers, or any other agent without needing repo-copilot loaded.
- It becomes a reusable primitive in the whole ecosystem — not just a feature of one app.
- Keeps repo-copilot's single-file constraint intact.

### `gitzip-push` Repo Scope

- [ ] **Create `nothinginfinity/gitzip-push`** — new standalone repo
- [ ] **`gitzip-pack.html`** — minimal single-file UI: drag-and-drop files → generates `.gitzip` bundle → one-click push to any repo path via GitHub API
  - No size limit beyond GitHub's 100MB file cap
  - Works for HTML files, large assets, anything
  - Accepts PAT + target repo + target path
- [ ] **`gitzip-unpack.yml`** — canonical GitHub Action (copy of the one in repo-copilot, but versioned and documented as the reference implementation)
- [ ] **README** — documents the protocol so other agents/tools can implement it
  - Envelope format: what goes in the zip, what metadata is expected
  - How to install the Action in any repo
  - How to call the push endpoint from scripts or other apps
- [ ] **Link back from repo-copilot** — add a "Push via Gitzip ↗" option in the Export panel that deep-links to gitzip-push for oversized files

### Large File Strategy (in repo-copilot)

- [ ] **File size warning** — if a staged file exceeds ~50KB, surface a banner: "This file is large — consider using gitzip-push for reliable delivery"
- [ ] **Direct link to gitzip-push** from the warning banner
- [ ] **Chunked push fallback** — for files 50–100KB, attempt the direct Contents API push but show progress and catch the 422 gracefully

---

## 💡 Future Ideas (Backlog)

Not scheduled — collect here so they don't get lost.

- **Search within repo** — full-text search across loaded file tree (client-side, in-memory)
- **Diff view** — show a before/after diff when staging edits, before pushing
- **Multi-repo context** — load 2 repos simultaneously for cross-repo analysis
- **Prompt library** — save custom prompts to `docs/prompts/` and reload them in future sessions
- **Workflow authoring** — UI to create custom workflow sequences (not just the built-in Code Review kit)
- **Branch switcher** — load file tree from any branch, not just default
- **Gitzip compose UI** — build and send a `.gitzip` package directly from the app without leaving it
- **Mobile PWA install** — add `manifest.json` + service worker so the app installs as a home screen app on iOS/Android
- **Token usage display** — show tokens used / context window remaining per turn
- **Chat export** — export full session as a single `.md` file (all turns, not just one)
- **Perplexity Spaces deep link** — open a Space directly from the Mailbox tab

---

## Architecture Notes

> For contributors and future LLMs reading this file.

```
GitHub Repo ──► Repo Copilot ──► Multi-Provider Chat ──► .md Artifacts ──► Pushed Back to Repo
                     │
              Mailbox System (inter-agent)
                     │
        Perplexity Spaces ◄──► Other Agents

gitzip-push (standalone) ──► Any Repo ──► gitzip-unpack.yml ──► Auto-committed files
```

**Constraints to preserve:**
- Single HTML file — no build tooling, no npm, no server
- In-memory state only — no `localStorage` or `sessionStorage`
- All API keys in `type="password"` inputs with `autocomplete="off"`
- `pushFiles()` is the single write path to GitHub — don't bypass it
- The `.gitzip` maildrop pattern must remain agent-writable without human intervention

**Critical path dependency order:**
```
Phase 0 (UI layout) → Phase 1 (metadata) → Phase 2 (quick wins) → Phase 3 (stage .md) → Phase 4 (workflows) → Phase 5 (mailbox compose)
gitzip-push repo → standalone tool → linked from repo-copilot export panel
```
