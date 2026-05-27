# GitZip Generated Repo Roadmap

## Purpose

GitZip should evolve from a repo downloader/materializer into a typed repo generator: a system that can take parsed websites, documents, media metadata, or structured AI outputs and create deployable repositories.

The target is not only `parse -> files`; it is:

```txt
source -> parse -> normalize -> classify -> generate -> index -> publish -> deploy -> verify -> repair
```

This roadmap defines how GitZip can create these product types:

- Cloudflare Pages blog
- Cloudflare Worker API
- D1-indexed content database
- searchable knowledge base
- generated article hub
- game/wiki/media catalog
- full AI-generated website
- landing page system
- semantic index
- content engine for an existing website

## Current Baseline

GitZip / Parse-to-Repo can already materialize parsed data into a repository path. The current artifact style is useful but not yet runnable by itself.

Example output shape:

```txt
artifacts/<source>/<doc_id>/
  README.md
  parsed.md
  result.json
  metadata.json
  prompts/article.md
```

This should be considered the `parsed-artifact` repo type.

## North Star

GitZip becomes a repo compiler for AI-generated software products.

A user should be able to say:

> Parse these 10 websites and generate a Cloudflare Pages knowledge base with D1 indexes, search, landing pages, article summaries, source citations, and deploy instructions.

GitZip should then produce a valid repo with templates, content, data indexes, migrations, configuration, deployment instructions, and a feedback loop that confirms whether the generated project actually built and deployed.

## MVP Flow

The MVP should materialize three outputs in one clean generation transaction:

1. **Core Data (`parsed-artifact`)**: clean, structured, token-stripped source material that acts as the agent memory bank.
2. **Human Interface (`cloudflare-pages-blog`)**: a static frontend built from the parsed/generated data so humans can browse it.
3. **Agent Interface (`worker-api-lite`)**: a lightweight API so other LLMs, MCP tools, and chatbots can query the same material without loading the entire repo.

This is the first practical product loop:

```txt
parse websites -> commit structured data -> generate blog -> generate API -> deploy -> verify
```

## Core Concepts

### 1. Repo Types

Every generated repo should declare a `repo_type`.

Initial repo types:

```txt
parsed-artifact
cloudflare-pages-blog
cloudflare-worker-api
worker-api-lite
d1-content-database
searchable-knowledge-base
generated-article-hub
game-wiki-media-catalog
full-ai-website
landing-page-system
semantic-index
existing-site-content-engine
```

### 2. Generation Manifest

Every generated repo should include a manifest:

```json
{
  "schema_version": "0.1",
  "generator": "gitzip",
  "repo_type": "cloudflare-pages-blog",
  "template_id": "cloudflare-pages-blog/v0.1",
  "source_count": 10,
  "generated_at": "ISO_DATE",
  "targets": ["cloudflare-pages"],
  "features": ["articles", "tags", "sitemap", "rss", "search-index"],
  "safety": {
    "copyright_mode": "abstractive",
    "overwrite_mode": "protected"
  },
  "inputs": [
    {
      "source_url": "https://example.com",
      "doc_id": "doc_x",
      "content_type": "text/html"
    }
  ]
}
```

Canonical path:

```txt
.afo/gitzip/generation-manifest.json
```

Compatibility alias:

```txt
.gitzip/generation-manifest.json
```

### 3. Source Registry

All generated repos should preserve source lineage.

```txt
data/sources.json
content/sources/<doc_id>.json
```

A generated article, landing page, API row, or index record should point back to the original parse result.

### 4. Build Contracts

Each runnable repo type should declare:

```txt
package.json
README.md
.afo/config.json
.afo/gitzip/generation-manifest.json
```

Cloudflare deployable repo types should also include:

```txt
wrangler.toml
```

D1-backed repo types should include:

```txt
migrations/0001_init.sql
```

## System Safeguards and Protocols

These protocols are mandatory before GitZip becomes a high-throughput agentic generator. Without them, agents can thrash GitHub, break deploys silently, or produce inconsistent layouts that downstream tools cannot consume.

### 1. Commit Thrashing Prevention Protocol

