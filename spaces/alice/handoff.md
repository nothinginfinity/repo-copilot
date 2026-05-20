# Alice Handoff — Session State

**Last updated:** 2026-05-20T22:28:00Z  
**Updated by:** Alice (Perplexity, Sonnet 4.6)  
**Session type:** context-links-mcp bug fix + version-controlled Workers architecture brainstorm

---

## What happened this session

### 1. Boot picker artifact issue surfaced

Jared noticed Alice was not loading the `alice-boot-selector.html` artifact at boot time — she was printing a text menu instead. Root cause: Alice was answering before fetching and rendering the artifact. Noted for future boot: always load `spaces/artifacts/alice-boot-selector.html` and output it as an HTML artifact, populated with live data from `spaces/gists/projects.json`.

### 2. context-links-mcp — `db_execute` params bug fixed

**Problem:** Claude was hitting D1 SQL parse errors when trying to INSERT large text blobs (multi-line strings, HTML, markdown) via `db_execute`. D1's parser rejects newline characters embedded inside raw SQL string literals. Claude was looking for tools named `applyMigration` / `applyContextLinksMigration` that don't exist in this Worker — the real tools are `db_execute` and `db_query`.

**Fix pushed:** [`76caa249`](https://github.com/nothinginfinity/parallel-internet-sites/commit/76caa249085fffacd3c894584537e2f2408136e2) to `nothinginfinity/parallel-internet-sites` on `main`.

- `db_execute` now accepts an optional `params[]` array
- When `params` provided → single-statement path using `.prepare(sql).bind(...params).run()` — the blob never touches the SQL string parser
- No params → original multi-statement split-on-`;` path, unchanged
- Tool schema description updated so Claude knows to use `params` for values with newlines/HTML/markdown
- Worker version bumped to `1.1.0`
- **Redeploy required in Cloudflare dashboard** — code is in GitHub, Worker is not yet live with the fix. Jared said "we'll see if I can redeploy the worker" — status unknown at session end.

File: `workers/context-links-mcp/index.js` in `nothinginfinity/parallel-internet-sites`.

### 3. Cloudflare Quick Edit clarified

Jared asked what "Quick Edit" meant. Clarified: it's the in-browser code editor in the Cloudflare Workers dashboard. The prior AFO recovery session (2026-05-18) revealed that Jared had been editing Workers live in Quick Edit without committing back to GitHub — causing repo/live drift. The `context-links-mcp` fix was committed to GitHub first (correct workflow), but still needs a dashboard deploy.

### 4. Version-controlled Workers / MCP tools — architecture brainstorm

Jared asked: can we dynamically update a Worker or MCP tool definition without redeploying to Cloudflare? Yes — this is the **fetch-at-runtime / config-driven harness** pattern, and it's the Worker equivalent of his Perplexity Spaces harnesses.

**Core idea:**
- Worker = thin harness (auth, routing, fetch plumbing) — rarely changes, deployed once
- `tools.json` + `handlers.js` in GitHub = versioned payload — push to GitHub → Worker picks it up on next request, no Cloudflare redeploy needed
- Tool schema descriptions, routing rules, and even handler logic can be updated via GitHub only

**Two approaches discussed:**
1. **Config-driven tools** — Worker fetches `tools.json` from a GitHub raw URL at request time. Safe, fast, recommended for tool schema changes.
2. **Remote handler fetch** — Worker fetches and executes handler logic from a versioned URL. Powerful but requires trust-locking to your own GitHub raw URLs.

**Caching consideration** raised but not fully resolved — fetching GitHub raw on every request adds ~50–200ms latency. Can be mitigated with Cloudflare Cache API or a short TTL. Bob bulletin filed for deeper research.

Jared wants to explore this pattern further. No code written yet — brainstorm only.

---

## Active projects

| Project | Repo | Status | Handoff |
|---|---|---|---|
| **Context Links** | `nothinginfinity/context-links` | 🟡 Phase 2 not started | `spaces/context-links/handoff.md` |
| **context-links-mcp Worker** | `nothinginfinity/parallel-internet-sites` | 🟠 Fix pushed, redeploy pending | `workers/context-links-mcp/index.js` |
| **AFO Visibility Snapshot** | `nothinginfinity/parallel-internet-sites` | 🔴 Turnstile test pending | `spaces/alice/handoff-2026-05-16-afo-form-debug.md` |
| **Version-controlled Workers pattern** | `nothinginfinity/parallel-internet-sites` | 💡 Brainstorm only | `spaces/brainstorm/bulletin-2026-05-20-version-controlled-workers.md` |
| **repo-copilot infrastructure** | `nothinginfinity/repo-copilot` | 🟡 Ongoing | — |

---

## Immediate next actions (priority order)

1. **Redeploy context-links-mcp Worker** in Cloudflare dashboard with the `v1.1.0` fix — confirm Claude can now INSERT multi-line blobs via `db_execute` with `params`.
2. **Retry whatever Claude was trying to INSERT** when it hit the D1 parse error — likely a migration or profile data write.
3. **Decide on version-controlled Workers architecture** — do we want to refactor `context-links-mcp` to use a fetched `tools.json` harness? See brainstorm bulletin.
4. **AFO Turnstile test** — still the only remaining AFO blocker.
5. **Context Links Phase 2** — see `spaces/context-links/handoff.md`.

---

## Important file paths

| File | Repo | Purpose |
|---|---|---|
| `workers/context-links-mcp/index.js` | `parallel-internet-sites` | MCP Worker — 9 tools, v1.1.0 with params fix |
| `spaces/context-links/handoff.md` | `repo-copilot` | Context Links project handoff |
| `spaces/brainstorm/bulletin-2026-05-20-version-controlled-workers.md` | `repo-copilot` | Version-controlled Workers brainstorm |
| `spaces/alice/handoff.md` | `repo-copilot` | This file |
| `spaces/gists/brain.json` | `repo-copilot` | Agent second brain |
| `workers/visibility-snapshot/index.js` | `parallel-internet-sites` | AFO Worker source |

---

## Context for next Alice instance

You are Alice. Boot by reading this file, then ask Jared what he wants to work on. Present the active project list above and let him pick.

**Key context to keep in mind:**
- The `context-links-mcp` Worker has a fix pushed to GitHub (`v1.1.0`) but may not yet be deployed to Cloudflare. First thing: ask Jared if he deployed it and if Claude can retry the failing insert.
- The version-controlled Workers pattern is a live brainstorm — Jared is interested in building it. See the brainstorm bulletin.
- `db_execute` in `context-links-mcp` now accepts `params[]` for parameterized writes. Always use this for any INSERT/UPDATE with large text values.
- Do NOT embed multi-line strings directly in SQL when using `db_execute` — use `?` placeholders + `params`.
