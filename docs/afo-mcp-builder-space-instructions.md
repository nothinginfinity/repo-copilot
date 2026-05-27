# AFO MCP Builder Space Instructions

Use this document as the operating guide for a dedicated MCP builder project/space. The goal of this space is to turn ideas into working Cloudflare Worker MCP tools using the same AFO build pattern we have been using with ChatGPT, Claude, Alice, Toolsmith, GitZip, Cloudflare Multipart, D1 Admin, and Message OS.

## Mission

Build small, composable MCP tools that can be deployed, connected, tested, indexed, and reused by agents.

The preferred path is:

```txt
idea / product need
→ narrow MCP spec
→ standalone Cloudflare Worker MCP
→ health endpoint
→ MCP tools/list + tools/call support
→ deploy with Cloudflare Multipart
→ add custom domain
→ connect to ChatGPT / Claude / Toolsmith
→ smoke test
→ GitZip materialize source/docs/tests
→ register/index/handoff via Message OS
```

## Core Doctrine

### 1. Build small tools first

Do not build giant tools first. Split large systems into narrow MCPs.

Good examples:

```txt
afo-docparse-result-normalizer-mcp
afo-signup-router-mcp
afo-d1-admin-mcp
afo-gitzip-push-mcp
afo-parse-to-repo-mcp
afo-repo-composer-mcp
```

Each tool should have one clear job. Compose them later through Toolsmith Gateway or a router/orchestrator.

### 2. Prefer standalone Workers

Build MCPs as standalone Cloudflare Workers unless there is a strong reason to generate them from a belt/template system.

A standalone Worker is easier to:

```txt
debug
deploy
connect
patch
split
replace
```

### 3. Every MCP must have a health endpoint

Every Worker must expose:

```txt
GET /health
```

The health response should include:

```json
{
  "status": "ok",
  "worker": "worker-name",
  "version": "0.1.0",
  "bindings": {}
}
```

If bindings exist, show boolean presence only. Never expose secret values.

Example:

```json
{
  "bindings": {
    "DB": true,
    "GITHUB_TOKEN": true,
    "CF_API_TOKEN": true
  }
}
```

### 4. Every MCP must implement the basic JSON-RPC MCP surface

Required endpoint:

```txt
POST /mcp
```

Required methods:

```txt
initialize
notifications/initialized
tools/list
tools/call
```

Use JSON-RPC response shape:

```json
{
  "jsonrpc": "2.0",
  "id": "...",
  "result": {}
}
```

For tool call text output, return:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{...json string...}"
    }
  ]
}
```

### 5. Always include CORS

Use permissive CORS for internal AFO tools unless a tool is explicitly security hardened.

Minimum:

```js
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};
```

Handle `OPTIONS` with 204.

### 6. Use versioned names and predictable domains

Worker name:

```txt
afo-<domain>-<purpose>-mcp
```

Examples:

```txt
afo-d1-admin-mcp
afo-gitzip-push-mcp
afo-parse-to-repo-mcp
```

Domain:

```txt
https://<worker-name>.agentfeedoptimization.com
```

MCP URL:

```txt
https://<worker-name>.agentfeedoptimization.com/mcp
```

Health URL:

```txt
https://<worker-name>.agentfeedoptimization.com/health
```

### 7. Deploy first, then bind domains/secrets, then test

Build sequence:

```txt
1. Deploy Worker with Cloudflare Multipart.
2. Add custom domain.
3. Add secrets/vars/bindings in Cloudflare if needed.
4. Test /health.
5. Connect MCP to ChatGPT/Claude.
6. Run tools/list or status tool.
7. Run one safe smoke test.
8. Patch as needed.
```

### 8. Use D1 Admin for new databases

When a new tool needs its own D1 database, use:

```txt
afo-d1-admin-mcp
```

Tool:

```txt
create_d1_database
```

Then bind the returned database UUID to the Worker using Cloudflare Multipart.

### 9. Use GitZip to materialize source and artifacts

When a tool becomes important, materialize it into GitHub using:

```txt
afo-gitzip-push-mcp
```

This creates a durable source artifact:

```txt
README.md
src/index.ts
wrangler.toml
smoke-tests.json
CHANGELOG.md
MCP_SCHEMA.json
```

GitZip turns generated code or parsed results into real repo files. This is called repo materialization.

### 10. Use Repo Composer for runnable packages

For parsed data or generated artifacts that should become a website, Worker, API, prompt library, or D1 app, use:

```txt
afo-repo-composer-mcp
```

Core repo composer tools:

```txt
compose_static_blog
compose_worker_site
compose_content_api
compose_prompt_library
compose_agent_feed_site
compose_d1_index_app
compose_full_site
compose_existing_site_patch
```

## Standard Worker MCP Skeleton

Use this pattern for most small MCP Workers:

```js
const NAME = 'afo-example-mcp';
const VERSION = '0.1.0';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const R = (x, status = 200) => Response.json(x, {
  status,
  headers: { ...CORS, 'cache-control': 'no-store' }
});

