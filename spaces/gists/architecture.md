# repo-copilot — Agent Architecture
_Living document. Updated each time architecture changes._
_Last updated: 2026-05-10_

---

## Agent Roster

| Agent | Platform | Read | Write | Status |
|-------|----------|------|-------|--------|
| **Alice** | Perplexity (iPhone) | ✅ GitHub MCP native | ✅ GitHub MCP native (`push_files`) | Fully operational |
| **Bob** | ChatGPT (iPhone) | ✅ GitHub connector | ✅ Gmail bridge → Apps Script → GitHub | Operational (Path A) |
| **Charlie** | Claude Pro (iPhone) | ✅ GitHub connector | ⚠️ OAuth gap — Composio fix pending | Read-only for now |

---

## Write Path Details

### Alice — Native MCP
```
Perplexity Space (Alice)
  → GitHub MCP tools (push_files, get_file_contents, etc.)
  → nothinginfinity/repo-copilot
```
Full multi-file commits. No workaround. Primary write agent.

### Bob — Gmail Bridge (Path A)
```
ChatGPT Bob
  → Gmail draft (BOB_TURN_BUNDLE / BOB_MAIL_APPEND / etc.)
  → Google Apps Script poller (every 5 min)
  → GitHub Contents API
  → nothinginfinity/repo-copilot
```
Files: `spaces/bob/gmail-bridge/`
Upgrade path: Cloudflare relay (`spaces/bob/relay/`) when deployed.

### Charlie — Composio MCP (pending)
```
Claude Pro iPhone
  → Composio managed MCP endpoint (remote HTTPS)
  → GitHub OAuth (handled by Composio)
  → nothinginfinity/repo-copilot
```
Setup: composio.dev → connect GitHub → add URL to claude.ai Connectors → syncs to iPhone.
Interim: Jared pastes Charlie replies into Alice session.

---

## Shared Infrastructure

| File | Purpose |
|------|---------|
| `spaces/mail.md` | Agent↔agent mailbox (all agents) |
| `spaces/gists/brain.json` | Shared memory / live state |
| `spaces/gists/G-000-alice-boot.md` | Alice boot instructions |
| `spaces/gists/G-000-bob-boot.md` | Bob boot instructions |
| `spaces/gists/G-000-charlie-boot.md` | Charlie boot instructions |
| `.github/turns/{session}/{cid}/turn.json` | Per-turn audit log |

---

## Session Protocol

- **Slot 1-2:** Each agent reads startup files + mail.md
- **Slot 3 (turn-close):** Each agent pushes turn.json + any mail updates
- **Session ID format:** `YYYY-MM-DD-session-{name}`
- **CID format:** `{agent}/{turn-number}/{user}`

---

## Upgrade Roadmap

| Priority | Item | Unblocks |
|----------|------|----------|
| 1 | Composio GitHub MCP for Charlie | Charlie full write parity with Alice |
| 2 | Deploy Cloudflare relay for Bob | Bob faster/more reliable writes |
| 3 | GitHub MCP native in ChatGPT | Bob full parity (no Gmail bridge) |
| 4 | Notion integration | Cross-agent structured logging |
