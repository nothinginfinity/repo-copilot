# Bob GitHub Relay — Deploy Guide

A tiny Cloudflare Worker that sits between Bob’s ChatGPT custom GPT Action and the GitHub API.

```
Custom GPT Action → Bob GitHub Relay → GitHub API → nothinginfinity/repo-copilot
```

## Why

ChatGPT’s built-in GitHub connector is read-only (403 on writes).
The relay gives Bob write access through a clean, Bob-native API
that handles all raw GitHub mechanics (base64, SHA lookup, create-vs-update, multi-file).

---

## Step 1 — Generate a GitHub PAT

1. Go to: https://github.com/settings/tokens?type=beta
2. **Generate new token (fine-grained)**
3. Name: `repo-copilot-bob-relay`
4. Repository access: **Only selected** → `nothinginfinity/repo-copilot`
5. Permissions: **Repository contents: Read and Write** only
6. Copy the token (starts with `github_pat_...`)

---

## Step 2 — Deploy the Worker (iPhone/Safari)

### Option A — Cloudflare Dashboard (no CLI needed, iPhone-friendly)

1. Go to: https://dash.cloudflare.com (free account is fine)
2. Left sidebar → **Workers & Pages** → **Create application** → **Create Worker**
3. Name it: `repo-copilot-bob-relay`
4. Click **Deploy** (deploys the default hello-world first)
5. Click **Edit code**
6. Delete all existing code
7. Paste the full contents of `worker.js` (this folder)
8. Click **Deploy**

### Option B — Wrangler CLI

```bash
npx wrangler deploy
```

---

## Step 3 — Set Secrets

In Cloudflare dashboard → your Worker → **Settings** → **Variables** → **Add variable** (use **Encrypt** toggle):

| Variable | Value |
|---|---|
| `GITHUB_PAT` | The PAT from Step 1 |
| `RELAY_SECRET` | Any strong random string (e.g. 32 chars) — you’ll paste this into the GPT Action auth |

---

## Step 4 — Get Your Worker URL

After deploy, Cloudflare gives you a URL like:
```
https://repo-copilot-bob-relay.<your-subdomain>.workers.dev
```
Copy it.

---

## Step 5 — Update the Custom GPT Action

1. Open your Bob custom GPT in the GPT builder (chatgpt.com/gpts/editor in Safari)
2. Under **Actions** → open the existing action
3. In the schema, replace `YOUR_RELAY_URL` with your worker URL
4. Under **Authentication**:
   - Auth type: **API Key**
   - API Key: paste your `RELAY_SECRET`
   - Auth type: **Bearer**
5. Save

---

## Step 6 — Test

Verify the relay is live:
```
GET https://your-worker-url/health
```
Should return: `{"status":"ok","relay":"bob-github-relay","version":"1.0"}`

Then in Bob (ChatGPT):
1. *"Read the file spaces/mail.md"* — should return content
2. *"Append a test message to spaces/mail.md marking MSG-005 as read"* — should commit
3. *"Push a test turn bundle"* — should commit to `.github/turns/`

---

## Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Liveness check (no auth) |
| POST | `/get_file` | `{path}` | Read any file from the repo |
| POST | `/push_files` | `{files:[{path,content}], message}` | Write 1-10 files in one commit |
| POST | `/append_mail` | `{content, mark_read_id?}` | Append a message to mail.md |
| POST | `/push_turn_bundle` | `{turn_json, mail_update?}` | Write turn.json + optional mail update |

---

## Security

- `GITHUB_PAT` and `RELAY_SECRET` live only in Cloudflare encrypted secrets — never in the repo
- Relay enforces: path allowlist, `.github/workflows/` deny, max 10 files, max 80KB per file
- Bob’s GPT Action authenticates with `RELAY_SECRET` — Bob never sees the PAT
- Rotate PAT at: https://github.com/settings/tokens
