# GitZip Tool Factory Roadmap

## Purpose

This companion roadmap adds the missing tool-factory lane to the GitZip generated repo roadmap.

The generated site/content roadmap covers:

```txt
parsed websites/data -> generated repos -> Cloudflare Pages / Worker / D1 / semantic index
```

This roadmap covers:

```txt
tool idea/spec -> source-controlled Worker/MCP repo -> deploy -> smoke test -> register -> improve
```

Together, these make GitZip the backbone of an AI software factory.

## Key Clarification

GitZip does not need to directly deploy Workers to be valuable.

Its core role is the missing durability layer before deployment:

```txt
agent generates files
  -> GitZip commits them into GitHub
  -> Cloudflare Multipart deploys Worker source
  -> D1 Admin creates database if needed
  -> smoke tests validate behavior
  -> Toolsmith/Gateway registers the tool
  -> future agents inspect, patch, and redeploy from source
```

This prevents generated code from being lost inside chat transcripts and turns every serious build into a durable repo artifact.

## New Repo Types to Add

The main roadmap should include these additional GitZip repo types:

```txt
mcp-tool-source
worker-tool-source
tool-build-ledger
belt-package
toolsmith-registration-package
agent-handoff-package
smoke-test-package
```

These are distinct from content/site generation modes. They are software-factory modes.

## 1. Materialize Every New MCP Tool into GitHub

Instead of only deploying generated Workers directly, every MCP tool should have source-controlled files.

Canonical layout:

```txt
workers/<tool-name>/
  .afo/
    config.json
    gitzip/
      generation-manifest.json
      transaction-log.jsonl
      validation-report.json
    deploy/
      status.json
      cloudflare.json
    toolsmith/
      registration.json
      gateway.json
  src/
    index.ts
  README.md
  spec.md
  MCP_SCHEMA.json
  test.json
  wrangler.toml
  package.json
```

Example:

```txt
workers/afo-index-core-mcp/
  src/index.ts
  README.md
  spec.md
  MCP_SCHEMA.json
  test.json
  DEPLOY_NOTES.md
```

Benefits:

- Claude, Alice, ChatGPT, and future agents can inspect the same source.
- Tool source can be patched without relying on chat memory.
- Deployment becomes replayable.
- Smoke tests and schemas live beside the Worker.

Acceptance criteria:

- Every new MCP tool gets a durable repo folder before deployment.
- Worker source, schema, README, and smoke test are committed together.
- Tool source can be redeployed from GitHub without reconstructing from chat.

## 2. Tool Build Ledger

Every tool build should include a ledger that records what was built, why, how it was deployed, and how it was tested.

Canonical files:

```txt
TOOLS.md
MCP_SCHEMA.json
CHANGELOG.md
DEPLOY_NOTES.md
BUILD_LEDGER.md
SMOKE_TESTS.md
```

Suggested `BUILD_LEDGER.md` structure:

```md
# Build Ledger: <tool-name>

## Intent

What this tool is supposed to do.

## Source Inputs

- Spec file
- Chat/task/request link if available
- Related tools

## Generated Files

- src/index.ts
- MCP_SCHEMA.json
- test.json

## Deployment

- Cloudflare Worker name
- Commit SHA
- Deployment ID
- Wrangler config

## Smoke Tests

- Test name
- Request
- Expected response
- Last status

## Registration

- Toolsmith record
- Gateway manifest
- Belt memberships

## Changelog

- Versioned updates
```

Machine-readable ledger:

```txt
.afo/gitzip/build-ledger.json
```

Example schema:

```json
{
  "tool_name": "afo-index-core-mcp",
  "repo_type": "mcp-tool-source",
  "commit_sha": "abc123",
  "worker": {
    "name": "afo-index-core-mcp",
    "status": "deployed|pending|failed|unknown"
  },
  "d1": {
    "required": true,
    "database_name": "afo_index_core",
    "migration_status": "applied|pending|failed|unknown"
  },
  "toolsmith": {
    "registered": false,
    "tool_id": null
  },
  "smoke_tests": [
    {
      "name": "health",
      "status": "pending",
      "path": "/health"
    }
  ]
}
```

