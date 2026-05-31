# AFO Tool Rebuild Order v1

**File:** `AFO_TOOL_REBUILD_ORDER_v1.md`  
**Owner:** Jared / AFO  
**Status:** v1 planning spec  
**Created:** 2026-05-31  
**Purpose:** Reorganize the AFO MCP/tool ecosystem from a large mixed toolset into a smaller, safer, plane-based architecture.

---

## 1. Why this rebuild exists

The current AFO tool system has grown quickly and successfully, but many tools now blend multiple responsibilities:

- inventory
- live state reads
- D1 reads/writes
- GitHub reads/writes
- Cloudflare deploys
- Worker binding updates
- source backup
- route/DNS operations
- audit/smoke testing
- gateway routing

This created a recurring failure mode:

```text
A tool needs to inspect or preserve itself before modifying itself.
```

The goal of this rebuild is not to delete the old system immediately. The goal is to extract the useful capabilities, remake them into clean planes, route new work through the new planes, and freeze legacy mixed tools.

Core principle:

```text
Do not endlessly patch mixed-purpose tools.
Extract the capability.
Rebuild it in the correct plane.
Register it.
Route through the new gateway.
Freeze the old path.
```

---

## 2. Target architecture

The target AFO tool architecture is a five-plane workflow plus a thin gateway layer.

```text
READ -> GITHUB STATE -> PLAN / DIFF -> APPLY -> AUDIT -> GATEWAY ROUTE
```

Each plane has a narrow responsibility.

### Plane 1: Inventory / Read Plane

Reads live systems. Does not mutate Cloudflare. May write snapshots to GitHub.

### Plane 2: GitHub State Plane

GitHub is the durable source of truth for snapshots, specs, plans, receipts, and generated source.

### Plane 3: Planning / Diff Plane

Creates explicit, inspectable deployment and patch plans from snapshots and desired state.

### Plane 4: Cloudflare Apply Plane

Writes to Cloudflare only from approved/versioned plans. Does not invent changes from chat memory.

### Plane 5: Audit / Receipt Plane

Verifies the live result and writes receipts to GitHub and/or D1.

### Gateway Layer

Routes tasks to the correct plane. Gateways should not contain hidden domain logic or write behavior.

---

## 3. New MCP build order

Build these new MCPs in order.

```text
01_afo_inventory_read_mcp
02_afo_github_state_mcp
03_afo_plan_diff_mcp
04_afo_cloudflare_apply_mcp
05_afo_audit_receipt_mcp
06_afo_gateway_hub_vnext
```

---

## 4. MCP 01: `afo_inventory_read_mcp`

### Purpose

Read-only Cloudflare/D1/R2/GitHub/tool inventory and snapshot creation.

This is the first tool to build because it unlocks safe state capture for every other plane.

### Hard rules

- No Cloudflare deploys.
- No Cloudflare writes.
- No DNS writes.
- No route writes.
- No destructive D1 operations.
- Secret values must never be returned.
- Plain text and secret bindings must be redacted.
- May write snapshots to GitHub.

### Minimum v0 tools

```text
inventory_read_status
list_workers
get_worker_source
inspect_worker_bindings
get_worker_settings
write_worker_snapshot_to_github
```

### v1 tools

```text
list_worker_routes
list_dns_records
list_d1_databases
query_d1_sql_readonly
list_r2_buckets
list_mcp_endpoints
list_tool_catalog
write_account_snapshot_to_github
write_tool_inventory_snapshot_to_github
```

### Critical tool: `inspect_worker_bindings`

Input:

```json
{
  "script_name": "afo-site-preview-mcp"
}
```

Behavior:

- Fetch current Cloudflare Worker settings/bindings.
- Return binding names and binding types.
- Redact all secret/plain text values.
- Do not deploy.
- Do not mutate.
- Do not delete.

Output shape:

```json
{
  "script_name": "afo-site-preview-mcp",
  "read_only": true,
  "binding_count": 0,
  "binding_names": [],
  "bindings": [
    {
      "name": "DB",
      "type": "d1",
      "id": "redacted-or-safe-id"
    }
  ],
  "has_bindings": {
    "ADMIN_KEY": true,
    "DB": true,
    "ASSISTANT_SYSTEM_PROMPT": true,
    "AFO_ASSISTANT_MODEL": true,
    "AFO_ASSISTANT_PROVIDER": true,
    "SITE_CONTENT": false,
    "CCS_MICRO_SEO_SITE": true
  }
}
```

