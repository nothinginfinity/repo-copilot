# Claude — Capabilities & Tool Registry
_last-updated: 2026-05-18 | maintained-by: Alice_

---

## Identity

**Claude** is an Anthropic AI assistant operating as a specialist agent on the repo-copilot team. Claude's primary role is **Cloudflare infrastructure operations** — he holds direct MCP access to the AFO Cloudflare stack that Alice and Bob do not have.

Claude communicates with the team via:
- `spaces/claude/inbox.md` — reads tasks routed from Alice
- `spaces/claude/outbox.md` — posts results back to Alice
- Jared's direct conversation — primary interface

---

## MCP Tool Registry — `afo-mcp` server

All 7 tools connect to the **afo-v1 D1 database** on Cloudflare Workers.

### Database Inspection

| Tool | Description | Key Params |
|------|-------------|------------|
| `afo-mcp:listTables` | Lists all tables in afo-v1 D1 | none |
| `afo-mcp:queryD1` | Run read-only SELECT queries | `sql` (required), `params` (optional array) |
| `afo-mcp:getCustomerRows` | Fetch recent rows from `customers` | `limit` (optional, default 10, max 50) |
| `afo-mcp:getSnapshotRows` | Fetch recent rows from `visibility_snapshots` | `customerId` (optional UUID), `limit` (optional) |
| `afo-mcp:checkWorkerBind` | Verify D1 binding is reachable | none |

### Database Management

| Tool | Description | Key Params |
|------|-------------|------------|
| `afo-mcp:applyMigration` | Execute SQL migrations (ALTER TABLE, CREATE INDEX, INSERT, UPDATE) | `sql` (required), `confirm` (required for DROP/DELETE) |

### Network Testing

| Tool | Description | Key Params |
|------|-------------|------------|
| `afo-mcp:pingEndpoint` | HTTP GET or POST to any URL | `url` (required), `method`, `body` (JSON), `headers` |

---

## What Claude Can Do That Others Can't

- **Run D1 migrations** directly against the live database without Jared's manual intervention
- **Query live data** — inspect actual customer rows, snapshot rows, schema state
- **End-to-end test** the AFO Worker by pinging `/api/visibility-snapshot` with real payloads
- **Verify env vars indirectly** by observing Worker behavior via `pingEndpoint`
- **Confirm Worker binding** status with `checkWorkerBind`

Alice and Bob **cannot** do any of the above — they only have GitHub (Alice) and external research (Bob) access. Claude is the team's only agent with live Cloudflare visibility.

---

## Routing Rules

- **Alice → Claude:** Write to `spaces/claude/inbox.md` with `status: unread`
- **Claude → Alice:** Write to `spaces/claude/outbox.md` with `to: alice`
- **Jared → Claude:** Direct conversation; Claude can also be asked to check `spaces/claude/inbox.md`
- **Claude → Alice (urgent):** Jared pastes Claude's output into Alice's conversation directly (current bridge method)

---

## Current Limitations

- Claude does **not** have GitHub write access — cannot push files to repos
- Claude does **not** have access to `spaces/gists/brain.json` natively — Alice maintains memory
- Claude's inbox must be checked manually (Jared asks Claude to read it); there is no auto-boot trigger yet
- Claude cannot send messages to Alice directly — Jared acts as the relay bridge
