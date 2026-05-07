# gitzip Self-Deploy Guide

This repo ships itself via gitzip. The `repo-copilot.html` app can be updated
from any device — mobile browser, Perplexity Space, or CI — by pushing a
`.gitzip` bundle. No local dev environment required.

## How It Works

```
  You (or an agent)
       │
       │  push drop-YYYYMMDD-HHMMSS.zip → .gitzip/
       ▼
  GitHub Actions triggers gitzip-unpack.yml
       │
       ├─ validates manifest (version, paths, sha256, size)
       ├─ unpacks files to temp dir
       ├─ copies files to their dest paths in the repo
       ├─ commits deployed files back to the branch
       └─ removes the .zip (ephemeral trigger, not stored)
```

## Step-by-Step: Shipping a repo-copilot.html Update

### 1. Build your bundle

Create a zip file named `drop-YYYYMMDD-HHMMSS.zip` (the `drop-` prefix is
required — it's what triggers the workflow).

The zip must contain:
- `gitzip-manifest.json` at the root
- The file(s) you want to deploy

**Example zip structure:**
```
drop-20260507-120000.zip
├── gitzip-manifest.json
└── repo-copilot.html
```

### 2. Write the manifest

See `.gitzip/example-self-deploy/gitzip-manifest.json` for a template.

Required fields:
```json
{
  "version": 2,
  "commit_message": "gitzip-deploy: update repo-copilot.html",
  "files": [
    {
      "src": "repo-copilot.html",
      "dest": "repo-copilot.html",
      "sha256": "<sha256-of-the-html-file-inside-the-zip>",
      "size": 52448
    }
  ]
}
```

To get the SHA-256 of your file:
```bash
shasum -a 256 repo-copilot.html
```

### 3. Push the zip

**Via GitHub UI (mobile-friendly):**
1. Go to `nothinginfinity/repo-copilot` → `.gitzip/`
2. Click **Add file → Upload files**
3. Upload your `drop-*.zip`
4. Commit directly to `main`

**Via API / agent:**
```bash
curl -X PUT https://api.github.com/repos/nothinginfinity/repo-copilot/contents/.gitzip/drop-20260507-120000.zip \
  -H "Authorization: Bearer $PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "gitzip drop: repo-copilot.html update",
    "content": "'$(base64 -w0 drop-20260507-120000.zip)'"
  }'
```

### 4. Watch the workflow

Go to **Actions → gitzip-unpack** to see:
- Validation results (sha256, size checks)
- Files deployed
- Commit SHA of the deployed update
- Cleanup confirmation

## Security

The workflow uses `GITHUB_TOKEN` (no PAT needed for self-deploy). The
`validate-and-unpack.js` script enforces:

| Check | What it blocks |
|---|---|
| No `..` in `dest` | Path traversal |
| No absolute paths | Escape from repo root |
| No `.git/**` writes | Git metadata tampering |
| No `.github/workflows/**` writes | Workflow injection (unless `allow_workflow_writes: true`) |
| SHA-256 verification | File tampering in transit |
| Size verification | Truncated/swapped files |

## What Can Be Deployed

Any file in the repo **except** `.git/**` and `.github/workflows/**`.
Common targets:
- `repo-copilot.html` — the main app
- `dist/*.html` — compiled artifacts
- `docs/*.md` — documentation
- `runtime/context-frame-player.js` — ContextFrames runtime (commit-5)
- `.hcp/capabilities.json` — update capability status as things ship

## The Dogfood Loop

```
  repo-copilot.html (the tool)
       │
       │  generates a .gitzip bundle
       ▼
  .gitzip/drop-*.zip pushed to this repo
       │
       ▼
  gitzip-unpack.yml deploys it
       │
       ▼
  repo-copilot.html (updated ✅)
```

The tool ships itself. This is the proof that the deployment rail works.