### First real target

Use this MCP to inspect and snapshot:

```text
afo-site-preview-mcp
```

Required snapshot path:

```text
state/cloudflare/workers/afo-site-preview-mcp/bindings.snapshot.json
```

---

## 5. MCP 02: `afo_github_state_mcp`

### Purpose

Make GitHub the source of truth for tool state, snapshots, plans, generated source, and receipts.

### Hard rules

- This plane can write GitHub.
- This plane should not write Cloudflare.
- This plane should not execute deployment operations.
- All state files should be deterministic and reviewable.

### Tools

```text
state_status
read_state_file
write_state_file
commit_state_bundle
list_state_tree
read_worker_snapshot
write_worker_snapshot
read_deployment_plan
write_deployment_plan
read_audit_receipt
write_audit_receipt
compare_state_versions
```

### Recommended repo structure

```text
state/
  cloudflare/
    account.snapshot.json
    workers/
      <worker-name>/
        source.worker.js
        source.hash.txt
        settings.snapshot.json
        bindings.snapshot.json
        routes.snapshot.json
        health.snapshot.json
  d1/
    databases.snapshot.json
  r2/
    buckets.snapshot.json
  tools/
    mcp-inventory.snapshot.json

plans/
  cloudflare/
    workers/
      <worker-name>/
        deploy.plan.json
        bindings.patch.plan.json
        routes.patch.plan.json
        rollback.plan.json

receipts/
  cloudflare/
    workers/
      <worker-name>/
        <timestamp>.audit.receipt.json
```

---

## 6. MCP 03: `afo_plan_diff_mcp`

### Purpose

Create explicit plans from snapshots and desired changes.

This MCP does not deploy anything.

### Hard rules

- No Cloudflare writes.
- No GitHub writes except saving generated plans through the state layer.
- Plans must include source snapshot references or hashes.
- Plans must describe what is preserved, added, updated, and removed.
- Destructive actions require explicit `confirm_destructive` fields in the plan.

### Tools

```text
plan_status
diff_live_vs_github
make_worker_deploy_plan
make_binding_patch_plan
make_route_patch_plan
make_dns_patch_plan
make_r2_binding_plan
validate_plan
sign_plan_hash
explain_plan_risk
```

### Binding patch plan example

```json
{
  "plan_type": "worker_binding_patch",
  "script_name": "afo-site-preview-mcp",
  "source_snapshot": "state/cloudflare/workers/afo-site-preview-mcp/source.worker.js",
  "bindings_snapshot": "state/cloudflare/workers/afo-site-preview-mcp/bindings.snapshot.json",
  "preserve_existing": true,
  "add_or_update": [
    {
      "name": "SITE_CONTENT",
      "type": "r2_bucket",
      "bucket_name": "afo-site-content"
    },
    {
      "name": "CCS_MICRO_SEO_SITE",
      "type": "r2_bucket",
      "bucket_name": "v1.7-r2-live-knowledge"
    }
  ],
  "remove": [],
  "risk": "medium",
  "requires_confirmation": true
}
```

---

## 7. MCP 04: `afo_cloudflare_apply_mcp`

### Purpose

The only plane that writes to Cloudflare runtime resources.

It applies plans. It does not create plans.

### Hard rules

- Must read a versioned plan.
- Must validate the plan hash before applying.
- Must refuse to deploy from raw chat text.
- Must refuse to update bindings without a binding snapshot or explicit preserve policy.
- Must write a pending receipt or handoff to the audit plane.

### Tools

```text
apply_status
apply_worker_source_plan
apply_worker_binding_plan
apply_worker_route_plan
apply_dns_plan
apply_r2_plan
rollback_worker_from_snapshot
```

### Apply policy

Allowed:

```text
GitHub plan -> validate -> apply -> emit receipt
```

Not allowed:

```text
Chat instruction -> deploy immediately
```

Exception:

```text
Emergency break-glass operation with explicit confirmation and backup path.
```

---

## 8. MCP 05: `afo_audit_receipt_mcp`

### Purpose

Independent verifier for deployments and runtime state.

### Hard rules