Acceptance criteria:

- Every generated tool has human-readable and machine-readable build ledger files.
- Agents can answer: what is this tool, where is source, where is deploy, how was it tested, is it registered?

## 3. Generate the Next Build from a Repo, Not Chat Memory

The safe loop should be:

```txt
spec
  -> repo source
  -> deploy
  -> smoke test
  -> patch repo
  -> redeploy
```

Not:

```txt
chat memory
  -> deploy opaque source
  -> lose context
```

Required protocol:

1. Commit spec first.
2. Commit source and schemas.
3. Deploy from committed source.
4. Write deploy status back to `.afo/deploy/status.json`.
5. Run smoke tests.
6. Commit smoke test results.
7. Register tool in Toolsmith/Gateway.
8. Commit registration metadata.

Acceptance criteria:

- The repo is the source of truth for the build.
- Any agent can continue from the repo instead of reconstructing history from chat.

## 4. Belts as Real Repositories

A belt should become a source-controlled package, not just a registry entry.

Canonical layout:

```txt
belts/<belt-name>/
  .afo/
    config.json
    gitzip/
      generation-manifest.json
      validation-report.json
  belt.json
  README.md
  tools/
    <tool-id>.json
  prompts/
    system.md
    operator.md
  schemas/
    input.schema.json
    output.schema.json
  smoke-tests/
    health.json
    end-to-end.json
  CHANGELOG.md
```

`belt.json` example:

```json
{
  "schema_version": "0.1",
  "belt_id": "afo-index-core-belt",
  "name": "AFO Index Core Belt",
  "tools": [
    "afo-index-core-mcp",
    "d1-admin",
    "cloudflare-multipart"
  ],
  "prompts": [
    "prompts/system.md",
    "prompts/operator.md"
  ],
  "smoke_tests": [
    "smoke-tests/health.json"
  ]
}
```

Benefits:

- Toolsmith becomes a source-controlled factory.
- Belt definitions can be diffed, reviewed, tested, and replayed.
- Agents can materialize working workcells from repo packages.

Acceptance criteria:

- A belt can be created, inspected, tested, and registered from repo files.
- Belt package includes tools, prompts, schemas, and smoke tests.

## 5. Reliable Agent Handoff Objects

Instead of handing off vague chat summaries, GitZip should create reliable handoff packages.

Canonical handoff:

```txt
handoffs/<handoff-id>/
  README.md
  TASK.md
  START_HERE.md
  FILES.md
  NEXT_STEPS.md
  context.json
```

Example handoff message:

```txt
Repo: nothinginfinity/afo-index-core
Start with: specs/index-core-v0.md
Patch: workers/afo-index-core-mcp/src/index.ts
Test: workers/afo-index-core-mcp/test.json
Deploy notes: workers/afo-index-core-mcp/DEPLOY_NOTES.md
```

`context.json` example:

```json
{
  "handoff_id": "handoff_afo_index_core_001",
  "repo": "nothinginfinity/afo-index-core",
  "start_here": "specs/index-core-v0.md",
  "patch_targets": [
    "workers/afo-index-core-mcp/src/index.ts"
  ],
  "test_targets": [
    "workers/afo-index-core-mcp/test.json"
  ],
  "status": "ready_for_patch"
}
```

Acceptance criteria:

- Claude, Alice, ChatGPT, or a future agent can continue from a handoff package without needing the original chat.
- Handoff package points to specs, source files, tests, deploy notes, and current status.

## 6. AFO Index Core Factory Loop

The immediate practical target is `afo-index-core-mcp`.

Recommended loop:

```txt
AFO Index Core spec
  -> GitZip creates repo/files
  -> D1 Admin creates database
  -> Cloudflare Multipart deploys Worker
  -> GitZip commits smoke tests/docs
  -> Toolsmith registers the MCP
  -> Gateway exposes the tool
  -> agents patch source from repo
```

