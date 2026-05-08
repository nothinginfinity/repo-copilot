# Gist Ops — GitHub Actions-as-MCP for Gist Management

> **iPhone-native.** No local runtime required. Everything runs on GitHub Actions.

---

## How It Works

1. Agent writes a command to `queue.json` (one `create_or_update_file` call)
2. GitHub Actions triggers automatically on push to that file
3. Actions calls the GitHub Gists API using `GIST_TOKEN` secret
4. Actions writes the result back to `result.json` (committed automatically)
5. Agent reads `result.json` to get the `gist_id` and `raw_url`
6. Agent updates `spaces/gists.md` registry with the real URL

**Total agent tool calls: 3** (write queue → wait ~30s → read result). Fits G-001 budget.

---

## Setup (one-time)

Create a GitHub PAT with **`gist` scope only**, then add it as a repo secret:

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained
2. Set scope: `gist` only (no repo access needed)
3. Copy the token
4. This repo → Settings → Secrets and variables → Actions → New secret
5. Name: `GIST_TOKEN` — paste token → Save

---

## Operations

### `create_gist`
```json
{
  "op": "create_gist",
  "description": "G-001 Build & Push Constraints",
  "public": false,
  "files": {
    "G-001-constraints.md": {
      "content": "# G-001 ...full content here..."
    }
  },
  "requested_by": "bob/c2/jared",
  "timestamp": "2026-05-08T13:00:00Z"
}
```

### `update_gist`
```json
{
  "op": "update_gist",
  "gist_id": "abc123def456",
  "description": "Updated description (optional)",
  "files": {
    "G-001-constraints.md": {
      "content": "# G-001 ...updated content..."
    }
  },
  "requested_by": "bob/c2/jared",
  "timestamp": "2026-05-08T14:00:00Z"
}
```

### `get_gist`
```json
{
  "op": "get_gist",
  "gist_id": "abc123def456",
  "requested_by": "bob/c2/jared",
  "timestamp": "2026-05-08T14:00:00Z"
}
```

### `list_gists`
```json
{
  "op": "list_gists",
  "requested_by": "bob/c2/jared",
  "timestamp": "2026-05-08T14:00:00Z"
}
```

---

## Result Shape

After Actions runs, `result.json` will contain:

```json
{
  "op": "create_gist",
  "status": "success",
  "gist_id": "abc123def456",
  "raw_url": "https://gist.githubusercontent.com/nothinginfinity/abc123.../raw/filename",
  "html_url": "https://gist.github.com/nothinginfinity/abc123def456",
  "all_files": {
    "G-001-constraints.md": "https://gist.githubusercontent.com/..."
  },
  "requested_by": "bob/c2/jared",
  "completed_at": "2026-05-08T13:00:47Z"
}
```

---

## Files

| File | Role |
|------|------|
| `.github/workflows/gist-ops.yml` | The Actions workflow — do not edit manually |
| `spaces/gist-ops/queue.json` | **Agent writes here** to trigger an operation |
| `spaces/gist-ops/result.json` | **Agent reads here** after ~30s to get the result |
| `spaces/gist-ops/README.md` | This file |

---

## Notes

- The `[skip ci]` tag on result commits prevents infinite workflow loops
- Secret gists (`"public": false`) are unlisted — accessible to anyone with the URL
- `raw_url` from `create_gist` may rotate after edits; use `get_gist` to refresh
- The workflow only triggers on pushes to `queue.json` — not on any other file