- Should be independent from the apply tool.
- Should re-read live Cloudflare state after apply.
- Should verify source hash, bindings, routes, DNS, and health.
- Should write receipts to GitHub and optionally D1.

### Tools

```text
audit_status
verify_worker_source_hash
verify_bindings_match_plan
verify_route_live
verify_dns_record
verify_health_url
verify_mcp_tools
write_audit_receipt
write_smoke_test_receipt
```

### Receipt example

```json
{
  "receipt_type": "worker_binding_patch_audit",
  "script_name": "afo-site-preview-mcp",
  "plan_hash": "sha256:...",
  "status": "passed",
  "verified_at": "2026-05-31T00:00:00Z",
  "checks": {
    "source_hash_preserved": true,
    "bindings_preserved": true,
    "site_content_added": true,
    "ccs_micro_seo_site_updated": true,
    "health_ok": true
  }
}
```

---

## 9. MCP 06: `afo_gateway_hub_vnext`

### Purpose

Thin routing layer over the five planes.

### Hard rules

- No hidden Cloudflare writes.
- No embedded domain logic.
- Route based on plane and risk.
- Write calls must require explicit confirmation.
- Should explain which plane/tool it selected.

### Tools

```text
gateway_status
list_planes
recommend_plane_for_task
route_read_call
route_state_call
route_plan_call
route_apply_call
route_audit_call
run_full_workflow
```

---

## 10. Legacy handling policy

### Keep as infrastructure

Keep these as useful foundations while rebuilding:

```text
Toolsmith Admin v02
Tool Index
Belt Generator
Belt Recommender
GitHub MCP
GitZip Push MCP
Cloudflare Multipart MCP
Cloudflare Auditor MCP
AFO MCP Browser / Inventory
AFO Admin Gateway
AFO Infra Gateway
```

### Remake into new clean MCPs

Remake these capability groups instead of patching old mixed tools:

```text
Cloudflare read tools
D1 read/query tools
R2 read/list tools
Worker source inspectors
Worker binding inspectors
Deployment plan makers
Binding patch tools
Route/DNS patch tools
Audit/receipt tools
Gateway routers
```

### Freeze or retire

Mark legacy tools as `legacy_frozen` when they are replaced.

Freeze candidates:

```text
Old one-off stage tools
Duplicate domain tools
Mixed read/write tools
Tools that both inspect and deploy
Tools that write without a GitHub plan
Tools with unclear ownership or unclear risk profile
```

Do not delete immediately. Stop routing new work through them.

---

## 11. Self-modifying tool rule

A tool should almost never modify itself directly.

Preferred rule:

```text
Tool A may deploy Tool B.
Tool B may deploy Tool C.
Tool C may inspect Tool A.
But Tool A should not deploy Tool A unless there is an external recovery path.
```

For the current system:

```text
cloudflare-multipart-mcp should not be the only tool able to redeploy cloudflare-multipart-mcp.
```

Recommended fallback paths:

```text
cloudflare-deploy-backup-mcp
GitHub Action / Wrangler deploy
Cloudflare dashboard manual fallback
secondary deployer Worker
```

---

## 12. First migration workflow

Use the new architecture to fix the original `afo-site-preview-mcp` binding problem.

### Desired binding changes

```text
SITE_CONTENT -> afo-site-content
CCS_MICRO_SEO_SITE -> v1.7-r2-live-knowledge
```

### Required preservation targets

```text
ADMIN_KEY
DB
ASSISTANT_SYSTEM_PROMPT
AFO_ASSISTANT_MODEL
AFO_ASSISTANT_PROVIDER
```

### Workflow

```text
1. afo_inventory_read_mcp inspects live Worker source/settings/bindings.
2. afo_inventory_read_mcp writes snapshots to GitHub.
3. afo_plan_diff_mcp creates a binding patch plan.
4. Human/agent reviews plan.
5. afo_cloudflare_apply_mcp applies plan.
6. afo_audit_receipt_mcp verifies bindings and health.
7. Receipt is written to GitHub.
```

---

## 13. Snapshot schemas

### `bindings.snapshot.json`

```json
{
  "schema": "afo.bindings.snapshot.v1",
  "script_name": "example-worker",
  "captured_at": "2026-05-31T00:00:00Z",
  "read_only": true,
  "binding_count": 0,
  "bindings": [],
  "binding_names": []
}
```

### `worker.snapshot.json`

