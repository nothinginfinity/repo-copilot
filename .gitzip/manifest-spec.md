# .gitzip Bundle Manifest Spec
_rev 2025-05-07_

A `.gitzip` bundle is a single UTF-8 JSON file. It contains a `manifest` metadata block and a `files` map.

## Top-level shape

```json
{
  "manifest": { ... },
  "files": { "relative/path/to/file.html": { ... } }
}
```

---

## `manifest` fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Human name of the artifact (e.g. `"repo-copilot"`) |
| `version` | string | ✓ | SemVer string (e.g. `"1.2.0"`) |
| `created` | string | ✓ | ISO-8601 UTC timestamp |
| `source` | string | | Origin repo, e.g. `"nothinginfinity/repo-copilot"` |
| `source_sha` | string | | Git SHA the bundle was produced from |
| `description` | string | | One-line description |
| `allow_workflows` | boolean | | If `true`, `.github/workflows/` paths are permitted (default `false`) |
| `hcp_role` | string | | HCP semantic role: `"app"`, `"tool"`, `"artifact"`, `"context-frame"` |

---

## `files` map

Each key is the **destination path** — always relative, never starting with `/` or `../`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | ✓ | Base64-encoded file content |
| `sha256` | string | | Hex SHA-256 of the decoded bytes. Verified before write. |
| `size` | number | | Byte length of decoded content (informational) |
| `encoding` | string | | `"base64"` (default and only supported value) |

---

## Path safety rules (enforced by gitzip-unpack.yml)

1. **No absolute paths** — destination must be a relative path.
2. **No path traversal** — normalized path must not start with `..`.
3. **No `.git/` writes** — always blocked.
4. **No `.github/workflows/` writes** — blocked unless `manifest.allow_workflows: true` AND `ALLOW_WORKFLOWS=true` env var is set in the workflow.
5. **Per-file max size**: 5 MB.
6. **Bundle max size**: 20 MB total decoded bytes.

---

## Minimal example

```json
{
  "manifest": {
    "name": "repo-copilot",
    "version": "0.9.1",
    "created": "2026-05-07T14:00:00Z",
    "source": "nothinginfinity/repo-copilot",
    "hcp_role": "app"
  },
  "files": {
    "repo-copilot.html": {
      "content": "<base64 of the html file>",
      "sha256": "<hex sha256>",
      "size": 63210
    }
  }
}
```

---

## Self-deploy flow (repo-copilot → itself)

1. User edits `repo-copilot.html` in the app.
2. App's **Push Self** button encodes the HTML to base64, computes SHA-256, builds a `.gitzip` JSON bundle, and pushes it to `dist/repo-copilot.gitzip` via the GitHub Contents API.
3. The `gitzip-unpack.yml` workflow fires on that push.
4. Workflow validates path safety + SHA-256 integrity, then writes `repo-copilot.html` to the repo root.
5. Commit message: `gitzip-unpack: deploy from repo-copilot.gitzip [skip ci]`.

This closes the loop: the app ships itself through its own hardened protocol.