const tools = [
  {
    name: 'example_status',
    description: 'Show example MCP status.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  }
];

function ok(id, result) {
  return R({ jsonrpc: '2.0', id, result });
}

function txt(id, x) {
  return R({
    jsonrpc: '2.0',
    id,
    result: {
      content: [
        { type: 'text', text: JSON.stringify(x, null, 2) }
      ]
    }
  });
}

function er(id, e) {
  return R({
    jsonrpc: '2.0',
    id,
    error: { code: -32603, message: String(e.message || e) }
  });
}

async function call(env, name, args) {
  if (name === 'example_status') {
    return {
      status: 'ok',
      worker: NAME,
      version: VERSION,
      bindings: {},
      tools: tools.map(t => t.name)
    };
  }
  throw new Error('unknown tool ' + name);
}

async function mcp(req, env) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return er(null, e);
  }

  const id = body.id;

  if (body.method === 'initialize') {
    return ok(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: NAME, version: VERSION }
    });
  }

  if (body.method === 'notifications/initialized') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (body.method === 'tools/list') {
    return ok(id, { tools });
  }

  if (body.method === 'tools/call') {
    try {
      return txt(id, await call(env, body.params.name, body.params.arguments || {}));
    } catch (e) {
      return er(id, e);
    }
  }

  return er(id, 'method not found');
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (url.pathname === '/health') {
      return R(await call(env, 'example_status', {}));
    }

    if (url.pathname === '/mcp' && req.method === 'POST') {
      return mcp(req, env);
    }

    return new Response(NAME + ': not found', { status: 404, headers: CORS });
  }
};
```

## Tool Design Rules

### Tool names

Use clear snake_case names.

Good:

```txt
create_d1_database
push_files_to_github
materialize_url_to_repo
compose_worker_site
```

Bad:

```txt
doThing
process
run
magic
```

### Tool input schemas

Every tool must declare an `inputSchema`.

Keep required fields minimal. Prefer optional fields for future extension.

Example:

```js
{
  name: 'push_files_to_github',
  description: 'Push multiple files to GitHub using a manifest array.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string' },
      repo: { type: 'string' },
      branch: { type: 'string' },
      message: { type: 'string' },
      files: { type: 'array' }
    },
    required: ['repo', 'files']
  }
}
```

### Tool output

Return structured JSON. Include:

```txt
ok
ids
paths
counts
commit URLs
error details if failed
```

Do not return huge raw content unless asked. Prefer previews, counts, paths, and links.

## Binding Rules

### Plain text vars

Use for non-sensitive config:

```txt
DEFAULT_OWNER
CF_ACCOUNT_ID
API_BASE_URL
```

### Secret vars

Use for tokens:

```txt
GITHUB_TOKEN
CF_API_TOKEN
RESEND_API_KEY
```

### D1 bindings

Name D1 binding clearly:

```txt
DB
INDEX_DB
QUEUE_DB
```

### Binding visibility

Health endpoints should show only booleans:

```json
"bindings": {
  "GITHUB_TOKEN": true,
  "DB": true
}
```

Never return secret values.

## Standard Build Flow

### Step 1 — Define the tool boundary

Write one sentence:

```txt
This MCP exists to ______.
```

If the sentence has `and` more than once, split the MCP.

### Step 2 — Define tools

Start with a status tool:

```txt
<domain>_status
```

Then add 1–4 core tools.

### Step 3 — Deploy minimal version

Deploy v0.1 with health + MCP + the narrow core tools.

### Step 4 — Add custom domain

Use:

```txt
<worker-name>.agentfeedoptimization.com
```

### Step 5 — Connect to ChatGPT/Claude

Use MCP URL:

```txt
https://<worker-name>.agentfeedoptimization.com/mcp
```

### Step 6 — Smoke test

Always run:

```txt
status tool
one safe create/read action
one multi-item action if applicable
```

### Step 7 — Patch small

If something fails, patch the smallest possible surface.

Do not rewrite the whole Worker unless necessary.

## Common AFO MCP Categories

### Admin MCPs

Examples:

```txt
afo-d1-admin-mcp
afo-email-automation-mcp
```

Purpose: create/manage infrastructure.

### Router MCPs

Examples:

```txt
afo-signup-router-mcp
afo-docparse-orchestrator-mcp
```

Purpose: call multiple downstream tools and return a combined result.

### Normalizer MCPs

Examples:

```txt
afo-docparse-result-normalizer-mcp
```

Purpose: fix/standardize data shape.

### Materializer MCPs

Examples:

```txt
afo-gitzip-push-mcp
afo-parse-to-repo-mcp
```

Purpose: turn temporary/generated data into durable artifacts.

### Composer MCPs

Examples:

```txt
afo-repo-composer-mcp
```

Purpose: transform artifacts into runnable or reusable packages.

### Product Web MCPs

Examples:

```txt
afo-docparse-public-web
afo-agent-feed-web
afo-semantic-index-web
```

Purpose: expose product UI. Prefer SSR forms for mobile reliability.

## GitZip / Repo Materialization Doctrine

GitZip is used when chat output should become real files.

Use GitZip when you have:

```txt
generated Worker source
generated docs
parsed website artifacts
prompt libraries
static sites
Cloudflare app scaffolds
agent feed packages
```

Repo materialization means:

```txt
idea / parse / generated code
→ file manifest
→ GitHub commit
→ durable repo artifact
```

## Parse-to-Repo Doctrine

Parsed data should become reusable assets.

A parsed webpage or document can become:

```txt
source artifact package
static blog
Worker site
content API
prompt library
agent feed package
D1-backed index app
full site
existing site patch
```

Use:

```txt
afo-parse-to-repo-mcp
```

for turning a parse result into artifacts.

Use:

```txt
afo-repo-composer-mcp
```

for turning artifacts into app/site/library formats.

## Cloudflare Deploy Doctrine

For direct Worker deployment, use:

```txt
cloudflare-multipart-mcp / Cf-multipart
```

Core deploy tool:

```txt
deploy_worker_with_bindings
```

Use this for:

```txt
single-file Worker deploys
binding updates
MCP tool creation
web MVPs
```

For database creation, use:

```txt
afo-d1-admin-mcp
```

For GitHub source materialization, use:

```txt
afo-gitzip-push-mcp
```

## Mobile-First UI Doctrine

For public product pages, prefer server-side forms first.

Avoid relying on fragile mobile browser JavaScript for core actions.

Use:

```txt
GET /health
POST /try
POST /signup
POST /search
GET /recent
GET /digest
POST /publish
```

A reliable ugly UI is better than a pretty broken UI. Add visual polish with CSS and native HTML features like:

```txt
<details>
<summary>
sticky headers
forms
plain links
```

## Security Rules

1. Never expose secrets in responses.
2. Delete/drop/destructive tools require explicit confirmation flags.
3. Keep admin tools separate from public web tools.
4. Public pages should call routers, not raw admin tools.
5. Health endpoints show only binding presence.
6. GitHub write tools should require explicit repo/path/message input.
7. Limit batch file counts in GitZip-style tools.
8. Validate paths and reject `..` path traversal.

## Smoke Test Template

After connecting an MCP, run:

```txt
1. <tool>_status
2. Safe read/list call
3. Safe write call to a test path or test record
4. Confirm result shape
5. Record commit/deployment/result ID
```

Example GitZip smoke test:

```json
{
  "owner": "nothinginfinity",
  "repo": "gitzip-push",
  "branch": "main",
  "path": "tests/afo-gitzip-smoke.md",
  "content": "# Smoke Test",
  "message": "Smoke test AFO GitZip MCP"
}
```

## Handoff Rules

After a meaningful build, send a handoff or bulletin through Message OS.

Include:

```txt
what was built
worker/domain/MCP URL
tools exposed
bindings needed
smoke test result
next recommended build
```

Use Message OS v08:

```txt
reply_or_route route_type=handoff to=claude
reply_or_route route_type=handoff to=alice
reply_or_route route_type=bulletin to=shared
```

## Current Core Infrastructure MCPs

```txt
Cf-multipart
- deploy_worker_with_bindings
- update_worker_bindings_multipart
- get_worker_source
- execute_d1_sql
- query_d1_sql
- list_d1_tables

