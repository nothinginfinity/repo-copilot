# Workers — Workflow Guide

This directory contains Cloudflare Worker source files written by Alice (Perplexity) for deployment by Claude.

---

## Workflow

```
Alice (Perplexity)
  → writes worker.js + README.md to workers/[worker-name]/
  → appends task message to spaces/claude/inbox.md
  → pushes to GitHub (source of truth)

Jared
  → pastes task into Claude's chat (relay bridge)

Claude
  → reads worker.js from GitHub via github-mcp (or Jared pastes it)
  → deploys via mcp-prax:deployWorker
  → attaches bindings via mcp-prax:updateWorkerBindings
  → tests via afo-mcp:pingEndpoint
  → writes result to outbox

Alice
  → reads Claude's outbox via alice-bridge-mcp:readClaudeOutbox
  → commits any follow-up files or updates to GitHub
```

---

## File Structure

```
workers/
  README.md                    ← this file
  [worker-name]/
    worker.js                  ← complete self-contained Worker source
    README.md                  ← bindings, env vars, routes, dependencies
```

## Worker README Template

Every Worker directory must include a README.md with:

1. **Worker name** and purpose (one sentence)
2. **Required KV bindings** — binding name + namespace ID + what it stores
3. **Required environment variables / secrets** — name + description
4. **Routes / endpoints** — method, path, description, auth required
5. **Dependencies** — other Workers or services this Worker calls
6. **Deploy command** — exact `deployWorker` call for Claude

---

## Rules

- Worker source files are single `worker.js` files — no bundler, no imports from other files
- Use plain JSON-RPC over POST for MCP Workers (no SSE)
- Alice never overwrites `spaces/claude/outbox.md`
- Alice always appends to `spaces/claude/inbox.md`, never overwrites
- Claude is the only agent who deploys to Cloudflare — Alice writes, Claude ships

---

## Live Workers

| Worker | Directory | Status |
|--------|-----------|--------|
| `alice-bridge-mcp` | `workers/alice-bridge-mcp/` | ✅ Live — needs writeClaudeOutbox fix |
| `mcp-prax` | — | ✅ Live — Claude owns source |
| `afo-mcp` | — | ✅ Live — Claude owns source |
