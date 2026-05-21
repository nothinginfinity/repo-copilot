# Claude — Capabilities & Tool Registry
_last-updated: 2026-05-20 | maintained-by: Alice_

---

## Identity

**Claude** is an Anthropic AI assistant operating as a specialist agent on the repo-copilot team. Claude's primary role is **Cloudflare infrastructure operations** — he holds direct MCP access to the full Cloudflare stack via **mcp-prax** (control plane) and **afo-mcp** (database operations). Alice and Bob do not have these capabilities.

Claude communicates with the team via:
- `spaces/claude/inbox.md` — reads tasks routed from Alice
- `spaces/claude/outbox.md` — posts results back to Alice
- Jared's direct conversation — primary interface

---

## MCP Servers

Claude now has **two** MCP servers connected:

| Server | URL | Purpose |
|--------|-----|---------|
| `mcp-prax` | `https://mcp-prax.jaredtechfit.workers.dev/mcp` | Full Cloudflare control plane — Workers, D1, KV, Access |
| `afo-mcp` | `https://afo-mcp.jaredtechfit.workers.dev/mcp` | AFO database operations — D1 queries, migrations, endpoint testing |

Both are protected by Cloudflare Access (Alice-only policy: jaredtechfit@gmail.com).

---

## Tool Registry — `mcp-prax` (Control Plane) — 13 tools

### Worker Management

| Tool | Description | Key Params |
|------|-------------|------------|
| `listWorkers` | List all Workers in the account with last-modified timestamps | none |
| `getWorkerScript` | Read the full source code of any deployed Worker | `script_name` |
| `deployWorker` | Create or update a Worker script — deploys immediately | `script_name`, `script_content` |
| `deleteWorker` | Permanently delete a Worker | `script_name`, `confirm: true` |

### Database & Storage

| Tool | Description | Key Params |
|------|-------------|------------|
| `listD1Databases` | List all D1 databases with IDs | none |
| `createD1Database` | Create a new D1 database | `name` |
| `listKVNamespaces` | List all KV namespaces | none |
| `createKVNamespace` | Create a new KV namespace | `title` |

### Access & Security

| Tool | Description | Key Params |
|------|-------------|------------|
| `listAccessApps` | List all Zero Trust Access applications | none |
| `createAccessApp` | Create a new Access app + attach Alice-only policy automatically | `name`, `domain`, `path` |

### Worker Bindings

| Tool | Description | Key Params |
|------|-------------|------------|
| `listWorkerBindings` | List all bindings (D1, KV, Service, etc.) on a Worker | `script_name` |

### Escape Hatch

| Tool | Description | Key Params |
|------|-------------|------------|
| `cfApiRequest` | Raw Cloudflare API call for anything not covered by other tools | `method`, `path`, `body` |

---

## Tool Registry — `afo-mcp` v2.1.0 (Database Operations)

All tools connect to **afo-v1** and **context-links-db** D1 databases.

### Database Inspection

| Tool | Description | Key Params |
|------|-------------|------------|
| `listTables` | Lists all tables in afo-v1 D1 | none |
| `queryD1` | Run read-only SELECT queries | `sql` (required), `params` (optional array) |
| `getCustomerRows` | Fetch recent rows from `customers` | `limit` (optional, default 10, max 50) |
| `getSnapshotRows` | Fetch recent rows from `visibility_snapshots` | `customerId` (optional UUID), `limit` (optional) |
| `checkWorkerBind` | Verify D1 binding is reachable | none |

### Database Management

| Tool | Description | Key Params |
|------|-------------|------------|
| `applyMigration` | Execute SQL migrations (ALTER TABLE, CREATE INDEX, INSERT, UPDATE) | `sql` (required), `confirm` (required for DROP/DELETE) |

### Network Testing

| Tool | Description | Key Params |
|------|-------------|------------|
| `pingEndpoint` | HTTP GET or POST to any URL | `url` (required), `method`, `body` (JSON), `headers` |

---

## What Claude Can Do (Full Picture)

