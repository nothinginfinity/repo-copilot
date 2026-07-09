# AFO Cloudflare API MCP Roadmap

This folder tracks deferred ideas and future update candidates for the AFO Cloudflare API MCP. These notes are intentionally non-active unless promoted by a later handoff or explicit implementation task.

## Current priority

Keep hardening the current schema-clean read-only verifier surface and prove the subagent MCP system works in practice before opening larger infrastructure builds.

Active focus:

- maintain the v0.7.11 outputSchema-complete, annotation-clean, narrow-tool-first surface;
- continue fresh-chat/mobile App-MCP verification;
- keep admin/write/deploy/D1 mutation capability out of the default visible surface;
- validate the subagent MCP workflow before starting new infrastructure tracks.

## Future update candidate: MCP Twin v2

Status: parked / not active.

MCP Twin v2 is a possible future independent app/MCP, not a near-term patch to the current Cloudflare API MCP.

Concept:

```text
mcp-twin v2 = stable ChatGPT gateway + D1/R2 live catalog + listChanged notification + A/B runtime swap + CairnStone receipts
```

The goal would be to reduce or avoid manual app/MCP refreshes by keeping the model-visible top-level tool surface stable while allowing an internal signed/versioned tool catalog to update dynamically.

Possible architecture:

```text
ChatGPT or other MCP host
  ↓
Stable MCP Twin Gateway
  ↓
D1/R2 live catalog
  ↓
A/B runtime registry
  ↓
CairnStone receipts
```

Suggested visible tools would stay small and stable:

```text
mcp_twin_status
mcp_twin_catalog
mcp_twin_describe_tool
mcp_twin_call_readonly
mcp_twin_preflight
mcp_twin_receipts
```

Admin/dev-only tools, if ever built, would remain separate or explicitly gated:

```text
mcp_twin_stage_update
mcp_twin_promote_epoch
mcp_twin_rollback_epoch
mcp_twin_emit_list_changed
mcp_twin_write_cairnstone_receipt
```

Design notes:

- Use the v0.7.11 descriptor discipline from the start: outputSchema on every visible tool, read-only annotations where applicable, narrow-tool-first ordering, and clear non-action receipts.
- Treat top-level MCP tool names as a stable ABI. Avoid frequent visible tool additions/removals.
- Move fast-changing capability changes into the live internal catalog instead of forcing the host to rediscover brand-new top-level tools.
- Support the MCP `tools.listChanged` capability and `notifications/tools/list_changed` where the host honors it, but do not depend on that alone.
- Use the existing `mcp-twin` repo for A/B runtime ideas and `qastone-mcp-twin` for stone-as-update / replayable receipt ideas, but do not clone either directly as the production base.

Why parked:

This is useful but potentially distracting infrastructure. It should wait until the current Cloudflare API MCP and subagent MCP system are proven stable.

Do not begin implementation until:

1. the current v0.7.11+ Cloudflare API MCP remains clean in fresh sessions after multiple refresh cycles;
2. parameterized read-only tools remain unblocked and receipt-backed;
3. the subagent MCP system is working prospectively in normal workflows;
4. a later roadmap/handoff explicitly promotes MCP Twin v2 from parked candidate to active build.
