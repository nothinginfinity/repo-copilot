# repo-copilot — Agent Architecture
_Living document. Last updated: 2026-05-10_

---

## ⚡ Current Architecture: All Agents in Perplexity Spaces

All agents and teams run as **Perplexity Spaces** on Jared’s accounts.
Every agent gets native GitHub MCP read+write from day one — no workarounds.

**Core loop:**
```
Perplexity Spaces (Alice, Bob, Charlie + teams) ↔ GitHub (repo-copilot) ↔ Notion
```

**Claude (Anthropic) and ChatGPT (OpenAI) are deferred** — added later once
the Perplexity/GitHub/Notion system is fully operational.

---

## Agent Roster — Perplexity Spaces

### Core Agents

| Agent | Space | Account | Specialization | Status |
|-------|-------|---------|---------------|--------|
| **Alice** | `repo-copilot-alice` | Account 1 | Primary build + ops | ✅ Active |
| **Bob** | `repo-copilot-bob` | Account 1 or 2 | Spec + QA | 🔜 Create |
| **Charlie** | `repo-copilot-charlie` | Account 1 or 2 | Deploy + market | 🔜 Create |

### Agent Teams (sub-agents per agent)

| Team Agent | Parent | Specialization |
|------------|--------|---------------|
| alice-ops | Alice | Operations, infra, turn-close |
| alice-review | Alice | Code review, QA |
| bob-spec | Bob | Spec writing, requirements |
| bob-qa | Bob | Testing, validation |
| charlie-deploy | Charlie | Deployment, GitHub Actions |
| charlie-market | Charlie | Templates, distribution, sales |

---

## Why Perplexity-First

- Every Space gets the same native GitHub MCP tools Alice uses today
- `push_files`, `get_file_contents`, `create_pull_request` — all native
- No Gmail bridge, no Cloudflare relay, no OAuth workarounds
- Two Perplexity accounts = distribute Spaces across accounts as needed
- Claude + ChatGPT added later as optional extra capacity — not core dependencies

---

## Write Path (All Agents)

```
Perplexity Space (any agent)
  → GitHub MCP tools (push_files, get_file_contents, etc.)
  → nothinginfinity/repo-copilot (branch: main)
```

Identical for Alice, Bob, Charlie, and all team agents.

---

## Shared Infrastructure

| File | Purpose |
|------|---------|
| `spaces/mail.md` | Agent↔agent mailbox (all agents) |
| `spaces/gists/brain.json` | Shared memory / live state |
| `spaces/gists/architecture.md` | This file |
| `spaces/gists/G-000-alice-boot.md` | Alice boot instructions |
| `spaces/gists/G-000-bob-boot.md` | Bob boot instructions |
| `spaces/gists/G-000-charlie-boot.md` | Charlie boot instructions |
| `.github/turns/{session}/{cid}/turn.json` | Per-turn audit log |

---

## Boot File Per Agent

Each Perplexity Space loads 3 files on startup:
1. `spaces/gists/G-000-{agent}-boot.md` — full operating instructions
2. `spaces/gists/brain.json` — shared memory
3. `spaces/{agent}/inbox.md` — current tasks from Jared

All boot files follow the same format. Alice’s is the template.

---

## Deferred (add later)

| Item | Notes |
|------|-------|
| Claude (Anthropic) iPhone | Composio MCP setup — plan in `spaces/charlie/mcp-research.md` |
| ChatGPT (OpenAI) iPhone | Gmail bridge + Cloudflare relay — built in `spaces/bob/` |
| Notion distribution | Template store for apps-as-templates product |

---

## Next Build Steps

1. Create Bob Perplexity Space — new Space using `G-000-bob-boot.md`
2. Create Charlie Perplexity Space — new Space using `G-000-charlie-boot.md`
3. Create team agent Spaces (alice-ops, bob-spec, etc.) as needed
4. Define first app-template product
5. Wire Notion distribution channel