### Infrastructure (mcp-prax)
- **Read any Worker's source code** — diagnose, audit, fix
- **Deploy Workers** — create or update any Worker by providing JS source
- **Delete Workers** — clean up unused scripts
- **Create D1 databases and KV namespaces** from scratch
- **Create Access applications** with Alice-only policy auto-attached
- **List all account resources** — Workers, D1, KV, Access apps at a glance
- **Raw API calls** — anything Cloudflare's API supports, Claude can do

### Database Operations (afo-mcp)
- **Run D1 migrations** directly against live databases
- **Query live data** — inspect customer rows, snapshots, schema state
- **End-to-end test** Workers by pinging endpoints with real payloads
- **Verify bindings** and env var behavior

### What This Means in Practice
- Claude can be given a goal in plain English and execute the full build cycle: read → audit → fix → deploy → test — without Jared touching the dashboard
- Claude can set up brand new Workers + Access apps + D1 databases entirely by prompt
- The only things Claude still cannot do: GitHub file writes, billing/account settings, purchasing domains

---

## Live Infrastructure (as of 2026-05-20)

| Worker | Status | Notes |
|--------|--------|-------|
| `mcp-prax` | ✅ Live v1.2.0 | Control plane — 13 tools |
| `afo-mcp` | ✅ Live v2.1.0 | AFO DB ops — D1 bindings to afo-v1 + context-links-db |
| `afo-site` | ✅ Live | Landing page — premium design, mobile-first |
| `afo-audit-signup` | ✅ Live | Full backend API — scoring, prompts, GitHub issues, rate limiting |
| `afo-visibility-snapshot` | ✅ Live | Snapshot worker |
| `mcp-builder4` | 🟡 Legacy | Old builder — can be deleted |
| `mcp-builder3` | 🟡 Legacy | Old builder — can be deleted |
| `mcp-builder2` | 🟡 Legacy | Old builder — can be deleted |
| `builder-mcp` | 🟡 Legacy | Old builder — can be deleted |
| `muddy-violet-c44f` | 🟡 Unknown | Status unclear |
| `afo-mcp2` | 🟡 Unknown | Duplicate? |

### D1 Databases
| Database | ID | Purpose |
|----------|----|---------|
| `afo-v1` | ccbd076e-aaa7-42bb-8808-a20bd83569e2 | Main AFO data — customers, snapshots |
| `context-links-db` | 228546e2-992a-4c7f-9248-41d45aafc0f7 | Context Links project |

### Access Applications
| App | Domain | Policy |
|-----|--------|--------|
| mcp-prax | mcp-prax.jaredtechfit.workers.dev/mcp | Alice only |
| mcp-builder4 | mcp-builder4.jaredtechfit.workers.dev | Alice only |
| muddy-violet | muddy-violet-c44f.jaredtechfit.workers.dev | Alice only |
| afo-mcp | afo-mcp.jaredtechfit.workers.dev/mcp | Alice only |

---

## Routing Rules

- **Alice → Claude (infra task):** Write to `spaces/claude/inbox.md` with `status: unread`
- **Alice → Claude (DB task):** Same — Claude checks both mcp-prax and afo-mcp as needed
- **Claude → Alice:** Write to `spaces/claude/outbox.md` with `to: alice`
- **Jared → Claude:** Direct conversation (primary method)
- **Claude → Alice (urgent):** Jared pastes Claude's output into Alice's conversation directly

### When to Route to Claude

Route ANY of these to Claude — he handles all of it now:
- Deploy or update a Worker
- Read a Worker's source code
- Create a new Worker, D1 database, KV namespace, or Access app
- Run D1 queries or migrations
- Test any endpoint end-to-end
- Audit or clean up the account

---

## Current Limitations

- Claude does **not** have GitHub write access — cannot push files to repos (Alice handles this)
- Claude does **not** maintain `brain.json` — Alice owns memory
- Claude's inbox must be checked manually (Jared asks Claude to read it) — no auto-boot trigger yet
- Claude cannot push directly to Alice — Jared acts as relay bridge
- Claude cannot manage Cloudflare billing, DNS zone settings, or domain registration
