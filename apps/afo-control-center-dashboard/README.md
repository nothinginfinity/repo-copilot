# AFO Control Center Dashboard

Polished standalone human UI for the AFO control surface at `control.agentfeedoptimization.com`.

## Goal

Give Jared and future users a simple dashboard to see what the AFO runtime already knows:

- Worker inventory
- MCP apps
- Tool catalog
- D1 databases
- Endpoint map
- Queue/audit/repair surfaces
- Raw JSON fallback for agents and debugging

This is intentionally **GitHub-first**. Cloudflare is the runtime, but the UI source should live in GitHub so it can be reviewed, versioned, rolled back, and eventually split into a dedicated `afo-control-center` repo.

## Current status

This scaffold is a single-file HTML dashboard that can be served by an existing Cloudflare Worker route or dropped into a Worker static response. It calls the existing AFO Browser / Control Center APIs when available.

## Suggested deployment model

```text
control.agentfeedoptimization.com/
  Human dashboard

control.agentfeedoptimization.com/api/status
  JSON status

control.agentfeedoptimization.com/api/workers
  Worker inventory

control.agentfeedoptimization.com/api/mcp-apps
  MCP app inventory

control.agentfeedoptimization.com/api/tools
  Tool catalog

control.agentfeedoptimization.com/api/d1
  D1 databases

control.agentfeedoptimization.com/api/endpoints
  Endpoint map

control.agentfeedoptimization.com/api/queue
  Runtime queue status

control.agentfeedoptimization.com/api/audits
  Audit events/results

control.agentfeedoptimization.com/api/repairs
  Repair jobs/results
```

## Product order

1. Control Center Dashboard — visibility first.
2. UI Belt Composer — invocation second.
3. Unified AFO Shell — combined app after the primitives are proven.

## Next patch

Wire the API routes to the live Worker tools:

- `inventory_status`
- `inventory_cloudflare_workers`
- `inventory_mcp_apps`
- `inventory_tool_catalog`
- `inventory_d1_databases`
- `inventory_endpoint_map`
- queue/audit/repair endpoints when present