Problem: agents can make decisions file-by-file faster than GitHub and CI/CD systems should receive commits. A single scrape/generation session may modify 10, 50, or 500 files. Pushing each file separately causes noisy history, API pressure, partial states, and unnecessary Cloudflare builds.

Required fix: GitZip must include a batching / transaction layer.

Protocol:

```txt
agent intent
  -> virtual workspace
  -> generated file manifest
  -> validation gates
  -> atomic multi-file commit
  -> deployment status check
```

The agent should build the entire desired repo state in memory or in a virtual workspace first. GitZip should then execute one atomic multi-file commit per logical generation transaction.

Transaction object:

```json
{
  "transaction_id": "txn_abc123",
  "repo_type": "cloudflare-pages-blog",
  "base_sha": "optional-current-head-sha",
  "files": [
    {
      "path": "src/content/posts/example.md",
      "operation": "upsert",
      "content_sha256": "..."
    },
    {
      "path": "data/sources.json",
      "operation": "upsert",
      "content_sha256": "..."
    }
  ],
  "commit": {
    "message": "Generate Cloudflare Pages blog from 10 parsed sources",
    "atomic": true
  }
}
```

Rules:

- One user/generation task should normally produce one commit.
- File-by-file commits are allowed only for emergency repair or very small manual edits.
- Every transaction should have an ID.
- Every transaction should produce a manifest.
- Validation must happen before commit.
- If validation fails, no commit should be pushed.
- If a commit is pushed, it must represent a complete usable state.

Acceptance criteria:

- Ten generated files push as one commit.
- A generated Cloudflare project is never committed halfway.
- The commit response returns changed file count, transaction ID, commit SHA, and build/deploy tracking metadata when available.

### 2. Concrete Folder Convention

Problem: if every repo type invents its own layout, downstream tools such as Cloudflare deployers, Toolsmith, search indexers, and AI agents will have to guess where files live.

Required fix: all generated repos must use a strict top-level convention.

Canonical top-level layout:

```txt
repo-root/
  .afo/
    config.json
    gitzip/
      generation-manifest.json
      transaction-log.jsonl
      validation-report.json
      source-map.json
    deploy/
      status.json
      cloudflare.json
  .gitzip/
    generation-manifest.json        # compatibility mirror or pointer
  src/
    ...                             # app/source code for runnable repos
  content/
    ...                             # generated human-readable content
  data/
    ...                             # JSON indexes, registries, normalized data
  public/
    ...                             # static assets for Pages/site output
  specs/
    ...                             # agent instructions, roadmaps, contracts
  scripts/
    ...                             # build, seed, index, migration scripts
  migrations/
    ...                             # D1 migrations when needed
  README.md
  package.json                      # required for runnable JS/TS repos
  wrangler.toml                     # required for Cloudflare targets
```

`.afo/config.json` schema:

```json
{
  "schema_version": "0.1",
  "project": "generated-sports-blog",
  "mode": "cloudflare-pages-blog",
  "generator": "gitzip",
  "template_id": "cloudflare-pages-blog/v0.1",
  "deploy_target": "cloudflare-pages",
  "created_at": "ISO_DATE",
  "updated_at": "ISO_DATE",
  "paths": {
    "manifest": ".afo/gitzip/generation-manifest.json",
    "sources": "data/sources.json",
    "content": "content",
    "public": "public",
    "status": ".afo/deploy/status.json"
  }
}
```

Rules:

- `.afo/config.json` is the first place downstream tools should look.
- `.afo/gitzip/generation-manifest.json` describes what was generated.
- `data/sources.json` is the canonical source registry.
- `content/` contains human-readable generated content.
- `src/` contains executable app or Worker source.
- `public/` contains static assets.
- `specs/` contains instructions and contracts, not generated runtime data.
- Existing-site injection mode must preserve the host repo layout and put GitZip metadata under `.afo/`.

Acceptance criteria:

- Any downstream tool can identify repo mode by reading `.afo/config.json`.
- Any downstream tool can find source data, generated content, and deploy status without guessing.
- All MVP repo types follow the same top-level convention.

### 3. CI/CD Feedback Loop

Problem: GitZip can push code that Cloudflare cannot build. Without a feedback loop, the agent believes the task succeeded even if the deployment failed.

