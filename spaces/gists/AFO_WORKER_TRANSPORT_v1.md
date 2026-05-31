# AFO Worker Transport v1

**File:** `AFO_WORKER_TRANSPORT_v1.md`  
**Status:** v1 planning spec  
**Created:** 2026-05-31  
**Purpose:** Define a GitHub-to-Cloudflare transport layer for deploying AFO Workers/MCPs from versioned GitHub source without mixing read, plan, deploy, and audit responsibilities.

---

## 1. Problem

AFO Workers/MCPs are now being rebuilt GitHub-first, but GitHub source alone does not make the Worker live in Cloudflare.

The system needs a reliable transport layer that can:

```text
GitHub Worker source/spec -> validate -> deploy to Cloudflare -> verify -> write receipt
```

This avoids ad hoc manual deploys and avoids self-modifying tool problems.

---

## 2. Recommended model

Create a dedicated Cloudflare-only MCP:

```text
afo_worker_transport_mcp
```

Role:

```text
Move Worker apps from GitHub to Cloudflare properly.
```

It should act like GitZip, but in the opposite direction:

```text
GitZip: local/generated files -> GitHub
Worker Transport: GitHub files/specs -> Cloudflare Workers
```

---

## 3. Position in clean-plane architecture

Worker Transport belongs between GitHub State and Cloudflare Apply.

```text
GitHub State Plane -> Worker Transport -> Cloudflare Runtime -> Audit Receipt Plane
```

It can also be treated as a subcomponent of:

```text
afo_cloudflare_apply_mcp
```

But the cleaner first build is a standalone tool:

```text
afo_worker_transport_mcp
```

---

## 4. Why not only GitHub Actions?

GitHub Actions is a good option for fully automated CI/CD, but AFO also needs agent-callable deployment control from MCP workflows.

Preferred architecture:

```text
GitHub Actions = optional automation path
AFO Worker Transport MCP = agent-callable controlled deploy path
```

Both should use the same source files and deployment specs.

---

## 5. Required bindings/secrets

```text
GITHUB_TOKEN
CF_ACCOUNT_ID
CF_API_TOKEN
DEFAULT_OWNER
```

Optional:

```text
DEFAULT_REPO = repo-copilot
DEFAULT_BRANCH = main
RECEIPTS_BASE_PATH = receipts/cloudflare/workers
```

---

## 6. GitHub folder contract

Worker source folders should follow this structure:

```text
apps/<worker_slug>/
  worker.js
  mcp.manifest.json
  wrangler.example.toml
  README.md
```

Example:

```text
apps/afo_inventory_read_mcp/
  worker.js
  mcp.manifest.json
  wrangler.example.toml
  README.md
```

---

## 7. Deployment spec contract

Each deployable Worker should have or generate a deployment spec:

```text
apps/<worker_slug>/deploy.spec.json
```

Example:

```json
{
  "schema": "afo.worker.deploy.spec.v1",
  "worker_slug": "afo_inventory_read_mcp",
  "script_name": "afo-inventory-read-mcp",
  "source_path": "apps/afo_inventory_read_mcp/worker.js",
  "manifest_path": "apps/afo_inventory_read_mcp/mcp.manifest.json",
  "compatibility_date": "2026-05-31",
  "bindings": {
    "vars": {
      "DEFAULT_OWNER": "nothinginfinity"
    },
    "secrets_required": [
      "CF_ACCOUNT_ID",
      "CF_API_TOKEN",
      "GITHUB_TOKEN"
    ]
  },
  "routes": [],
  "custom_domains": [],
  "risk": "cloudflare_write_gated",
  "requires_confirmation": true
}
```

---

## 8. Tool list for `afo_worker_transport_mcp`

Minimum v0 tools:

```text
worker_transport_status
read_github_worker_app
validate_worker_app
create_deploy_spec_from_app
deploy_worker_from_github
write_transport_receipt
```

v1 tools:

```text
list_github_worker_apps
sync_worker_app_to_cloudflare
sync_all_changed_worker_apps
compare_github_to_cloudflare_source
verify_worker_after_transport
rollback_worker_from_github_snapshot
```

---

## 9. Tool contracts

### `worker_transport_status`

Returns status, bindings, defaults, and available tools.

### `read_github_worker_app`

Input:

```json
{
  "owner": "nothinginfinity",
  "repo": "repo-copilot",
  "branch": "main",
  "worker_slug": "afo_inventory_read_mcp"
}
```

Reads:

```text
apps/<worker_slug>/worker.js
apps/<worker_slug>/mcp.manifest.json
apps/<worker_slug>/wrangler.example.toml
apps/<worker_slug>/README.md
```

### `validate_worker_app`

Checks:

```text
worker.js exists
worker.js exports default fetch handler
mcp.manifest.json exists
manifest name matches worker folder
manifest has tools list
source is not empty
source size is reasonable
```

### `create_deploy_spec_from_app`

Generates a deploy spec from manifest and Wrangler example.

Does not deploy.

### `deploy_worker_from_github`

Input:

```json
{
  "owner": "nothinginfinity",
  "repo": "repo-copilot",
  "branch": "main",
  "worker_slug": "afo_inventory_read_mcp",
  "script_name": "afo-inventory-read-mcp",
  "confirm_deploy": true
}
```

Behavior:

```text
1. Read GitHub app source.
2. Validate source and manifest.
3. Build Cloudflare multipart payload.
4. Deploy Worker source to Cloudflare.
5. Include only non-secret vars from deploy spec.
6. Never fabricate secret values.
7. Return deployment result.
8. Write receipt if configured.
```

### `write_transport_receipt`

Writes deployment receipt to GitHub:

```text
receipts/cloudflare/workers/<script_name>/<timestamp>.transport.receipt.json
```

---

## 10. Secret handling policy

The transport tool must never attempt to read secret values from Cloudflare or GitHub.

Secret policy:

```text
- Required secrets are listed in deploy.spec.json.
- Secret presence can be checked after deployment if Cloudflare API exposes safe metadata.
- Secret values are never returned.
- A deployment may proceed only if the target Worker already has required secrets or if the deployment path preserves existing secrets.
```

For v0, prefer deploying Workers whose secrets can be manually set after first deploy.

For v1, add:

```text
inspect_target_worker_secrets_presence
require_existing_secret_presence
```

---

## 11. Source preservation policy

Before deploying over an existing Worker, Worker Transport should:

```text
1. Fetch current live Worker source if possible.
2. Write backup to GitHub under state/cloudflare/workers/<script_name>/pre_transport_source.worker.js.
3. Write current settings/bindings snapshot if an inspector is available.
4. Deploy only after backup succeeds or confirm_no_backup=true is passed.
```

---

## 12. First Worker to transport

First target:

```text
afo_inventory_read_mcp
```

GitHub source:

```text
apps/afo_inventory_read_mcp/worker.js
```

Cloudflare script name:

```text
afo-inventory-read-mcp
```

Required bindings:

```text
CF_ACCOUNT_ID
CF_API_TOKEN
GITHUB_TOKEN optional but useful
DEFAULT_OWNER = nothinginfinity
```

First test after deploy:

```json
{
  "script_name": "afo-site-preview-mcp"
}
```

Tool:

```text
inspect_worker_bindings
```

---

## 13. GitHub Actions option

A GitHub Actions workflow can also deploy Workers when files change.

Suggested path:

```text
.github/workflows/deploy-afo-worker.yml
```

Trigger options:

```text
workflow_dispatch
push paths: apps/**/worker.js, apps/**/mcp.manifest.json, apps/**/deploy.spec.json
```

However, GitHub Actions should deploy using the same deploy spec contract, not a separate hidden process.

Recommended split:

```text
Manual / agent-controlled deployment: afo_worker_transport_mcp
CI deployment: GitHub Actions wrapper around the same deploy.spec.json
```

---

## 14. Relationship to cf-multipart

`cf-multipart` is still useful as the low-level Cloudflare deploy primitive.

Worker Transport should either:

```text
A. call cf-multipart as a backend, or
B. embed the same multipart deploy logic directly
```

Preferred v0:

```text
embed minimal multipart deploy logic directly
```

Reason:

```text
Worker Transport should be independently recoverable if cf-multipart needs repair.
```

---

## 15. Definition of done

Worker Transport v0 is done when:

```text
- It can read apps/afo_inventory_read_mcp/worker.js from GitHub.
- It can validate the manifest.
- It can deploy to Cloudflare as afo-inventory-read-mcp.
- It can write a transport receipt to GitHub.
- The deployed Worker responds to GET status.
- The deployed Worker exposes tools/list.
```

---

## 16. Immediate next build

Create:

```text
apps/afo_worker_transport_mcp/
  worker.js
  mcp.manifest.json
  README.md
  wrangler.example.toml
```

Then deploy it manually or through existing cf-multipart.

Once live, use it to deploy the six clean-plane MCPs from GitHub to Cloudflare.
