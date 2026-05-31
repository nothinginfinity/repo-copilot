# AFO Clean-Plane MCP Apps

Generated from `spaces/gists/AFO_TOOL_REBUILD_ORDER_v1.md`.

## Build order

1. `afo_inventory_read_mcp`
2. `afo_github_state_mcp`
3. `afo_plan_diff_mcp`
4. `afo_cloudflare_apply_mcp`
5. `afo_audit_receipt_mcp`
6. `afo_gateway_hub_vnext`

## Operating loop

```text
READ -> GITHUB STATE -> PLAN / DIFF -> APPLY -> AUDIT -> GATEWAY ROUTE
```

Each app is intentionally small and single-plane. Legacy mixed tools should be treated as references, then frozen once the new plane has replacement coverage.