Required fix: add a Deployment Status MCP tool, webhook listener, or GitZip deploy-status adapter.

Pipeline:

```txt
GitZip commit
  -> Cloudflare build starts
  -> deploy status captured
  -> agent checks status
  -> if failed, agent reads logs
  -> agent patches repo in a new repair transaction
  -> status rechecked
```

Deploy status object:

```json
{
  "provider": "cloudflare",
  "project": "generated-sports-blog",
  "commit_sha": "abc123",
  "status": "success|failed|pending|unknown",
  "deployment_url": "https://example.pages.dev",
  "build_id": "cf_build_x",
  "logs_url": "https://dash.cloudflare.com/...",
  "checked_at": "ISO_DATE",
  "summary": "Build failed: missing npm script build"
}
```

Required files:

```txt
.afo/deploy/status.json
.afo/deploy/cloudflare.json
```

Required MCP/tool capabilities:

```txt
check_deployment_status(owner, repo, commit_sha)
read_deployment_logs(build_id)
record_deployment_status(repo, commit_sha, status)
```

Rules:

- Runnable repo generation is not complete until build/deploy status is known or explicitly marked `unknown`.
- If build fails, the agent should create a repair transaction rather than editing randomly.
- Deployment logs should be summarized into `.afo/deploy/status.json`.
- Repeated failed repair loops should stop after a configured limit.

Acceptance criteria:

- A generated repo can be traced from source parse to commit SHA to Cloudflare deployment.
- Failed deploys produce actionable status files.
- Agents can auto-correct missing scripts, bad Wrangler config, or broken imports.

### 4. Validation and Locking Protocol

Problem: multiple agents may attempt to modify the same generated repo at the same time.

Required fix: optimistic locking and validation reports.

Rules:

- Transactions should include expected `base_sha` when possible.
- If the remote branch head changed, GitZip should rebase or reject with a conflict report.
- Validation reports should be written before deploy status checks.

Required file:

```txt
.afo/gitzip/validation-report.json
```

Validation report shape:

```json
{
  "transaction_id": "txn_abc123",
  "status": "passed",
  "checks": [
    { "name": "manifest_exists", "status": "passed" },
    { "name": "json_valid", "status": "passed" },
    { "name": "required_files", "status": "passed" },
    { "name": "source_lineage", "status": "passed" }
  ]
}
```

## MVP Directory Schemas

### A. `parsed-artifact`

Purpose: preserve parsed source material in a stable, reusable form.

```txt
repo-root/
  .afo/
    config.json
    gitzip/
      generation-manifest.json
      transaction-log.jsonl
      validation-report.json
      source-map.json
  data/
    sources.json
    documents.json
  content/
    raw/
      <doc_id>.json
    markdown/
      <slug>.md
    extracted/
      <slug>.txt
  specs/
    prompts/
      article.md
      summarize.md
  README.md
```

Required `.afo/config.json` values:

```json
{
  "mode": "parsed-artifact",
  "deploy_target": null,
  "paths": {
    "sources": "data/sources.json",
    "raw": "content/raw",
    "markdown": "content/markdown"
  }
}
```

### B. `cloudflare-pages-blog`

Purpose: generate a static human-readable site from parsed/generated content.

```txt
repo-root/
  .afo/
    config.json
    gitzip/
      generation-manifest.json
      validation-report.json
      source-map.json
    deploy/
      status.json
      cloudflare.json
  src/
    pages/
      index.html
      blog.html
    styles/
      main.css
  content/
    posts/
      <slug>.md
    pages/
      about.md
  data/
    sources.json
    posts.json
    tags.json
    search-index.json
  public/
    sitemap.xml
    rss.xml
    robots.txt
  specs/
    generation-notes.md
  package.json
  wrangler.toml
  README.md
```

Minimum `package.json` scripts:

```json
{
  "scripts": {
    "build": "node scripts/build.js",
    "dev": "wrangler pages dev public",
    "deploy": "wrangler pages deploy public"
  }
}
```

### C. `worker-api-lite`

Purpose: expose generated/parsed content through a lightweight Cloudflare Worker API.