```json
{
  "schema": "afo.worker.snapshot.v1",
  "script_name": "example-worker",
  "captured_at": "2026-05-31T00:00:00Z",
  "source_path": "source.worker.js",
  "source_sha256": "sha256:...",
  "settings_path": "settings.snapshot.json",
  "bindings_path": "bindings.snapshot.json",
  "routes_path": "routes.snapshot.json"
}
```

### `deployment.plan.json`

```json
{
  "schema": "afo.deployment.plan.v1",
  "plan_id": "plan_...",
  "created_at": "2026-05-31T00:00:00Z",
  "plan_type": "worker_binding_patch",
  "script_name": "example-worker",
  "inputs": {
    "worker_snapshot": "state/cloudflare/workers/example-worker/worker.snapshot.json"
  },
  "operations": [],
  "risk": "medium",
  "requires_confirmation": true,
  "plan_hash": "sha256:..."
}
```

### `audit.receipt.json`

```json
{
  "schema": "afo.audit.receipt.v1",
  "receipt_id": "receipt_...",
  "created_at": "2026-05-31T00:00:00Z",
  "plan_id": "plan_...",
  "script_name": "example-worker",
  "status": "passed",
  "checks": {}
}
```

---

## 14. Tool registration rules

Every new tool should be registered with Toolsmith using these fields:

```text
name
worker_name
plane
risk_profile
allowed_writes
requires_confirmation
source_repo
source_path
owner
status
replacement_for
legacy_status
```

Risk profiles:

```text
safe_read
safe_github_write
plan_only
cloudflare_write_gated
destructive_gated
legacy_frozen
```

---

## 15. Build priorities

### Priority 1

```text
afo_inventory_read_mcp
```

Minimum required tools:

```text
inventory_read_status
list_workers
get_worker_source
inspect_worker_bindings
get_worker_settings
write_worker_snapshot_to_github
```

### Priority 2

```text
afo_github_state_mcp
```

Minimum required tools:

```text
state_status
read_state_file
write_state_file
commit_state_bundle
```

### Priority 3

```text
afo_plan_diff_mcp
```

Minimum required tools:

```text
plan_status
make_binding_patch_plan
validate_plan
sign_plan_hash
```

### Priority 4

```text
afo_cloudflare_apply_mcp
```

Minimum required tools:

```text
apply_status
apply_worker_binding_plan
rollback_worker_from_snapshot
```

### Priority 5

```text
afo_audit_receipt_mcp
```

Minimum required tools:

```text
audit_status
verify_bindings_match_plan
verify_health_url
write_audit_receipt
```

---

## 16. Operating doctrine

1. Remake clean tools faster than patching legacy tools.
2. GitHub is source of truth.
3. Cloudflare is runtime.
4. D1 is index/cache/receipt layer, not the only source of truth.
5. Read tools can write snapshots to GitHub.
6. Plan tools can write plans to GitHub.
7. Apply tools can write to Cloudflare only from plans.
8. Audit tools verify independently.
9. Gateways route; they do not hide domain logic.
10. Legacy tools are references, not permanent foundations.

---

## 17. Immediate next actions

```text
1. Build afo_inventory_read_mcp v0.
2. Add inspect_worker_bindings.
3. Snapshot afo-site-preview-mcp.
4. Create binding patch plan for SITE_CONTENT and CCS_MICRO_SEO_SITE.
5. Apply through the new apply plane or current cf-multipart only after snapshot preservation is proven.
6. Record audit receipt.
7. Mark old mixed paths as legacy_frozen once replaced.
```

---

## 18. Definition of done for v1 migration

The rebuild plan is considered successful when:

```text
- afo_inventory_read_mcp can snapshot a Worker source/settings/bindings.
- snapshots are committed to GitHub.
- afo_plan_diff_mcp can generate a binding patch plan.
- afo_cloudflare_apply_mcp can apply that plan.
- afo_audit_receipt_mcp can verify the result.
- afo_gateway_hub_vnext can route the full workflow.
- old mixed tools are marked legacy_frozen.
```

---

## 19. Notes

This spec favors rebuilding small, clean MCPs over patching old multi-purpose tools. The current 100+ Worker/tool ecosystem should be treated as an inventory and reference library. The target system should have fewer tools, clearer ownership, stronger routing, and safer deployment boundaries.
