# GitZip Generated Repo Roadmap

## Purpose

GitZip should evolve from a repo downloader/materializer into a typed repo generator: a system that can take parsed websites, documents, media metadata, or structured AI outputs and create deployable repositories.

The target is not only `parse -> files`; it is:

```txt
source -> parse -> normalize -> classify -> generate -> index -> publish -> deploy
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

GitZip should then produce a valid repo with templates, content, data indexes, migrations, configuration, and deployment instructions.

## Core Concepts

### 1. Repo Types

Every generated repo should declare a `repo_type`.

Initial repo types:

```txt
parsed-artifact
cloudflare-pages-blog
cloudflare-worker-api
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
  "repo_type": "cloudflare-pages-blog",
  "source_count": 10,
  "generated_at": "ISO_DATE",
  "targets": ["cloudflare-pages"],
  "features": ["articles", "tags", "sitemap", "rss", "search-index"],
  "inputs": [
    {
      "source_url": "https://example.com",
      "doc_id": "doc_x",
      "content_type": "text/html"
    }
  ]
}
```

Suggested path:

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
.gitzip/generation-manifest.json
```

Cloudflare deployable repo types should also include:

```txt
wrangler.toml
```

D1-backed repo types should include:

```txt
migrations/0001_init.sql
```

## Phased Roadmap

## Phase 0 — Stabilize Parsed Artifact Output

Goal: make the current repo artifact format stable and reusable.

Deliverables:

- Define `parsed-artifact` as the canonical baseline repo type.
- Add `.gitzip/generation-manifest.json` to every materialized artifact.
- Add `data/sources.json` to track source URLs, doc IDs, parse confidence, and timestamps.
- Add `content/raw/<doc_id>.json` as the preserved parse result.
- Add `content/markdown/<doc_id>.md` as the human-readable extracted text.
- Add deterministic slugs for every source.

Acceptance criteria:

- A parse result can be pushed to GitHub in a stable folder layout.
- The output can be consumed by a later generator without manual cleanup.
- Every generated file can be traced back to source parse data.

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
  "features": ["tags", "rss", "sitemap", "search-index"]
}
```

Acceptance criteria:

- The same parse result can generate at least two different repo shapes.
- Generated repos include clear metadata about their type and template.

## Phase 2 — Cloudflare Pages Blog

Goal: generate a deployable static blog from parsed websites or documents.

Repo output:

```txt
package.json
wrangler.toml
README.md
.gitzip/generation-manifest.json
src/
  content/
    posts/
      <slug>.md
  data/
    sources.json
  pages/
    index.html
    blog.html
public/
  sitemap.xml
  rss.xml
```

Features:

- Generated blog posts from parsed source content.
- Source citations and canonical links.
- Tags and categories.
- Home page and blog index.
- Sitemap and RSS.
- Cloudflare Pages deployment instructions.

Acceptance criteria:

- Repo can be installed and built.
- Repo can be deployed to Cloudflare Pages.
- Each post has title, description, date, tags, and source metadata.

## Phase 3 — Cloudflare Worker API

Goal: generate a Worker that exposes parsed content through HTTP endpoints.

Repo output:

```txt
package.json
wrangler.toml
src/index.ts
src/routes/articles.ts
src/routes/sources.ts
src/routes/search.ts
data/content.json
README.md
```

API endpoints:

```txt
GET /health
GET /sources
GET /sources/:id
GET /articles
GET /articles/:slug
GET /search?q=
```

Features:

- JSON API over parsed and generated content.
- Basic query search over local JSON.
- Optional D1 mode later.
- CORS configuration.

Acceptance criteria:

- Worker runs locally with Wrangler.
- Worker returns generated articles and source records.
- `/health` confirms manifest and content count.

## Phase 4 — D1-Indexed Content Database

Goal: create a D1-backed content repo with schema, migrations, seed data, and query APIs.

Repo output:

```txt
package.json
wrangler.toml
migrations/0001_init.sql
src/index.ts
src/db.ts
seeds/content.seed.sql
scripts/seed.ts
README.md
```

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

Repo output:

```txt
src/content/docs/
src/pages/docs/
src/components/SearchBox.tsx
data/search-index.json
data/topics.json
public/sitemap.xml
```

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

Repo output:

```txt
content/articles/
content/roundups/
content/explainers/
data/editorial-calendar.json
data/source-map.json
```

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

Repo output:

```txt
content/entities/
content/collections/
content/wiki/
data/entities.json
data/relationships.json
data/media.json
```

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

Repo output:

```txt
src/pages/index.tsx
src/pages/<landing-slug>.tsx
src/components/Hero.tsx
src/components/FeatureGrid.tsx
src/components/SourceCards.tsx
src/components/CTA.tsx
```

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

Repo output:

```txt
data/chunks.json
data/embeddings-manifest.json
scripts/chunk.ts
scripts/embed.ts
src/routes/semantic-search.ts
```

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

Repo output:

```txt
package.json
wrangler.toml
src/
  pages/
  components/
  content/
  data/
public/
README.md
.gitzip/generation-manifest.json
```

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
- required files exist
- JSON is valid
- slugs are unique
- source lineage exists
- build files exist for runnable repo types
- D1 schema exists for D1 repo types
- no accidental overwrite unless mode allows it

### Template Packs

Templates should be versioned:

```txt
templates/
  cloudflare-pages-blog/v0.1/
  worker-api/v0.1/
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
- safety/copyright mode

## Suggested Implementation Order

1. Stabilize `parsed-artifact` output.
2. Add `.gitzip/generation-manifest.json`.
3. Add `repo_type` parameter.
4. Implement `cloudflare-pages-blog`.
5. Implement `cloudflare-worker-api`.
6. Add D1 schema and seed generation.
7. Add searchable knowledge base template.
8. Add article hub generation.
9. Add entity extraction for game/wiki/media catalogs.
10. Add semantic chunk/index generation.
11. Add existing-site content injection.
12. Add full AI website generation.

## MVP Recommendation

The best MVP is:

```txt
parsed-artifact + cloudflare-pages-blog + worker-api-lite
```

This gives GitZip three clear modes:

1. Save the parse results.
2. Generate a deployable blog.
3. Generate an API over the parsed content.

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
  "copyright_mode": "abstractive"
}
```

## Final Vision

GitZip should become the bridge between parsed information and deployable software.

The long-term product promise:

> Bring sources. Choose a repo type. Get a deployable product.