```txt
repo-root/
  .afo/
    config.json
    gitzip/
      generation-manifest.json
      validation-report.json
      source-map.json
    deploy/
      status.json
      cloudflare.json
  src/
    index.ts
    routes/
      health.ts
      sources.ts
      articles.ts
      search.ts
  data/
    sources.json
    content.json
    search-index.json
  specs/
    api-contract.md
  package.json
  wrangler.toml
  README.md
```

Minimum endpoints:

```txt
GET /health
GET /sources
GET /sources/:id
GET /articles
GET /articles/:slug
GET /search?q=
```

Minimum `/health` response:

```json
{
  "ok": true,
  "repo_type": "worker-api-lite",
  "source_count": 10,
  "content_count": 10,
  "manifest": ".afo/gitzip/generation-manifest.json"
}
```

## Phased Roadmap

## Phase 0 — Stabilize Parsed Artifact Output

Goal: make the current repo artifact format stable and reusable.

Deliverables:

- Define `parsed-artifact` as the canonical baseline repo type.
- Add `.afo/gitzip/generation-manifest.json` to every materialized artifact.
- Add `.afo/config.json` to identify the generated repo mode.
- Add `data/sources.json` to track source URLs, doc IDs, parse confidence, and timestamps.
- Add `content/raw/<doc_id>.json` as the preserved parse result.
- Add `content/markdown/<doc_id>.md` as the human-readable extracted text.
- Add deterministic slugs for every source.
- Add transaction batching so one logical generation produces one commit.

Acceptance criteria:

- A parse result can be pushed to GitHub in a stable folder layout.
- The output can be consumed by a later generator without manual cleanup.
- Every generated file can be traced back to source parse data.
- Ten generated files can be pushed atomically in a single commit.

## Phase 1 — Repo Type System

Goal: add a generation mode layer so GitZip can output different kinds of repos.

Deliverables:

- Add `repo_type` parameter to GitZip / Parse-to-Repo APIs.
- Add `template_id` parameter for explicit template selection.
- Add `features[]` parameter for optional modules.
- Add generator registry:

```txt
generators/
  parsed-artifact/
  cloudflare-pages-blog/
  cloudflare-worker-api/
  worker-api-lite/
  d1-content-database/
  searchable-knowledge-base/
  generated-article-hub/
  game-wiki-media-catalog/
  full-ai-website/
  landing-page-system/
  semantic-index/
  existing-site-content-engine/
```

Example API shape:

```json
{
  "repo_type": "cloudflare-pages-blog",
  "owner": "nothinginfinity",
  "repo": "my-generated-site",
  "branch": "main",
  "base_path": "",
  "inputs": ["doc_1", "doc_2"],
  "features": ["tags", "rss", "sitemap", "search-index"],
  "transaction": {
    "atomic": true,
    "commit_strategy": "single_commit"
  }
}
```

Acceptance criteria:

- The same parse result can generate at least two different repo shapes.
- Generated repos include clear metadata about their type and template.
- All repo types follow the `.afo/` structural convention.

## Phase 2 — Cloudflare Pages Blog

Goal: generate a deployable static blog from parsed websites or documents.

Features:

- Generated blog posts from parsed source content.
- Source citations and canonical links.
- Tags and categories.
- Home page and blog index.
- Sitemap and RSS.
- Cloudflare Pages deployment instructions.
- Deployment status feedback loop.

Acceptance criteria:

- Repo can be installed and built.
- Repo can be deployed to Cloudflare Pages.
- Each post has title, description, date, tags, and source metadata.
- `.afo/deploy/status.json` records deployment state.

## Phase 3 — Cloudflare Worker API / Worker API Lite

Goal: generate a Worker that exposes parsed content through HTTP endpoints.

Features:

- JSON API over parsed and generated content.
- Basic query search over local JSON.
- Optional D1 mode later.
- CORS configuration.
- `/health` confirms manifest and content count.

Acceptance criteria:

- Worker runs locally with Wrangler.
- Worker returns generated articles and source records.
- `/health` confirms manifest and content count.
- Failed Worker deploys produce an actionable status file.

## Phase 4 — D1-Indexed Content Database

Goal: create a D1-backed content repo with schema, migrations, seed data, and query APIs.

Initial schema:

```sql
CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  url TEXT,
  content_type TEXT,
  title TEXT,
  created_at TEXT
);

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  source_id TEXT,
  slug TEXT UNIQUE,
  title TEXT,
  summary TEXT,
  body TEXT,
  kind TEXT,
  created_at TEXT
);

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE
);

CREATE TABLE document_tags (
  document_id TEXT,
  tag_id TEXT,
  PRIMARY KEY (document_id, tag_id)
);

CREATE TABLE blocks (
  id TEXT PRIMARY KEY,
  document_id TEXT,
  block_type TEXT,
  body TEXT,
  position INTEGER
);
```

Features:

- Migrations for D1.
- Seed scripts generated from parse results.
- Worker routes over D1.
- Content detail, source detail, tags, and search endpoints.

Acceptance criteria:

- `wrangler d1 migrations apply` works.
- Seed data loads successfully.
- Worker can query D1 records.

## Phase 5 — Searchable Knowledge Base

Goal: produce a documentation-style knowledge base from many parsed sources.

Features:

- Topic extraction.
- Hierarchical navigation.
- Generated summaries.
- Source-aware pages.
- Search index.
- Related content links.

Optional Cloudflare modules:

- D1 for structured search.
- Vectorize for semantic search.
- R2 for media assets.

Acceptance criteria:

- Multiple parsed sources become a coherent knowledge base.
- User can browse by topic, source, and tag.
- Search returns relevant pages.

## Phase 6 — Generated Article Hub

Goal: turn parsed sources into editorial content: summaries, explainers, roundups, evergreen pages, and newsletters.

Features:

- Article generation from parsed sources.
- Roundup pages across related sources.
- Automatic headline, excerpt, tags, and SEO metadata.
- Editorial status workflow: draft, review, published.
- Source-citation block on each generated article.

Acceptance criteria:

- Ten parsed websites can become a coherent article hub.
- Generated pages distinguish source facts from AI synthesis.
- Article pages can be reviewed before publishing.

## Phase 7 — Game / Wiki / Media Catalog

Goal: classify parsed data into entity pages for games, videos, songs, artists, products, characters, items, quests, episodes, or topics.

Supported entity types:

```txt
game
character
item
quest
video
song
artist
album
episode
product
topic
source
```

Features:

- Entity extraction.
- Relationship graph.
- Collection pages.
- Wiki-style navigation.
- Media metadata cards.
- Generated index pages.

Acceptance criteria:

- Parsed content can be normalized into entities.
- Entity pages are generated with backlinks and source citations.
- Catalog can be browsed by entity type and collection.

## Phase 8 — Landing Page System

Goal: generate marketing or topic landing pages from parsed data and AI synthesis.

Features:

- AI-generated positioning.
- Hero, feature grid, proof/source cards, FAQ, and CTA sections.
- Variant generation for A/B testing.
- SEO metadata.
- Optional form endpoint.

Acceptance criteria:

- Parsed sources can generate a polished landing page.
- Landing page includes traceable source cards.
- Repo can deploy as Cloudflare Pages.

## Phase 9 — Semantic Index

Goal: build semantic search artifacts and optional Cloudflare Vectorize integration.

Features:

- Chunk parsed documents into stable units.
- Store chunk IDs and source mappings.
- Generate embedding manifests.
- Optional Vectorize upload script.
- Semantic search endpoint.
- Hybrid search mode: keyword + vector.

Acceptance criteria:

- Each document block becomes stable chunks.
- Chunks retain source, page, block, and URL lineage.
- Semantic search can return relevant chunks with citations.

## Phase 10 — Existing Website Content Engine

Goal: allow GitZip to generate content directly into an existing website repo without replacing the app.

Repo output examples:

Astro:

```txt
src/content/blog/<slug>.md
src/content/config.ts
```

Next.js:

```txt
content/posts/<slug>.mdx
app/blog/[slug]/page.tsx
```

Static HTML:

```txt
public/generated/<slug>.html
data/generated-index.json
```

Features:

- Detect framework: Astro, Next, Remix, SvelteKit, Vite, static HTML.
- Generate content into correct paths.
- Preserve existing site structure.
- Add optional index files and search data.
- Never overwrite existing user files without explicit mode.

Acceptance criteria:

- Existing site receives generated content safely.
- Generated files are isolated and reversible.
- Site builds after content injection.

## Phase 11 — Full AI-Generated Website

Goal: generate an entire deployable website from parsed sources and a user prompt.

Features:

- Site map generation.
- Information architecture.
- Landing page.
- Blog or article section.
- Search page.
- Source pages.
- About page.
- Contact or CTA page.
- Theme tokens.
- Optional D1 and Vectorize.

Acceptance criteria:

- User can provide sources and a brief.
- GitZip emits a complete website repo.
- Repo builds and deploys to Cloudflare Pages.

## Cross-Cutting Requirements

### Source Attribution

Every generated page should include source metadata:

```json
{
  "source_url": "https://example.com",
  "doc_id": "doc_x",
  "block_ids": ["b1", "b2"],
  "generated_from": "parse_result"
}
```

### Safety and Copyright Controls

Generated repos should avoid copying large copyrighted text verbatim by default.

Modes:

```txt
extractive: preserve source snippets within configured limits
abstractive: generate summaries and analysis
mirror: explicit site reconstruction mode only when allowed
```

### Quality Gates

Before pushing, run validators:

- manifest exists
- `.afo/config.json` exists
- required files exist
- JSON is valid
- slugs are unique
- source lineage exists
- build files exist for runnable repo types
- D1 schema exists for D1 repo types
- no accidental overwrite unless mode allows it
- transaction is complete and atomic

### Template Packs

Templates should be versioned:

```txt
templates/
  parsed-artifact/v0.1/
  cloudflare-pages-blog/v0.1/
  worker-api-lite/v0.1/
  d1-content-db/v0.1/
  knowledge-base/v0.1/
```

### AI Prompt Packs

Prompts should be versioned and stored:

```txt
prompts/
  summarize-source.md
  generate-article.md
  extract-entities.md
  build-taxonomy.md
  generate-landing-page.md
  classify-repo-type.md
  repair-failed-deploy.md
```

### Generated Repo README Contract

Every generated repo should explain:

- what was generated
- source list
- repo type
- how to install
- how to build
- how to deploy
- how to update with new parses
- how deployment status is checked
- safety/copyright mode

## Suggested Implementation Order

1. Stabilize `parsed-artifact` output.
2. Add `.afo/config.json` and `.afo/gitzip/generation-manifest.json`.
3. Add transaction batching / atomic multi-file commit protocol.
4. Add `repo_type` parameter.
5. Implement `cloudflare-pages-blog`.
6. Implement `worker-api-lite`.
7. Add Cloudflare deployment status feedback loop.
8. Add D1 schema and seed generation.
9. Add searchable knowledge base template.
10. Add article hub generation.
11. Add entity extraction for game/wiki/media catalogs.
12. Add semantic chunk/index generation.
13. Add existing-site content injection.
14. Add full AI website generation.

## MVP Recommendation

The best MVP is:

```txt
parsed-artifact + cloudflare-pages-blog + worker-api-lite
```

This gives GitZip three clear modes:

1. Save the parse results.
2. Generate a deployable blog.
3. Generate an API over the parsed content.

The MVP must also include three safeguards:

1. Single-transaction multi-file commits.
2. Standard `.afo/` repo metadata and folder convention.
3. Deployment status feedback from Cloudflare or an explicit `unknown` status file.

Once those work, D1, knowledge base, semantic index, and full-site generation become incremental extensions.

## Example Future Command

```json
{
  "action": "generate_repo",
  "repo_type": "cloudflare-pages-blog",
  "owner": "nothinginfinity",
  "repo": "generated-sports-blog",
  "sources": [
    "doc_06aec07f21fa40"
  ],
  "features": [
    "articles",
    "tags",
    "rss",
    "sitemap",
    "search-index"
  ],
  "deploy_target": "cloudflare-pages",
  "copyright_mode": "abstractive",
  "transaction": {
    "atomic": true,
    "commit_strategy": "single_commit"
  },
  "verify_deploy": true
}
```

## Final Vision

GitZip should become the bridge between parsed information and deployable software.

The long-term product promise:

> Bring sources. Choose a repo type. Get a deployable product. Verify it built. Repair it if it failed.
