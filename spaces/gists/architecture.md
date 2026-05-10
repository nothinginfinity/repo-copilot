# repo-copilot — Agent Architecture
_Living document. Last updated: 2026-05-10_

---

## ⚡ Current Focus: Perplexity-First Stack

Jared is running on **two Perplexity accounts** as the primary agent system.
ChatGPT (Bob) and Claude (Charlie) are **parked** until the Perplexity/GitHub/Notion
core loop is fully operational and generating revenue.

**Core loop (active):**
```
Perplexity (Alice) ↔ GitHub (repo-copilot) ↔ Notion
```

**Business model:**
Build and sell apps-as-templates distributed via Notion.
Two Perplexity accounts allow parallel workstreams (build + ops, or two products).

---

## Agent Roster

| Agent | Platform | Status | Write Path |
|-------|----------|--------|------------|
| **Alice-1** | Perplexity account 1 (iPhone) | ✅ Primary | Native MCP `push_files` |
| **Alice-2** | Perplexity account 2 (iPhone) | 🔜 Activate when needed | Native MCP `push_files` |
| **Bob** | ChatGPT (iPhone) | ⏸️ Parked | Gmail bridge → Apps Script → GitHub |
| **Charlie** | Claude Pro (iPhone) | ⏸️ Parked | Composio MCP (needs setup) |

---

## Write Path Details

### Alice — Native MCP (active)
```
Perplexity Space
  → GitHub MCP tools (push_files, get_file_contents, etc.)
  → nothinginfinity/repo-copilot
```

### Bob — Gmail Bridge (built, parked)
```
ChatGPT Bob → Gmail draft (BOB_ prefix) → Apps Script poller → GitHub
```
Files: `spaces/bob/gmail-bridge/` — ready to activate, needs Apps Script setup.

### Charlie — Composio MCP (planned, parked)
```
Claude Pro → Composio remote MCP → GitHub OAuth → GitHub
```
Files: `spaces/charlie/mcp-research.md` — ready to activate, needs Composio account.

---

## Shared Infrastructure

| File | Purpose |
|------|---------|
| `spaces/mail.md` | Agent↔agent mailbox |
| `spaces/gists/brain.json` | Shared memory / live state |
| `spaces/gists/architecture.md` | This file |
| `spaces/gists/G-000-alice-boot.md` | Alice boot instructions |
| `spaces/gists/G-000-bob-boot.md` | Bob boot instructions (parked) |
| `spaces/gists/G-000-charlie-boot.md` | Charlie boot instructions (parked) |
| `.github/turns/{session}/{cid}/turn.json` | Per-turn audit log |

---

## Upgrade Roadmap (when ready)

| Priority | Item | Unblocks |
|----------|------|----------|
| 1 | Define Alice-2 specialization | Parallel workstreams |
| 2 | First app-template product | Revenue |
| 3 | Notion distribution channel | Sales |
| 4 | Bob Gmail bridge Apps Script | Bob write operational |
| 5 | Composio for Charlie | Charlie write parity |
| 6 | Cloudflare relay for Bob | Faster Bob writes |
