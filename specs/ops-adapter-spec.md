# Ops Adapter Specification v0.1

> **Actions-as-MCP** — a universal pattern for extending agent tool capabilities from a mobile device without a local runtime.
> Author: Jared Edwards · Bob (bob/c2/jared) · 2026-05-08

---

## Overview

An **Ops Adapter** is a GitHub Actions workflow that wraps any external API and exposes it as an agent-callable tool using only two files: a `queue.json` command input and a `result.json` response output.

This pattern is the foundation of **M-MCP (Mobile Model Context Protocol)** — it allows agents (Bob, Alice, or any future instance) to call any REST API in the world using only the two MCP tools they already have:

- `create_or_update_file` → write a command to `queue.json`
- `get_file_contents` → read the response from `result.json`

No local server. No npm install. No terminal. Everything runs on GitHub's infrastructure. The only requirement per adapter is one YAML file and one repository secret.

---

## The Pattern

```
Agent
  │
  │  create_or_update_file
  ▼
spaces/{adapter}/queue.json        ← command input (agent writes)
  │
  │  on: push (path filter)
  ▼
.github/workflows/{adapter}.yml    ← Actions workflow (calls external API)
  │
  │  git commit [skip ci]
  ▼
spaces/{adapter}/result.json       ← response output (agent reads)
  │
  │  get_file_contents
  ▼
Agent
```

**Total agent tool calls: 2** (write + read). Wait time: ~30–60 seconds.

---

## Standard File Shapes

### `queue.json` — Command Input

Every ops adapter queue file MUST include these base fields:

```json
{
  "op": "<operation_name>",
  "requested_by": "<agent_cid>",
  "timestamp": "<ISO-8601>"
}
```

Adapter-specific fields are added alongside these. Example:

```json
{
  "op": "create_gist",
  "requested_by": "bob/c2/jared",
  "timestamp": "2026-05-08T14:00:00Z",
  "description": "G-001 Build & Push Constraints",
  "public": false,
  "files": {
    "G-001-constraints.md": {
      "content": "# G-001 ...content..."
    }
  }
}
```

### `result.json` — Response Output

Every ops adapter result file MUST include these base fields:

```json
{
  "op": "<operation_name>",
  "status": "success | error",
  "requested_by": "<agent_cid>",
  "completed_at": "<ISO-8601>",
  "error": null
}
```

On success, adapter-specific fields are added. On error, `error` contains the message string and all adapter-specific fields are omitted.

---

## Workflow Template

Every ops adapter workflow follows this structure:

```yaml
name: <Adapter Name> Ops

on:
  push:
    paths:
      - 'spaces/<adapter>/queue.json'

jobs:
  run-op:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run operation
        uses: actions/github-script@v7
        env:
          <SERVICE>_TOKEN: ${{ secrets.<SERVICE>_TOKEN }}
        with:
          script: |
            const fs = require('fs');
            const queue = JSON.parse(fs.readFileSync('spaces/<adapter>/queue.json', 'utf8'));
            // ... adapter logic ...
            fs.writeFileSync('spaces/<adapter>/result.json', JSON.stringify(result, null, 2));

      - name: Commit result
        run: |
          git config user.name "<adapter>[bot]"
          git config user.email "<adapter>@nothinginfinity.bot"
          git add spaces/<adapter>/result.json
          git diff --cached --quiet || git commit -m "chore(<adapter>): write result [skip ci]"
          git push
```

**Critical rules:**
- The `on.push.paths` filter must target ONLY the queue file — never `result.json`
- The commit message MUST include `[skip ci]` to prevent infinite workflow loops
- The workflow job needs `permissions: contents: write` to push the result commit
- Secrets are referenced as `${{ secrets.TOKEN_NAME }}` and checked at runtime

---

## Naming Conventions

| Item | Pattern | Example |
|------|---------|----------|
| Adapter directory | `spaces/{adapter}/` | `spaces/gist-ops/` |
| Queue file | `spaces/{adapter}/queue.json` | `spaces/gist-ops/queue.json` |
| Result file | `spaces/{adapter}/result.json` | `spaces/gist-ops/result.json` |
| Workflow file | `.github/workflows/{adapter}.yml` | `.github/workflows/gist-ops.yml` |
| Secret name | `{SERVICE}_TOKEN` | `GIST_TOKEN` |
| Bot name | `{adapter}[bot]` | `gist-ops[bot]` |
| Op names | `{verb}_{noun}` (snake_case) | `create_gist`, `send_message` |

---

## Adapter Registry

All active adapters are listed here. Update this table when adding a new adapter.

| Adapter | Workflow | Secret | Status | Ops Available |
|---------|----------|--------|--------|---------------|
| `gist-ops` | `.github/workflows/gist-ops.yml` | `GIST_TOKEN` | ✅ Active | `create_gist`, `update_gist`, `get_gist`, `list_gists` |

---

## Adding a New Adapter (iPhone Workflow)

This entire process can be completed from an iPhone in under 10 minutes.

**Step 1 — Create the secret**
1. Get an API token/key from the target service
2. Go to: `github.com/nothinginfinity/repo-copilot/settings/secrets/actions`
3. Tap "New repository secret"
4. Name: `{SERVICE}_TOKEN` · Value: paste token · Save

**Step 2 — Ask Bob or Alice to push the adapter files**
Provide:
- The service name and API docs URL
- The operations you want (e.g. "send message, list channels")
- The secret name you just created

Bob or Alice will push:
- `.github/workflows/{adapter}.yml`
- `spaces/{adapter}/queue.json` (seeded with a safe read-only op)
- `spaces/{adapter}/result.json` (placeholder)
- `spaces/{adapter}/README.md` (protocol docs)

**Step 3 — Test**
Bob or Alice triggers the workflow by touching `queue.json`. Check Actions tab. Green = ready.

**Step 4 — Update this registry**
Add a row to the Adapter Registry table above.

---

## Candidate Adapters

The following services are strong candidates for future ops adapters. Each requires only a token and a YAML file.

| Service | What it unlocks | Token type |
|---------|----------------|------------|
| **Slack** | Send messages to channels, DMs | Bot token (`xoxb-`) |
| **Notion** | Create/update pages and databases | Integration token |
| **Linear** | Create issues, update project state | API key |
| **OpenAI** | Run completions, embeddings, file uploads | API key (`sk-`) |
| **Stripe** | Create payment links, read balance | Secret key (`sk_`) |
| **Twilio** | Send SMS, read message logs | Account SID + Auth token |
| **Cloudflare** | Purge cache, deploy Workers | API token |
| **Vercel** | Trigger deployments, read logs | Access token |
| **Airtable** | Read/write records and tables | Personal access token |
| **Cal.com** | Create bookings, read availability | API key |

---

## Relationship to QA.Stone

Ops Adapters are the **execution layer** of the QA.Stone architecture:

- A `SKILL` type Stone (`glow_channel: skill.ops`) can reference an adapter's `queue.json` path as its invocation target
- The adapter's `result.json` is the Stone's output payload
- Multiple adapters wired together via agent orchestration = a **GOLDSTONE** (full project artifact with active execution capability)

In the 3-primitive model: the adapter workflow is the repo lattice doing work, the result gist (if promoted) is the wormhole, and the queue/result files are the context payload.

---

## Security Notes

- Each secret is **scoped to one service only** — a compromised adapter can't affect other services
- Secrets are **write-only** — no API, no agent, no workflow log can read them back
- Use **fine-grained PATs** where possible — request only the minimum scopes
- The `[skip ci]` tag prevents the result commit from re-triggering the workflow
- Agents should never log secret values in queue files — tokens belong only in GitHub Secrets