Suggested repo/folder layout:

```txt
afo-index-core/
  specs/
    index-core-v0.md
  workers/
    afo-index-core-mcp/
      src/index.ts
      README.md
      spec.md
      MCP_SCHEMA.json
      test.json
      DEPLOY_NOTES.md
      wrangler.toml
      package.json
      .afo/
        config.json
        gitzip/
          generation-manifest.json
          build-ledger.json
          validation-report.json
        deploy/
          status.json
        toolsmith/
          registration.json
  migrations/
    0001_init.sql
  seeds/
    initial.sql
  belts/
    index-core-belt/
      belt.json
      README.md
      tools/
      prompts/
      schemas/
      smoke-tests/
  handoffs/
    initial-build/
      START_HERE.md
      context.json
```

## Additional Safeguards for Tool Factory Mode

### Deployment Source Lock

A Worker should be deployed from a specific commit SHA, not from anonymous chat-generated source.

Required metadata:

```json
{
  "deployed_from_commit": "abc123",
  "source_path": "workers/afo-index-core-mcp/src/index.ts",
  "deploy_tool": "cloudflare-multipart",
  "deployed_at": "ISO_DATE"
}
```

### Smoke Test Before Registration

Toolsmith/Gateway registration should happen after minimum smoke tests pass.

Required order:

```txt
commit source -> deploy -> smoke test -> register -> publish belt
```

Exception: tools can be registered as `experimental` or `disabled` before smoke tests pass.

### Schema Drift Detection

If `MCP_SCHEMA.json` changes, GitZip should require:

- changelog entry
- smoke test update
- Toolsmith registration update

### Tool Identity Stability

Tool IDs should be stable across deployments.

Required fields:

```json
{
  "tool_id": "afo-index-core-mcp",
  "worker_name": "afo-index-core-mcp",
  "schema_version": "0.1",
  "source_path": "workers/afo-index-core-mcp/src/index.ts"
}
```

### Rollback Support

Every deploy status file should include previous known-good commit.

```json
{
  "current_commit": "abc123",
  "last_good_commit": "def456",
  "rollback_available": true
}
```

## Integration Points

GitZip should integrate with these systems as separate stages:

```txt
GitZip
  - creates repo files
  - batches atomic commits
  - records manifests and ledgers

Cloudflare Multipart
  - deploys Worker source
  - returns deploy status

D1 Admin
  - creates databases
  - applies migrations
  - records migration status

Toolsmith/Gateway
  - registers MCP tools
  - registers belts
  - exposes tool manifests

Message OS / Agent Bridge
  - creates handoff notifications
  - routes work to Claude/Alice/ChatGPT/future agents
```

## Immediate Additions to Main Roadmap

The main roadmap should be considered incomplete unless it includes:

1. `mcp-tool-source` repo type.
2. `worker-tool-source` repo type.
3. `tool-build-ledger` files and schemas.
4. `belt-package` repo type.
5. `agent-handoff-package` repo type.
6. Deployment-source commit SHA locking.
7. Smoke-test-before-registration protocol.
8. Toolsmith/Gateway registration metadata.
9. Schema drift detection.
10. Rollback metadata.

## MVP Recommendation for Tool Factory Mode

Build this MVP next:

```txt
mcp-tool-source + tool-build-ledger + smoke-test-package
```

Then add:

```txt
belt-package + toolsmith-registration-package + agent-handoff-package
```

This gives the factory loop enough structure to safely build `afo-index-core-mcp` and future tools.

## Final Vision

GitZip should be the source-control engine of the AI software factory.

For content generation:

```txt
sources -> generated website/API/database/index
```

For tool generation:

```txt
spec -> source repo -> deploy -> smoke test -> register -> improve
```

The repository becomes the universal handoff object, memory bank, deploy source, audit trail, and repair surface.
