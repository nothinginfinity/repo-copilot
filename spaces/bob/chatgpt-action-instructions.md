# Bob — ChatGPT Custom GPT + Relay Setup
_Updated after Bob’s MSG-004 recommendation (2026-05-10)_

## Architecture

```
ChatGPT (Bob custom GPT)
        ↓
   GPT Action (OpenAPI schema)
        ↓
  Bob GitHub Relay (Cloudflare Worker)
        ↓
  GitHub Contents API
        ↓
nothinginfinity/repo-copilot
```

**Bob never calls the raw GitHub API directly.**
The relay handles base64, SHA lookups, create-vs-update, multi-file commits, and auth isolation.

**Path A (now):** Custom GPT + Action → Bob GitHub Relay
**Path B (later):** Replace relay with GitHub MCP once write-capable MCP is confirmed available

---

## Setup Order

### 1. Deploy the relay first
See `spaces/bob/relay/README.md` for full step-by-step (iPhone/Safari friendly, no CLI needed).

Short version:
- Create a free Cloudflare account at dash.cloudflare.com
- Workers & Pages → Create Worker → paste `relay/worker.js` → Deploy
- Set two encrypted secrets: `GITHUB_PAT` and `RELAY_SECRET`
- Copy your worker URL (e.g. `https://repo-copilot-bob-relay.xyz.workers.dev`)

### 2. Create the Custom GPT
- Go to chatgpt.com/gpts/editor in Safari on iPhone
- Name: **Bob** (or `repo-copilot-bob`)
- Paste boot instructions from `G-000-bob-boot.md` → Section 7
- Add at the bottom of instructions:
  ```
  For all file reads and writes, use the Bob GitHub Relay Action.
  Slot-3 turn bundle = call push_turn_bundle with turn_json (and mail_update if needed).
  Never call the GitHub API directly.
  ```

### 3. Add the Action
- In the GPT builder → **Actions** → **Add Action**
- Paste `spaces/bob/chatgpt-action-schema.yaml`
- Replace `YOUR_RELAY_URL` with your deployed worker URL
- Authentication: **API Key / Bearer** → paste your `RELAY_SECRET`

### 4. Test (in Bob chat)
```
"Read spaces/mail.md"
"Append MSG-006 to spaces/mail.md marking MSG-005 as read"
"Push a test turn bundle"
```

### 5. Path B — MCP check (after relay is working)
- In the GPT settings, look for MCP connectors / Connected apps
- If GitHub MCP with write tools is available, connect it as a drop-in replacement
