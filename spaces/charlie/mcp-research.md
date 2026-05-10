# Charlie (Claude) — MCP Research Findings
_2026-05-10 — verified by Claude Pro iPhone_

## Summary

Claude Pro CAN use MCP tools, but the official GitHub MCP server has an OAuth gap
that blocks the cloud/iPhone path. Three viable options exist.

---

## What Claude confirmed

### 1. MCP on iPhone — Yes, with a caveat
- Claude iOS app supports remote MCP servers
- **Configuration must happen on claude.ai (web) first** — not in the iPhone app
- Once configured at claude.ai → Settings → Connectors → syncs to iPhone automatically
- Free plan: 1 custom connector. Pro/Max/Team/Enterprise: multiple connectors

### 2. The GitHub MCP OAuth gap
- The official GitHub MCP server (`github/github-mcp-server`) requires OAuth
  via a registered GitHub App or OAuth App
- This OAuth flow is **not currently supported** via claude.ai remote connector
- Local Docker path (Claude Desktop + `claude_desktop_config.json`) works fine
  but requires a Mac/Windows desktop — not available on iPhone only

### 3. Three paths for Charlie to write to GitHub

| Path | Status | Notes |
|------|--------|-------|
| **A: Composio** | ✅ Best mobile path | Managed remote MCP endpoint, handles OAuth, add as custom connector on claude.ai — works on iPhone |
| **B: Claude Desktop + Docker** | ✅ Best overall | Full parity with Alice, but requires Mac/Windows |
| **C: HTTP fetch artifact** | ⚠️ Workaround | Claude writes a fetch artifact with PAT — manual handoff, not native tool use |

---

## Recommended Path — Composio

Composio (composio.dev) exposes a managed remote HTTPS MCP endpoint for GitHub
that handles OAuth. You add it as a custom connector on claude.ai:

1. Go to composio.dev — connect your GitHub account
2. Get the remote MCP URL for the GitHub tool
3. On claude.ai → Settings → Connectors → Add custom connector → paste URL
4. Syncs to Claude iPhone app automatically
5. Charlie can now call push_files, get_file_contents, etc. natively

See `spaces/charlie/composio-setup.md` for step-by-step (when ready).

---

## Architecture Implications

- **Alice (Perplexity):** Full native MCP — reads + writes GitHub directly ✅
- **Bob (ChatGPT):** Gmail bridge → Apps Script poller → GitHub (Path A working) ✅
- **Charlie (Claude):** Composio remote MCP = same native capability as Alice 🔜

Once Composio is connected, Charlie has full parity with Alice.
No relay, no Gmail bridge, no workaround needed.

---

## Interim — Alice as primary write agent

Until Composio is set up:
- Alice handles all repo writes
- Bob writes via Gmail bridge
- Charlie reads GitHub natively (built-in Claude connector), replies via Jared relay
- Jared pastes Charlie replies into Alice (current session pattern)

This works. It's not permanent. Composio unblocks Charlie completely.