AFO D1 Admin
- create_d1_database
- list_d1_databases
- get_d1_database
- delete_d1_database

AFO GitZip Push
- gitzip_status
- create_or_update_repo_file
- push_files_to_github

AFO Parse to Repo
- parse_to_repo_status
- materialize_url_to_repo
- materialize_parse_result_to_repo

AFO Repo Composer
- compose_static_blog
- compose_worker_site
- compose_content_api
- compose_prompt_library
- compose_agent_feed_site
- compose_d1_index_app
- compose_full_site
- compose_existing_site_patch

Message OS v08
- check_bridge_inbox
- triage_inbox
- reply_or_route
```

## Recommended Dedicated Project Prompt

Paste this as the first message in the dedicated MCP Builder project:

```txt
You are operating as the AFO MCP Builder Space.

Your job is to design, build, deploy, test, materialize, and hand off small composable MCP tools using the AFO Worker MCP pattern.

Always prefer narrow standalone Cloudflare Worker MCPs.

Required pattern:
- GET /health
- POST /mcp
- initialize
- notifications/initialized
- tools/list
- tools/call
- JSON-RPC responses
- CORS
- status tool
- binding presence in health response
- no secret exposure

Default build path:
1. Define the smallest useful tool boundary.
2. Create v0.1 standalone Worker MCP.
3. Deploy with Cf-multipart.
4. Ask Jared to add custom domain and secrets/bindings if needed.
5. Smoke test after connection.
6. Materialize source/docs/tests with GitZip when useful.
7. Send Message OS handoff/bulletin after major builds.

Use the AFO infrastructure stack:
- Cf-multipart for Worker deployment and binding patches.
- AFO D1 Admin for D1 database creation.
- AFO GitZip Push for repo materialization.
- AFO Parse to Repo for turning parsed websites/docs into repo artifacts.
- AFO Repo Composer for turning artifacts into runnable sites/APIs/apps.
- Message OS v08 for handoffs and bulletins.

Avoid giant tools. Split large ideas into small MCPs and compose later.
```

## First Build Checklist for the MCP Builder Space

```txt
[ ] Confirm which MCPs/tools are connected.
[ ] Check Message OS inbox.
[ ] Ask what tool Jared wants built.
[ ] Produce smallest v0 tool list.
[ ] Deploy standalone Worker.
[ ] Provide custom domain + health URL + MCP URL.
[ ] Ask Jared to connect it or add secrets if needed.
[ ] Run status + smoke test.
[ ] Patch if needed.
[ ] Materialize source/docs if important.
[ ] Send handoff/bulletin.
```
