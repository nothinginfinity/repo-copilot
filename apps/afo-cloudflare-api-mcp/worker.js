const VERSION = "0.7.2";
const AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const WORKER_NAME = "afo-cloudflare-api-mcp";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id"
};

const SPEC_URL = "https://raw.githubusercontent.com/cloudflare/api-schemas/main/openapi.json";
const SPEC_KEY = "cf-openapi-spec/index.json";
const SKILLS_KEY = "skills/cloudflare-api.json";
const CF_DOCS_INDEX_KEY = "docs/cloudflare/index.json";
const CF_DOCS_DOC_PREFIX = "docs/cloudflare/pages/";
const CF_DOCS_DEFAULT_INDEX = "https://developers.cloudflare.com/llms.txt";
const CF_DOCS_MAX_DOCS = 40;
const CF_DOCS_MAX_DOC_CHARS = 120000;
const MAX_RESPONSE_CHARS = 30000;
const MAX_PAGINATION_PAGES = 10;
const MAX_PAGINATION_ITEMS = 2000;
const DEFAULT_COMPAT_DATE = "2026-05-31";

const BINDINGS_DOC =
  "Array of binding objects, one of: " +
  "{type:'plain_text',name,text} | {type:'secret_text',name,text} | " +
  "{type:'kv_namespace',name,namespace_id} | {type:'r2_bucket',name,bucket_name} | " +
  "{type:'d1',name,id} | {type:'vectorize',name,index_name}. " +
  "This list fully replaces the worker's current bindings — Cloudflare's API has no partial " +
  "merge, so omit nothing you want to keep, including secrets (their values can't be read back).";

const TOOLS = [
  {
    name: "cf_api_status",
    description: "Health check. Shows binding presence and whether the spec index has been seeded.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "search",
    description: "Search the Cloudflare OpenAPI spec for endpoints across the entire Cloudflare API. Filter by free-text query (matches path, summary, tags) and/or an exact product tag. Returns method, path, tags, and summary for each match so you can then call the endpoint with the call tool.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free text to match against path, summary, or tags" },
        tag: { type: "string", description: "Exact product tag to filter by, e.g. 'workers', 'r2', 'd1'" },
        limit: { type: "number", description: "Max results to return, default 30" }
      },
      required: []
    }
  },
  {
    name: "call",
    description: "Call any Cloudflare API v4 endpoint directly. Use search first to find the right method and path. The literal substring {account_id} in path is auto-replaced with the account_id argument or the default account. Automatically retries on 429/5xx with backoff. Set paginate=true to follow Cloudflare's page/result_info pagination when the response is a paginated list (capped at 10 pages / 2000 items).",
    inputSchema: {
      type: "object",
      properties: {
        method: { type: "string", description: "HTTP method: GET, POST, PUT, PATCH, or DELETE" },
        path: { type: "string", description: "API path, e.g. /accounts/{account_id}/workers/scripts/my-worker" },
        query: { type: "object", description: "Query string parameters" },
        body: { type: "object", description: "JSON request body for POST/PUT/PATCH" },
        account_id: { type: "string", description: "Override the account id substituted for {account_id} in path" },
        paginate: { type: "boolean", description: "Follow pagination if the response has result_info.total_pages. Default false." }
      },
      required: ["method", "path"]
    }
  },
  {
    name: "ask_cloudflare",
    description: "AI-assisted Cloudflare API investigator. Takes a natural-language request, searches the Cloudflare OpenAPI index, selects a safe endpoint, builds parameters, executes it, and returns a compact answer with an audit trail. Defaults to read-only GET operations unless allow_mutation=true.",
    inputSchema: {
      type: "object",
      properties: {
        request: { type: "string", description: "Natural-language Cloudflare API task or investigation question" },
        account_id: { type: "string" },
        allow_mutation: { type: "boolean", description: "Default false. Required for POST/PUT/PATCH/DELETE." },
        dry_run: { type: "boolean", description: "If true, select endpoint and params but do not call Cloudflare." },
        limit: { type: "number", description: "Candidate endpoint limit, default 8" }
      },
      required: ["request"]
    }
  },
  {
    name: "ask_cloud_loop",
    description: "Supervised Cloud-Loop dry-run/read-only orchestrator. Routes Cloudflare requests through forward evidence, inverse risk, verification, convergence, and receipt packets. v0.7.2 never mutates Cloudflare write paths, resolves bound D1 databases from Worker settings for D1 dry-runs, and can perform read-only Worker settings inspection.",
    inputSchema: {
      type: "object",
      properties: {
        request: { type: "string", description: "Natural-language Cloudflare investigation or dry-run task" },
        domain: { type: "string", description: "cloudflare|github|auto. v0.7.2 handles Cloudflare and records non-Cloudflare as blocked/unsupported." },
        mode: { type: "string", description: "dry_run|read_only. v0.7.2 forces safe dry-run/read-only behavior; read_only may perform safe GET inspections." },
        account_id: { type: "string" },
        database_name: { type: "string" },
        database_id: { type: "string" },
        script_name: { type: "string" },
        migration_sql: { type: "string", description: "Optional SQL to split and audit, never executed by ask_cloud_loop." },
        allow_mutation: { type: "boolean", description: "Ignored/forced false in v0.7.2." },
        max_iterations: { type: "number", description: "Accepted for future compatibility; v0.7.2 runs exactly one supervised iteration." },
        include_runtime: { type: "boolean", description: "Default true. Enables read-only runtime/preflight packet." },
        include_docs: { type: "boolean", description: "Default true. Enables cached Cloudflare docs evidence packet." }
      },
      required: ["request"]
    }
  },
  {
    name: "list_skills",
    description: "List the skills document this subagent applies during ask_cloudflare (stored as data in R2, editable without redeploys). Read this before writing new skills - the how_to_extend field documents the format.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "upsert_skill",
    description: "Add or update one Cloudflare API skill. Pass skill:{id,title,triggers[],endpoints[],guidance,response_note,enabled}. guidance is injected into ask_cloudflare when a trigger matches; response_note is attached when the chosen endpoint matches. Set enabled:false to disable without deleting.",
    inputSchema: { type: "object", properties: { skill: { type: "object" } }, required: ["skill"] }
  },
  {
    name: "refresh_cloudflare_docs",
    description: "Fetch Cloudflare docs llms.txt/markdown links into the SPEC R2 bucket for local search. R2-only MVP: no Vectorize binding required. Defaults to developers.cloudflare.com/llms.txt and caps fetched docs for safety.",
    inputSchema: {
      type: "object",
      properties: {
        index_url: { type: "string", description: "Optional llms.txt URL" },
        product: { type: "string", description: "Optional product/topic filter, e.g. d1, workers, r2" },
        limit: { type: "number", description: "Max docs to fetch, default 20, max 40" },
        force: { type: "boolean", description: "Refetch docs even if cached" }
      },
      required: []
    }
  },
  {
    name: "search_cloudflare_docs",
    description: "Search the locally cached Cloudflare docs knowledge base in R2 and return source-backed snippets for ask_cloudflare or direct answers.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        product: { type: "string" },
        limit: { type: "number", description: "Default 5, max 10" }
      },
      required: ["query"]
    }
  },
  {
    name: "get_cloudflare_doc",
    description: "Read a cached Cloudflare docs page by doc_id returned from search_cloudflare_docs. Prefer get_cloudflare_doc_excerpt for safer, smaller retrieval.",
    inputSchema: {
      type: "object",
      properties: { doc_id: { type: "string" }, max_chars: { type: "number" } },
      required: ["doc_id"]
    }
  },
  {
    name: "get_cloudflare_doc_excerpt",
    description: "Safely read a focused excerpt from a cached Cloudflare docs page. Returns a sanitized excerpt around a query plus structured claims; never returns the full doc blob by default.",
    inputSchema: {
      type: "object",
      properties: { doc_id: { type: "string" }, query: { type: "string" }, max_chars: { type: "number", description: "Default 1800, max 5000" } },
      required: ["doc_id"]
    }
  },
  {
    name: "d1_migration_preflight",
    description: "Canonical first-class D1 migration entrypoint. Read-only inspector that lists D1 databases, resolves a target DB, optionally inspects Worker D1 bindings, reads sqlite_master, returns tables/warnings/recommended next tools, detects migration ledger tables, and splits proposed SQL into one-statement units without executing it.",
    inputSchema: {
      type: "object",
      properties: {
        database_name: { type: "string", description: "Target D1 database name" },
        database_id: { type: "string", description: "Target D1 database UUID" },
        script_name: { type: "string", description: "Optional Worker script to inspect for D1 bindings" },
        migration_sql: { type: "string", description: "Optional SQL text to split and audit, never executed by this tool" },
        include_table_details: { type: "boolean", description: "If true, also inspect table_info, index_list, and foreign_key_list for a small number of tables" },
        max_table_details: { type: "number", description: "Default 5, max 20" },
        account_id: { type: "string" }
      },
      required: []
    }
  },
  {
    name: "seed_spec",
    description: "Fetch the latest Cloudflare OpenAPI spec from GitHub and rebuild the search index in R2. Run any time you want to pick up new endpoints.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "list_d1_databases",
    description: "List all D1 databases in the account (name and uuid).",
    inputSchema: { type: "object", properties: { account_id: { type: "string" } }, required: [] }
  },
  {
    name: "resolve_d1_database",
    description: "Look up a D1 database's uuid by its name, so you don't have to memorize database ids.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "D1 database name" }, account_id: { type: "string" } },
      required: ["name"]
    }
  },
  {
    name: "execute_d1_sql",
    description: "Run one write/DDL SQL statement (INSERT, UPDATE, CREATE TABLE, etc.) against a D1 database. Exactly one statement per call — call it once per statement for bulk operations.",
    inputSchema: {
      type: "object",
      properties: {
        database_name: { type: "string", description: "D1 database name (resolved automatically)" },
        database_id: { type: "string", description: "D1 database uuid, if already known" },
        sql: { type: "string", description: "Exactly one SQL statement" },
        params: { type: "array", description: "Optional bound parameters" },
        account_id: { type: "string" }
      },
      required: ["sql"]
    }
  },
  {
    name: "query_d1_sql",
    description: "Run one read SQL statement (SELECT) against a D1 database and return rows.",
    inputSchema: {
      type: "object",
      properties: {
        database_name: { type: "string", description: "D1 database name (resolved automatically)" },
        database_id: { type: "string", description: "D1 database uuid, if already known" },
        sql: { type: "string", description: "Exactly one SQL statement" },
        params: { type: "array", description: "Optional bound parameters" },
        account_id: { type: "string" }
      },
      required: ["sql"]
    }
  },
  {
    name: "list_d1_tables",
    description: "List table names in a D1 database.",
    inputSchema: {
      type: "object",
      properties: {
        database_name: { type: "string" },
        database_id: { type: "string" },
        account_id: { type: "string" }
      },
      required: []
    }
  },
  {
    name: "get_worker_settings",
    description: "Read a worker's current bindings (names and types, not secret values) and compatibility settings. Run this before deploy_worker_with_bindings/deploy_worker_from_github/setup_worker_with_d1_schema on an existing worker to see exactly what would be lost if not replicated, since Cloudflare's deploy API fully replaces bindings rather than merging.",
    inputSchema: {
      type: "object",
      properties: { script_name: { type: "string" }, account_id: { type: "string" } },
      required: ["script_name"]
    }
  },
  {
    name: "deploy_worker_with_bindings",
    description: "Deploy a Worker from inline script content (module syntax: export default {fetch}). " + BINDINGS_DOC + " Workers.dev subdomain is auto-enabled unless enable_subdomain=false.",
    inputSchema: {
      type: "object",
      properties: {
        script_name: { type: "string" },
        script_content: { type: "string", description: "Full module-syntax worker source" },
        bindings: { type: "array" },
        compatibility_date: { type: "string" },
        enable_subdomain: { type: "boolean", description: "Default true" },
        account_id: { type: "string" }
      },
      required: ["script_name", "script_content"]
    }
  },
  {
    name: "deploy_worker_from_github",
    description: "Fetch a Worker's module source directly from a GitHub repo (server-side, no inlining needed) and deploy it. " + BINDINGS_DOC + " Workers.dev subdomain is auto-enabled unless enable_subdomain=false. Requires the GITHUB_TOKEN binding (repos are private).",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        branch: { type: "string", description: "Defaults to the repo's default branch" },
        file_path: { type: "string", description: "e.g. workers/my-worker/src/index.js" },
        script_name: { type: "string" },
        bindings: { type: "array" },
        compatibility_date: { type: "string" },
        enable_subdomain: { type: "boolean", description: "Default true" },
        account_id: { type: "string" }
      },
      required: ["owner", "repo", "file_path", "script_name"]
    }
  },
  {
    name: "setup_worker_with_d1_schema",
    description: "One-shot: resolve-or-create a D1 database, fetch a Worker's module source from GitHub, deploy it with a D1 binding (plus optional plain_text vars), enable its workers.dev subdomain, optionally run a schema SQL file from the same repo statement-by-statement, and optionally smoke-test the live URL. Returns a consolidated result for all steps.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        branch: { type: "string" },
        worker_file_path: { type: "string" },
        script_name: { type: "string" },
        database_name: { type: "string", description: "Created if it doesn't already exist" },
        schema_file_path: { type: "string", description: "Optional .sql file in the same repo, split and run one statement at a time" },
        vars: { type: "object", description: "Optional plain_text bindings, e.g. {DEMO_SLUG: 'ccs-services'}" },
        d1_binding_name: { type: "string", description: "Default 'DB'" },
        smoke_test: {
          type: "object",
          description: "Optional {method, path, body} to hit the deployed worker's own URL after deploy",
          properties: { method: { type: "string" }, path: { type: "string" }, body: { type: "object" } }
        },
        compatibility_date: { type: "string" },
        account_id: { type: "string" }
      },
      required: ["owner", "repo", "worker_file_path", "script_name", "database_name"]
    }
  }
];

function j(v, s = 200) { return Response.json(v, { status: s, headers: CORS }); }
function rr(id, result) { return j({ jsonrpc: "2.0", id, result }); }
function tr(id, text) { return j({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text }] } }); }
function er(id, c, m) { return j({ jsonrpc: "2.0", id, error: { code: c, message: m } }); }

function truncate(str) {
  if (str.length <= MAX_RESPONSE_CHARS) return str;
  return str.slice(0, MAX_RESPONSE_CHARS) +
    `\n...[truncated, ${str.length} total chars. Narrow the query, request fewer fields, or use pagination params like per_page/page/cursor.]`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithRetry(url, opts, maxRetries = 3) {
  let res;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    res = await fetch(url, opts);
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt === maxRetries) return res;
    const retryAfterHeader = res.headers.get("retry-after");
    let delayMs = retryAfterHeader ? parseFloat(retryAfterHeader) * 1000 : 1000 * Math.pow(2, attempt);
    if (!Number.isFinite(delayMs)) delayMs = 2000;
    await sleep(Math.min(delayMs, 15000));
  }
  return res;
}

function extractCfRateLimit(headers) {
  const remaining = headers.get("x-ratelimit-remaining");
  const limit = headers.get("x-ratelimit-limit");
  if (remaining === null && limit === null) return null;
  return { remaining: remaining !== null ? Number(remaining) : null, limit: limit !== null ? Number(limit) : null };
}

const SMOKE_RETRY_DELAYS_MS = [1500, 2500, 4000, 6000];

function looksLikeSubdomainPropagationFailure(status, text) {
  return status === 404 && typeof text === "string" && text.includes("error code: 1042");
}

async function fetchWithSubdomainRetry(testUrl, smokeTest) {
  let last = null;
  for (let attempt = 0; attempt < SMOKE_RETRY_DELAYS_MS.length; attempt++) {
    await sleep(SMOKE_RETRY_DELAYS_MS[attempt]);
    try {
      const res = await fetch(testUrl, {
        method: smokeTest.method || "GET",
        headers: smokeTest.body ? { "Content-Type": "application/json" } : undefined,
        body: smokeTest.body ? JSON.stringify(smokeTest.body) : undefined
      });
      const text = await res.text();
      last = { url: testUrl, status: res.status, body: text.slice(0, 2000), attempt: attempt + 1 };
      if (!looksLikeSubdomainPropagationFailure(res.status, text)) return last;
    } catch (e) {
      last = { url: testUrl, error: e.message, attempt: attempt + 1 };
    }
  }
  last.note = "Still failing after retries with backoff — may not be a propagation delay; investigate directly.";
  return last;
}

function splitStatements(sqlText) {
  return sqlText
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"));
}

async function buildIndex(env) {
  const res = await fetch(SPEC_URL, { headers: { "User-Agent": WORKER_NAME } });
  if (!res.ok) throw new Error(`Spec fetch failed: HTTP ${res.status}`);
  const spec = await res.json();
  const index = [];
  const tagSet = new Set();
  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, op] of Object.entries(methods)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
      const tags = op.tags || [];
      tags.forEach(t => tagSet.add(t));
      index.push({
        method: method.toUpperCase(),
        path,
        tags,
        summary: op.summary || op.description || "",
        operationId: op.operationId || ""
      });
    }
  }
  if (!env.SPEC) throw new Error("SPEC R2 binding missing");
  await env.SPEC.put(SPEC_KEY, JSON.stringify(index));
  return { ok: true, endpoint_count: index.length, tag_count: tagSet.size, tags: Array.from(tagSet).sort() };
}

async function loadIndex(env) {
  if (!env.SPEC) throw new Error("SPEC R2 binding missing");
  const obj = await env.SPEC.get(SPEC_KEY);
  if (!obj) throw new Error("Spec index not seeded yet. Run seed_spec first.");
  return JSON.parse(await obj.text());
}

function stableDocId(url) {
  return String(url || "").replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 180);
}

function normalizeDocUrl(href, base) {
  try { return new URL(href, base || CF_DOCS_DEFAULT_INDEX).toString(); } catch { return null; }
}

function parseLlmsLinks(text, base) {
  const links = [];
  for (const m of String(text || "").matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    const title = m[1].trim();
    const url = normalizeDocUrl(m[2].trim(), base);
    if (url) links.push({ title, url });
  }
  for (const m of String(text || "").matchAll(/https?:\/\/[^\s)]+/g)) {
    const url = normalizeDocUrl(m[0], base);
    if (url && !links.some(l => l.url === url)) links.push({ title: url.split("/").filter(Boolean).slice(-2).join(" / "), url });
  }
  return links;
}

function docsTerms(query) {
  return String(query || "").toLowerCase().split(/[^a-z0-9_./-]+/).filter(t => t.length > 1).slice(0, 24);
}

function scoreDoc(doc, terms) {
  const hay = `${doc.title || ""} ${doc.url || ""} ${doc.product || ""} ${doc.text || ""}`.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (!term) continue;
    const hits = hay.split(term).length - 1;
    if (hits) score += hits * (term.length > 4 ? 3 : 1);
    if (String(doc.title || "").toLowerCase().includes(term)) score += 8;
    if (String(doc.url || "").toLowerCase().includes(term)) score += 5;
  }
  return score;
}

function docSnippet(text, terms, chars = 700) {
  const source = String(text || "");
  const lower = source.toLowerCase();
  let pos = -1;
  for (const t of terms) { pos = lower.indexOf(t); if (pos >= 0) break; }
  if (pos < 0) pos = 0;
  const start = Math.max(0, pos - Math.floor(chars / 3));
  return source.slice(start, start + chars).replace(/\s+/g, " ").trim();
}

async function loadDocsIndex(env) {
  if (!env.SPEC) throw new Error("SPEC R2 binding missing");
  const obj = await env.SPEC.get(CF_DOCS_INDEX_KEY);
  if (!obj) return { version: 0, docs: [], updated_at: null };
  return JSON.parse(await obj.text());
}

async function readCachedDoc(env, docId) {
  const obj = await env.SPEC.get(`${CF_DOCS_DOC_PREFIX}${docId}.json`);
  return obj ? JSON.parse(await obj.text()) : null;
}

async function writeCachedDoc(env, doc) {
  await env.SPEC.put(`${CF_DOCS_DOC_PREFIX}${doc.id}.json`, JSON.stringify(doc, null, 2));
}

async function refreshCloudflareDocs(env, args = {}) {
  if (!env.SPEC) throw new Error("SPEC R2 binding missing");
  const indexUrl = args.index_url || CF_DOCS_DEFAULT_INDEX;
  const product = String(args.product || "").toLowerCase();
  const limit = Math.max(1, Math.min(Number(args.limit) || 20, CF_DOCS_MAX_DOCS));
  const indexRes = await fetch(indexUrl, { headers: { "User-Agent": WORKER_NAME, "Accept": "text/markdown,text/plain,*/*" } });
  if (!indexRes.ok) throw new Error(`Cloudflare docs index fetch failed: HTTP ${indexRes.status}`);
  const indexText = await indexRes.text();
  let links = parseLlmsLinks(indexText, indexUrl).filter(l => /developers\.cloudflare\.com/.test(l.url));
  if (product) links = links.filter(l => `${l.title} ${l.url}`.toLowerCase().includes(product));
  links = links.slice(0, limit);
  const existing = await loadDocsIndex(env);
  const byId = new Map((existing.docs || []).map(d => [d.id, d]));
  const fetched = [];
  const skipped = [];
  for (const link of links) {
    const id = stableDocId(link.url);
    if (!args.force && byId.has(id)) { skipped.push(id); continue; }
    const res = await fetch(link.url, { headers: { "User-Agent": WORKER_NAME, "Accept": "text/markdown,text/plain,text/html,*/*" } });
    if (!res.ok) { fetched.push({ id, url: link.url, ok: false, status: res.status }); continue; }
    let text = await res.text();
    if (text.length > CF_DOCS_MAX_DOC_CHARS) text = text.slice(0, CF_DOCS_MAX_DOC_CHARS);
    const doc = { id, title: link.title, url: link.url, product: product || null, text, fetched_at: new Date().toISOString(), chars: text.length };
    await writeCachedDoc(env, doc);
    byId.set(id, { id, title: doc.title, url: doc.url, product: doc.product, fetched_at: doc.fetched_at, chars: doc.chars });
    fetched.push({ id, url: link.url, ok: true, chars: text.length });
  }
  const next = { version: (existing.version || 0) + 1, updated_at: new Date().toISOString(), index_url: indexUrl, docs: Array.from(byId.values()) };
  await env.SPEC.put(CF_DOCS_INDEX_KEY, JSON.stringify(next, null, 2));
  return { ok: true, index_url: indexUrl, product: product || null, fetched_count: fetched.filter(f => f.ok).length, failed_count: fetched.filter(f => !f.ok).length, skipped_count: skipped.length, docs_total: next.docs.length, fetched };
}

async function searchCloudflareDocs(env, args = {}) {
  const query = String(args.query || "").trim();
  if (!query) throw new Error("query is required");
  const product = String(args.product || "").toLowerCase();
  const limit = Math.max(1, Math.min(Number(args.limit) || 5, 10));
  const index = await loadDocsIndex(env);
  const terms = docsTerms(query);
  const results = [];
  for (const meta of index.docs || []) {
    if (product && !`${meta.title} ${meta.url} ${meta.product || ""}`.toLowerCase().includes(product)) continue;
    const doc = await readCachedDoc(env, meta.id);
    if (!doc) continue;
    const score = scoreDoc(doc, terms);
    if (score > 0) results.push({ doc_id: doc.id, title: doc.title, url: doc.url, product: doc.product, score, snippet: docSnippet(doc.text, terms), structured_claims: structuredDocClaims(doc, terms, 3), fetched_at: doc.fetched_at });
  }
  results.sort((a, b) => b.score - a.score);
  return { ok: true, query, product: product || null, docs_indexed: (index.docs || []).length, results: results.slice(0, limit), how_to_refresh: "Call refresh_cloudflare_docs with product:'d1' or product:'workers' if results are empty or stale." };
}

function sentenceSplit(text) {
  return String(text || "").replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
}

function structuredDocClaims(doc, terms, limit = 4) {
  const sentences = sentenceSplit(doc.text || "");
  const scored = sentences.map(sentence => {
    const lower = sentence.toLowerCase();
    const hits = terms.filter(t => lower.includes(t));
    return { sentence, hits, score: hits.length + (hits.some(t => t.length > 5) ? 1 : 0) };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  return scored.map(x => ({
    claim: x.sentence.slice(0, 260),
    source_title: doc.title,
    source_url: doc.url,
    supporting_excerpt: x.sentence.slice(0, 500),
    confidence: x.hits.length >= 2 ? "high" : "medium"
  }));
}

function focusedDocExcerpt(doc, query, maxChars) {
  const terms = docsTerms(query || doc.title || "");
  const text = String(doc.text || "").replace(/\s+/g, " ").trim();
  let pos = -1;
  for (const term of terms) { pos = text.toLowerCase().indexOf(term); if (pos >= 0) break; }
  if (pos < 0) pos = 0;
  const start = Math.max(0, pos - Math.floor(maxChars / 3));
  return text.slice(start, start + maxChars).trim();
}

async function getCloudflareDoc(env, args = {}) {
  const doc = await readCachedDoc(env, args.doc_id);
  if (!doc) throw new Error("Cached doc not found. Run refresh_cloudflare_docs first.");
  const max = Math.max(500, Math.min(Number(args.max_chars) || 8000, 12000));
  return { ok: true, safe_mode: "capped_doc_preview", doc_id: doc.id, title: doc.title, url: doc.url, product: doc.product, fetched_at: doc.fetched_at, chars: doc.chars, text: String(doc.text || "").slice(0, max), safer_alternative: "get_cloudflare_doc_excerpt" };
}

async function getCloudflareDocExcerpt(env, args = {}) {
  const doc = await readCachedDoc(env, args.doc_id);
  if (!doc) throw new Error("Cached doc not found. Run refresh_cloudflare_docs first.");
  const max = Math.max(300, Math.min(Number(args.max_chars) || 1800, 5000));
  const query = String(args.query || doc.title || "");
  const terms = docsTerms(query);
  return {
    ok: true,
    safe_mode: "focused_excerpt",
    doc_id: doc.id,
    title: doc.title,
    url: doc.url,
    product: doc.product,
    query,
    excerpt: focusedDocExcerpt(doc, query, max),
    structured_claims: structuredDocClaims(doc, terms, 6)
  };
}

function docsProductForRequest(request, args = {}) {
  if (args.docs_product) return String(args.docs_product).toLowerCase();
  const text = String(request || "").toLowerCase();
  if (d1Requested(request)) return "d1";
  if (workerSettingsRequested(request) || /\b(worker|workers|script settings|worker settings|bindings?|wrangler|deploy)\b/i.test(text)) return "workers";
  if (/\b(r2|bucket|buckets)\b/i.test(text)) return "r2";
  if (/\b(kv|namespace|namespaces)\b/i.test(text)) return "kv";
  if (/\b(vectorize|vector index|embeddings?)\b/i.test(text)) return "vectorize";
  return "";
}

function docsQueryForRequest(request, args = {}) {
  const text = String(request || "").trim();
  const product = docsProductForRequest(request, args);
  if (product === "workers") return `Workers scripts settings bindings deploy secrets environment compatibility Worker deploy bindings replace ${text}`.trim();
  if (product === "d1") return `D1 migrations sqlite_master migration ledger one statement SQL bindings limits ${text}`.trim();
  if (product === "r2") return `R2 bucket binding Worker storage ${text}`.trim();
  if (product === "kv") return `Workers KV namespace binding ${text}`.trim();
  if (product === "vectorize") return `Vectorize index binding Workers AI embeddings ${text}`.trim();
  return text;
}

function docLooksLikeProduct(doc, product) {
  if (!product) return true;
  const lower = `${doc.title || ""} ${doc.url || ""} ${doc.product || ""}`.toLowerCase();
  if (product === "workers") return lower.includes("/workers/") || lower.includes("worker") || lower.includes("wrangler");
  if (product === "d1") return lower.includes("/d1/") || lower.includes("d1");
  if (product === "r2") return lower.includes("/r2/") || lower.includes("r2");
  if (product === "kv") return lower.includes("/kv/") || lower.includes("kv");
  if (product === "vectorize") return lower.includes("/vectorize/") || lower.includes("vectorize");
  return lower.includes(product);
}

async function docsForAsk(env, request, limit = 3, args = {}) {
  const product = docsProductForRequest(request, args);
  const query = docsQueryForRequest(request, args);
  try {
    let results = [];
    if (product) {
      const scoped = await searchCloudflareDocs(env, { query, product, limit });
      results = scoped.results || [];
    }
    if (!results.length) {
      const generic = await searchCloudflareDocs(env, { query, limit: Math.max(limit, 5) });
      results = generic.results || [];
    }
    if (product) {
      const filtered = results.filter(d => docLooksLikeProduct(d, product));
      if (filtered.length) results = filtered;
      else if (product === "workers") results = [];
    }
    return results.slice(0, limit);
  } catch { return []; }
}

async function cfApi(env, method, path, query, body, accountIdOverride) {
  if (!env.CF_API_TOKEN) throw new Error("CF_API_TOKEN binding missing");
  const aid = accountIdOverride || env.CF_ACCOUNT_ID || "";
  let resolvedPath = path.replaceAll("{account_id}", aid);
  let url = `https://api.cloudflare.com/client/v4${resolvedPath}`;
  if (query && Object.keys(query).length) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) qs.set(k, String(v));
    url += `${url.includes("?") ? "&" : "?"}${qs.toString()}`;
  }
  const m = (method || "GET").toUpperCase();
  const opts = { method: m, headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, "Content-Type": "application/json" } };
  if (body !== undefined && !["GET", "HEAD"].includes(m)) opts.body = JSON.stringify(body);
  const res = await fetchWithRetry(url, opts);
  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw: text }; }
  return { status: res.status, data: parsed, rate_limit: extractCfRateLimit(res.headers) };
}

async function githubFetchRaw(env, owner, repo, path, branch) {
  if (!env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN binding missing — required for GitHub-source tools");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}${branch ? `?ref=${encodeURIComponent(branch)}` : ""}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.raw",
      "User-Agent": WORKER_NAME
    }
  });
  if (!res.ok) throw new Error(`GitHub fetch failed: HTTP ${res.status} for ${owner}/${repo}/${path}@${branch || "default"}`);
  return await res.text();
}

async function putScript(env, scriptName, moduleContent, bindings, compatibilityDate, accountId, compatibilityFlags) {
  if (!env.CF_API_TOKEN) throw new Error("CF_API_TOKEN binding missing");
  const aid = accountId || env.CF_ACCOUNT_ID;
  const metadata = {
    main_module: "worker.js",
    compatibility_date: compatibilityDate || DEFAULT_COMPAT_DATE,
    compatibility_flags: compatibilityFlags || [],
    bindings: bindings || []
  };
  const form = new FormData();
  form.append("metadata", JSON.stringify(metadata));
  form.append("worker.js", new Blob([moduleContent], { type: "application/javascript+module" }), "worker.js");
  const url = `https://api.cloudflare.com/client/v4/accounts/${aid}/workers/scripts/${scriptName}`;
  const res = await fetch(url, { method: "PUT", headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` }, body: form });
  const json = await res.json();
  if (!json.success) throw new Error(`Deploy failed: ${JSON.stringify(json.errors)}`);
  return json.result;
}

async function getWorkersSubdomain(env, accountId) {
  const r = await cfApi(env, "GET", "/accounts/{account_id}/workers/subdomain", null, null, accountId);
  if (!r.data.success) throw new Error(`Could not read workers subdomain: ${JSON.stringify(r.data.errors)}`);
  return r.data.result.subdomain;
}

async function enableSubdomainFor(env, scriptName, accountId) {
  const r = await cfApi(env, "POST", `/accounts/{account_id}/workers/scripts/${scriptName}/subdomain`, null, { enabled: true, previews_enabled: true }, accountId);
  if (!r.data.success) return { ok: false, errors: r.data.errors };
  return { ok: true, result: r.data.result };
}

async function getWorkerSettings(env, scriptName, accountId) {
  const r = await cfApi(env, "GET", `/accounts/{account_id}/workers/scripts/${scriptName}/settings`, null, null, accountId);
  if (!r.data.success) throw new Error(`Could not read worker settings: ${JSON.stringify(r.data.errors)}`);
  return r.data.result;
}

async function listD1(env, accountId) {
  let all = [];
  let page = 1;
  const perPage = 100;
  let totalCount = null;
  do {
    const r = await cfApi(env, "GET", `/accounts/{account_id}/d1/database?per_page=${perPage}&page=${page}`, null, null, accountId);
    if (!r.data.success) throw new Error(`D1 list failed: ${JSON.stringify(r.data.errors)}`);
    const batch = r.data.result || [];
    all = all.concat(batch);
    totalCount = r.data.result_info?.total_count;
    page++;
    if (batch.length < perPage) break;
  } while (page <= MAX_PAGINATION_PAGES && (totalCount === undefined || totalCount === null || all.length < totalCount));
  return all;
}

async function resolveD1Id(env, args, accountId) {
  if (args.database_id) return args.database_id;
  if (!args.database_name) throw new Error("database_id or database_name is required");
  const dbs = await listD1(env, accountId);
  const match = dbs.find(d => d.name.toLowerCase() === args.database_name.toLowerCase());
  if (!match) throw new Error(`No D1 database named "${args.database_name}" found. Available: ${dbs.map(d => d.name).join(", ")}`);
  return match.uuid;
}

async function resolveOrCreateD1(env, databaseName, accountId) {
  const dbs = await listD1(env, accountId);
  const match = dbs.find(d => d.name.toLowerCase() === databaseName.toLowerCase());
  if (match) return { id: match.uuid, created: false };
  const r = await cfApi(env, "POST", "/accounts/{account_id}/d1/database", null, { name: databaseName }, accountId);
  if (!r.data.success) throw new Error(`D1 create failed: ${JSON.stringify(r.data.errors)}`);
  return { id: r.data.result.uuid, created: true };
}

async function d1Query(env, databaseId, sql, params, accountId) {
  const stmts = splitStatements(sql);
  if (stmts.length > 1) throw new Error(`Exactly one SQL statement is allowed per call; received ${stmts.length}. Call once per statement.`);
  const r = await cfApi(env, "POST", `/accounts/{account_id}/d1/database/${databaseId}/query`, null, { sql, params: params || [] }, accountId);
  if (!r.data.success) throw new Error(`D1 query failed: ${JSON.stringify(r.data.errors)}`);
  return r.data.result;
}

function d1Rows(result) {
  return result?.[0]?.results || result?.results || [];
}

function sqlIdent(name) {
  return `"${String(name || "").replaceAll('"', '""')}"`;
}

function migrationLedgerNames(rows) {
  const patterns = [/migration/i, /schema.*version/i, /drizzle/i, /knex/i, /prisma/i, /_cf/i];
  return (rows || []).filter(r => r.type === "table" && patterns.some(rx => rx.test(String(r.name || ""))));
}

function splitSqlPreview(sqlText) {
  if (!sqlText) return null;
  const statements = splitStatements(sqlText);
  return {
    statement_count: statements.length,
    one_statement_per_call_required: true,
    execute_allowed_here: false,
    statements: statements.slice(0, 40).map((sql, i) => ({ index: i, chars: sql.length, preview: sql.slice(0, 220) }))
  };
}

function d1BindingDatabaseId(binding = {}) {
  return binding.id || binding.database_id || binding.databaseId || null;
}

function d1BindingDatabaseName(binding = {}) {
  return binding.database_name || binding.database || null;
}

function d1BindingsFromWorkerSettings(settings = {}) {
  return (settings?.bindings || []).filter(b => String(b.type || "").toLowerCase().includes("d1"));
}

function bindingMatches(settings, target) {
  const bindings = d1BindingsFromWorkerSettings(settings);
  return bindings.filter(b => {
    if (!target) return true;
    const id = d1BindingDatabaseId(b);
    const dbName = d1BindingDatabaseName(b) || b.name;
    return id === target.uuid || String(dbName || "").toLowerCase() === String(target.name || "").toLowerCase();
  });
}

async function d1MigrationPreflight(env, args) {
  const accountId = args.account_id;
  const playbook = [
    "Resolve account and confirm API auth",
    "List D1 databases visible to the token",
    "Resolve target database by name or UUID",
    "Inspect Worker bindings when script_name is provided",
    "Read sqlite_master for tables, indexes, triggers, and views",
    "Optionally inspect table_info, index_list, and foreign_key_list",
    "Detect likely migration ledger tables",
    "Split proposed SQL into one-statement units without executing",
    "Require explicit confirmation before any write/DDL execution",
    "Write an audit receipt after execution in a separate workflow"
  ];
  const databases = await listD1(env, accountId);
  let target = null;
  const requestedDatabaseName = placeholderD1DatabaseName(args.database_name) ? null : args.database_name;
  if (args.database_id) target = databases.find(d => d.uuid === args.database_id) || { uuid: args.database_id, name: requestedDatabaseName || null, unresolved_name: !requestedDatabaseName };
  else if (requestedDatabaseName) target = databases.find(d => String(d.name || "").toLowerCase() === String(requestedDatabaseName).toLowerCase()) || null;

  let worker = null;
  if (args.script_name) {
    const settings = await getWorkerSettings(env, args.script_name, accountId);
    const allD1Bindings = bindingMatches(settings, null);
    worker = {
      script_name: args.script_name,
      compatibility_date: settings.compatibility_date,
      bindings: settings.bindings || [],
      d1_bindings: target ? bindingMatches(settings, target) : allD1Bindings
    };
    if (!target && allD1Bindings.length === 1) {
      const binding = allD1Bindings[0];
      const resolvedId = d1BindingDatabaseId(binding);
      if (resolvedId) {
        target = databases.find(d => d.uuid === resolvedId) || {
          uuid: resolvedId,
          name: d1BindingDatabaseName(binding),
          unresolved_name: !d1BindingDatabaseName(binding)
        };
        worker.bound_d1_resolution = {
          status: "resolved_single_binding",
          binding_name: binding.name,
          database_id: resolvedId,
          database_name: target.name || d1BindingDatabaseName(binding) || null
        };
        worker.d1_bindings = bindingMatches(settings, target);
      }
    } else if (!target && allD1Bindings.length > 1) {
      worker.bound_d1_resolution = {
        status: "ambiguous_multiple_bindings",
        choices: allD1Bindings.map(b => ({ name: b.name, database_id: d1BindingDatabaseId(b), database_name: d1BindingDatabaseName(b) }))
      };
    } else if (!target && allD1Bindings.length === 0) {
      worker.bound_d1_resolution = { status: "no_d1_bindings" };
    }
  }

  let schema = null;
  if (target?.uuid) {
    const masterSql = "SELECT name, type, sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger', 'view') ORDER BY type, name";
    const master = d1Rows(await d1Query(env, target.uuid, masterSql, null, accountId));
    const ledgers = migrationLedgerNames(master);
    schema = {
      query: masterSql,
      object_count: master.length,
      objects: master.slice(0, 200),
      migration_ledger_candidates: ledgers.map(r => ({ name: r.name, sql: r.sql }))
    };
    if (args.include_table_details) {
      const max = Math.max(1, Math.min(Number(args.max_table_details) || 5, 20));
      const tables = master.filter(r => r.type === "table").slice(0, max);
      schema.table_details = [];
      for (const table of tables) {
        const name = table.name;
        const columns = d1Rows(await d1Query(env, target.uuid, `PRAGMA table_info(${sqlIdent(name)})`, null, accountId));
        const indexes = d1Rows(await d1Query(env, target.uuid, `PRAGMA index_list(${sqlIdent(name)})`, null, accountId));
        const foreign_keys = d1Rows(await d1Query(env, target.uuid, `PRAGMA foreign_key_list(${sqlIdent(name)})`, null, accountId));
        schema.table_details.push({ name, columns, indexes, foreign_keys });
      }
    }
  }

  const tables = (schema?.objects || []).filter(o => o.type === "table").map(o => o.name);
  const currentBindings = worker?.bindings || [];
  const d1Bindings = worker?.d1_bindings || [];
  const warnings = [
    "Worker deploy will replace all bindings; inspect current bindings before any deploy.",
    "D1 SQL must be executed one statement per call.",
    "This preflight is read-only and does not execute migration SQL."
  ];
  if (!target) warnings.push("No target D1 database resolved yet; pass database_name, database_id, or a Worker with exactly one D1 binding before schema inspection.");
  if (args.script_name && !worker) warnings.push("Worker settings could not be inspected.");
  if (args.script_name && worker?.bound_d1_resolution?.status === "ambiguous_multiple_bindings") warnings.push("Multiple D1 bindings found on the inspected Worker; pass database_id or a specific binding/database name.");
  if (args.script_name && worker && !d1Bindings.length) warnings.push("No D1 binding matched the target database on the inspected Worker.");
  if (schema?.migration_ledger_candidates?.length) warnings.push("Migration ledger table candidate found; inspect it before applying new migrations.");

  return {
    ok: true,
    mode: "read_only_d1_migration_preflight",
    canonical_entrypoint: true,
    playbook,
    account_id: accountId ? "provided" : "default",
    database_found: Boolean(target?.uuid),
    database_id: target?.uuid || null,
    database_name: target?.name || args.database_name || null,
    worker_found: Boolean(worker),
    worker_name: args.script_name || null,
    current_bindings: currentBindings,
    d1_bindings: d1Bindings,
    bound_d1_resolution: worker?.bound_d1_resolution || null,
    tables,
    warnings,
    recommended_next_tools: [
      "get_worker_settings",
      "resolve_d1_database",
      "list_d1_tables",
      "query_d1_sql",
      "execute_d1_sql"
    ],
    recommended_execution_sequence: [
      "get_worker_settings",
      "resolve_d1_database",
      "list_d1_tables",
      "query_d1_sql sqlite_master",
      "split migration SQL",
      "execute_d1_sql one statement at a time only after confirmation",
      "query_d1_sql to verify",
      "write audit receipt"
    ],
    databases: { count: databases.length, matches: target ? [target] : [], list_preview: databases.slice(0, 50).map(d => ({ name: d.name, uuid: d.uuid, created_at: d.created_at, file_size: d.file_size })) },
    target_database: target,
    worker,
    schema,
    sql_split: splitSqlPreview(args.migration_sql),
    safety: {
      mutates_cloudflare: false,
      executes_sql: false,
      write_or_ddl_requires: "Use execute_d1_sql separately, one statement per call, only after explicit confirmation."
    }
  };
}

function mutationMethod(method) {
  return !["GET", "HEAD"].includes(String(method || "GET").toUpperCase());
}

function scoreEndpoint(endpoint, terms) {
  const hay = `${endpoint.method} ${endpoint.path} ${(endpoint.tags || []).join(" ")} ${endpoint.summary || ""} ${endpoint.operationId || ""}`.toLowerCase();
  let score = 0;
  for (const term of terms) if (term && hay.includes(term)) score += term.length > 3 ? 3 : 1;
  if (endpoint.method === "GET") score += 2;
  return score;
}

function productIntentFilteredEndpoints(index, request) {
  const endpoints = index || [];
  if (d1Requested(request)) {
    const d1 = endpoints.filter(e => String(e.path || "").includes("/d1/") || (e.tags || []).some(t => String(t).toLowerCase() === "d1"));
    if (d1.length) return d1;
  }
  return endpoints;
}

function endpointCandidates(index, request, limit = 8) {
  const terms = String(request || "").toLowerCase().split(/[^a-z0-9_./-]+/).filter(Boolean).slice(0, 18);
  return productIntentFilteredEndpoints(index, request).map(e => ({ ...e, _score: scoreEndpoint(e, terms) }))
    .filter(e => e._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, Math.max(1, Math.min(Number(limit) || 8, 20)))
    .map(({ _score, ...e }) => e);
}

function extractJson(text) {
  const raw = String(text || "").trim();
  try { return JSON.parse(raw); } catch {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}

async function aiSelectCloudflare(env, request, candidates, args) {
  if (!env.AI) return null;
  const skillLines = (args.skills || []).map(s => `SKILL [${s.id}]: ${s.guidance}`);
  const docsLines = (args.docs_hits || []).map((d, i) => `DOC [${i + 1}] ${d.title} ${d.url}: ${String(d.snippet || "").slice(0, 700)}`);
  const prompt = [
    "You are selecting a Cloudflare API v4 endpoint for an MCP worker.",
    "Return strict JSON only with keys: method,path,query,body,reason.",
    "Default to safe read-only GET endpoints. Do not choose POST/PUT/PATCH/DELETE unless allow_mutation is true.",
    "Preserve literal placeholders such as {account_id} in paths when candidates include them.",
    `allow_mutation=${Boolean(args.allow_mutation)}`,
    `default_account_id_present=${Boolean(args.account_id || env.CF_ACCOUNT_ID)}`,
    `request=${request}`,
    ...skillLines,
    ...docsLines,
    `candidates=${JSON.stringify(candidates).slice(0, 12000)}`
  ].join("\n");
  const out = await env.AI.run(AI_MODEL, { messages: [{ role: "user", content: prompt }], max_tokens: 900 });
  return extractJson(out.response || out.result || out.output_text || "");
}

function compactCloudflareData(data) {
  if (Array.isArray(data)) return data.slice(0, 20);
  if (!data || typeof data !== "object") return data;
  const base = data.result !== undefined ? data.result : data;
  if (Array.isArray(base)) return { ...data, result: base.slice(0, 20) };
  if (!base || typeof base !== "object") return data;
  const keep = {};
  for (const key of ["id", "name", "script_name", "status", "success", "errors", "messages", "result", "result_info", "bindings", "compatibility_date", "compatibility_flags", "subdomain", "hostname", "pattern", "service", "zone_name"]) {
    if (data[key] !== undefined) keep[key] = Array.isArray(data[key]) ? data[key].slice(0, 20) : data[key];
  }
  return Object.keys(keep).length ? keep : data;
}

function unique(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function pathParamNames(path) {
  return unique(Array.from(String(path || "").matchAll(/\{([a-zA-Z0-9_]+)\}/g)).map(m => m[1]));
}

function cleanParamValue(value) {
  return String(value || "")
    .trim()
    .replace(/^["'`]+/, "")
    .replace(/["'`,.;:)\]}]+$/, "");
}

function readArgPathParam(args, name) {
  if (!args || typeof args !== "object") return null;
  const stores = [args.path_params, args.params, args];
  for (const store of stores) {
    if (store && Object.prototype.hasOwnProperty.call(store, name) && store[name] !== undefined && store[name] !== null) {
      const v = cleanParamValue(store[name]);
      if (v) return v;
    }
  }
  return null;
}

function labelVariants(name) {
  const spaced = name.replace(/_/g, " ");
  const dashed = name.replace(/_/g, "-");
  return unique([name, spaced, dashed, name.replace(/_/g, "")]);
}

function extractValueAfterLabels(request, labels) {
  const text = String(request || "");
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`${escaped}\\s*(?:is|=|:)?\\s*(?:exactly\\s+)?["']?([A-Za-z0-9][A-Za-z0-9._:-]{1,160})`, "i"),
      new RegExp(`${escaped}\\s+(?:named|called)\\s+["']?([A-Za-z0-9][A-Za-z0-9._:-]{1,160})`, "i")
    ];
    for (const rx of patterns) {
      const m = text.match(rx);
      if (m) {
        const v = cleanParamValue(m[1]);
        if (v && !["for", "and", "with", "visible", "return", "read", "list"].includes(v.toLowerCase())) return v;
      }
    }
  }
  return null;
}

function extractWorkerScriptName(request, args) {
  const explicit = readArgPathParam(args, "script_name");
  if (explicit) return explicit;
  const text = String(request || "");
  const direct = extractValueAfterLabels(text, ["script_name", "script name", "worker script", "worker", "script"]);
  if (direct && direct.includes("-")) return direct;
  const quoted = text.match(/["'`]([a-z0-9][a-z0-9._-]*-[a-z0-9._-]*[a-z0-9])["'`]/i);
  if (quoted) return cleanParamValue(quoted[1]);
  const hyphenated = text.match(/\b([a-z0-9][a-z0-9._-]*-[a-z0-9._-]*[a-z0-9])\b/i);
  return hyphenated ? cleanParamValue(hyphenated[1]) : null;
}

function extractPathParam(name, request, args) {
  if (name === "script_name") return extractWorkerScriptName(request, args);
  const explicit = readArgPathParam(args, name);
  if (explicit) return explicit;
  if (name === "database_id") {
    const uuid = String(request || "").match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i);
    if (uuid) return uuid[0];
  }
  return extractValueAfterLabels(request, labelVariants(name));
}

function workerSettingsRequested(request) {
  const text = String(request || "").toLowerCase();
  return /\bworker(s)?\b/.test(text) && /\b(settings?|bindings?|compatibility|inspect)\b/.test(text);
}

function dispatchNamespaceRequested(request, args) {
  const text = String(request || "").toLowerCase();
  return Boolean(
    readArgPathParam(args, "dispatch_namespace") ||
    args?.dispatch_namespace ||
    /\bdispatch[_ -]?namespace\b/.test(text) ||
    /\bworkers?\s+for\s+platforms\b/.test(text) ||
    /\bnamespace\s+scripts\b/.test(text)
  );
}

function workerScriptsListRequested(request, args) {
  if (dispatchNamespaceRequested(request, args)) return false;
  const text = String(request || "").toLowerCase();
  const wantsList = /\b(list|show|get|inventory|visible|account|normal)\b/.test(text);
  const mentionsWorkers = /\bworker(s)?\b/.test(text);
  const mentionsSettings = /\b(settings?|bindings?|compatibility|inspect)\b/.test(text);
  return wantsList && mentionsWorkers && !mentionsSettings;
}

function d1Requested(request) {
  const text = String(request || "").toLowerCase();
  return /\bd1\b/.test(text) || (/\bdatabase\b/.test(text) && /\b(sql|query|schema|migration|tables?|inventory)\b/.test(text));
}

function d1ListRequested(request) {
  const text = String(request || "").toLowerCase();
  return /\b(list|show|get|inventory|databases?|dbs?)\b/.test(text) || /\b(schema|migration|sql|query)\b/.test(text);
}

function d1TablesRequested(request) {
  const text = String(request || "").toLowerCase();
  return /\btables?\b/.test(text) && /\bd1\b/.test(text);
}

function endpointFromIndex(index, method, path) {
  return (index || []).find(e => e.method === method && e.path === path) || { method, path, tags: ["workers"], summary: "Worker script settings" };
}

function placeholderD1DatabaseName(value) {
  const v = String(value || "").trim().toLowerCase();
  return !v || ["bound", "attached", "existing", "target", "database", "db", "d1", "worker", "schema", "migration"].includes(v);
}

function boundD1Requested(request, args = {}) {
  const text = String(request || "").toLowerCase();
  return Boolean(args.resolve_bound_d1 || /\b(bound|attached|binding|bindings|from worker|for worker|on worker)\b/.test(text));
}

function specializedToolForRequest(request, args) {
  const text = String(request || "").toLowerCase();
  const wantsD1Migration = d1Requested(request) && /\b(migration|preflight|schema|sql|statement|sqlite_master|tables?|bindings?)\b/.test(text);
  if (!wantsD1Migration) return null;
  const rawDatabaseName = args.database_name || args.d1_database_name || extractValueAfterLabels(request, ["database_name", "database name", "d1 database"]);
  return {
    tool: "d1_migration_preflight",
    reason: "D1 migration/preflight intent is better handled by the canonical D1 migration preflight tool before raw endpoint execution.",
    arguments: {
      database_name: placeholderD1DatabaseName(rawDatabaseName) ? null : rawDatabaseName,
      database_id: args.database_id || extractPathParam("database_id", request, args),
      script_name: args.script_name || extractWorkerScriptName(request, args),
      migration_sql: args.migration_sql || args.sql || null,
      include_table_details: Boolean(args.include_table_details),
      max_table_details: args.max_table_details,
      account_id: args.account_id,
      resolve_bound_d1: boundD1Requested(request, args)
    }
  };
}

function chooseDeterministicEndpoint(index, request, args) {
  const scriptName = extractWorkerScriptName(request, args);
  if (d1Requested(request)) {
    const databaseId = extractPathParam("database_id", request, args);
    if (d1TablesRequested(request) && databaseId) {
      return {
        ...endpointFromIndex(index, "POST", "/accounts/{account_id}/d1/database/{database_id}/query"),
        query: {},
        body: { sql: "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name" },
        reason: "deterministic D1 table inventory route",
        deterministic_path_params: { database_id: databaseId }
      };
    }
    if (databaseId && /\b(info|details|inspect|get|bookmark|time travel)\b/.test(String(request || "").toLowerCase())) {
      return {
        ...endpointFromIndex(index, "GET", "/accounts/{account_id}/d1/database/{database_id}"),
        query: {},
        body: null,
        reason: "deterministic D1 database detail route",
        deterministic_path_params: { database_id: databaseId }
      };
    }
    if (d1ListRequested(request) || !databaseId) {
      return {
        ...endpointFromIndex(index, "GET", "/accounts/{account_id}/d1/database"),
        query: {},
        body: null,
        reason: "deterministic D1 database list route"
      };
    }
  }
  if (workerSettingsRequested(request) && scriptName) {
    return {
      ...endpointFromIndex(index, "GET", "/accounts/{account_id}/workers/scripts/{script_name}/settings"),
      query: {},
      body: null,
      reason: "deterministic worker settings route",
      deterministic_path_params: { script_name: scriptName }
    };
  }
  if (workerScriptsListRequested(request, args)) {
    return {
      ...endpointFromIndex(index, "GET", "/accounts/{account_id}/workers/scripts"),
      query: {},
      body: null,
      reason: "deterministic normal Workers list route"
    };
  }
  return null;
}

function resolvePath(path, request, args, env, preset = {}) {
  const names = pathParamNames(path);
  const rawParams = {};
  for (const name of names) {
    if (name === "account_id") rawParams[name] = args.account_id || env.CF_ACCOUNT_ID || null;
    else rawParams[name] = preset[name] || extractPathParam(name, request, args);
  }
  const required = names.map(name => ({
    name,
    filled: Boolean(rawParams[name]),
    value: name === "account_id" ? (rawParams[name] ? "<account_id>" : null) : rawParams[name]
  }));
  const missing = required.filter(p => !p.filled).map(p => p.name);
  const resolvedPath = String(path || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) => {
    const v = rawParams[name];
    return v ? encodeURIComponent(String(v)) : `{${name}}`;
  });
  let auditPath = resolvedPath;
  if (rawParams.account_id) auditPath = auditPath.replace(encodeURIComponent(String(rawParams.account_id)), "<account_id>");
  return { rawParams, required, missing, resolvedPath, auditPath };
}

function compactCandidates(candidates) {
  return (candidates || []).slice(0, 12).map(c => ({ method: c.method, path: c.path, summary: c.summary, tags: c.tags }));
}

async function loadSkills(env) {
  try {
    if (!env.SPEC) return { version: 0, skills: [], load_error: "SPEC binding missing" };
    const obj = await env.SPEC.get(SKILLS_KEY);
    return obj ? JSON.parse(await obj.text()) : { version: 0, skills: [] };
  } catch (e) {
    return { version: 0, skills: [], load_error: String(e.message || e) };
  }
}

function matchSkillsByRequest(doc, request) {
  const text = String(request || "").toLowerCase();
  return (doc.skills || []).filter(s => s.enabled !== false && (s.triggers || []).some(t => text.includes(String(t).toLowerCase())));
}

function matchSkillsByEndpoint(doc, path) {
  return (doc.skills || []).filter(s => s.enabled !== false && (s.endpoints || []).some(p => String(path || "").startsWith(String(p))));
}

async function upsertSkill(env, args) {
  const skill = args && args.skill;
  if (!skill || !skill.id || !skill.guidance) throw new Error("skill object with at least {id, guidance} required");
  if (!env.SPEC) throw new Error("SPEC R2 binding missing");
  const doc = await loadSkills(env);
  const existing = (doc.skills || []).findIndex(s => s.id === skill.id);
  if (existing >= 0) doc.skills[existing] = { ...doc.skills[existing], ...skill };
  else (doc.skills = doc.skills || []).push(skill);
  doc.version = (doc.version || 0) + 1;
  doc.updated_at = new Date().toISOString();
  doc.worker = WORKER_NAME;
  doc.how_to_extend = doc.how_to_extend || "Copy an existing skill's shape. Write guidance as dense imperative instructions for a small model with no other context. triggers = lowercase substrings of user requests; endpoints = API path prefixes the note should attach to. Keep guidance under ~120 words. Test with ask_cloudflare dry_run=true and check skills_applied in the audit.";
  await env.SPEC.put(SKILLS_KEY, JSON.stringify(doc, null, 2));
  return { ok: true, id: skill.id, version: doc.version, total_skills: doc.skills.length };
}

async function askCloudflare(env, args) {
  const request = String(args.request || "").trim();
  if (!request) throw new Error("request is required");
  const index = await loadIndex(env);
  const skillDoc = await loadSkills(env);
  const requestSkills = matchSkillsByRequest(skillDoc, request);
  const docsHits = await docsForAsk(env, request, args.docs_limit || 3, args);
  const candidates = endpointCandidates(index, request, args.limit || 8);
  const specialized = specializedToolForRequest(request, args);
  if (specialized && args.use_specialized !== false) {
    const toolArgs = Object.fromEntries(Object.entries(specialized.arguments || {}).filter(([, v]) => v !== undefined && v !== null && v !== ""));
    const delegationAudit = {
      selected_tool: specialized.tool,
      reason: specialized.reason,
      tool_arguments: toolArgs,
      skills_applied: requestSkills.map(s => s.id),
      docs_hits: docsHits.map(d => ({ doc_id: d.doc_id, title: d.title, url: d.url, score: d.score, snippet: d.snippet, structured_claims: d.structured_claims || [] })),
      endpoint_candidates: compactCandidates(candidates)
    };
    if (args.dry_run) return { ok: true, dry_run: true, delegated: true, selected_tool: specialized.tool, recommended_next_tool: specialized.tool, reason: specialized.reason, planned_tool_call: { name: specialized.tool, arguments: toolArgs }, audit: delegationAudit };
    const result = await d1MigrationPreflight(env, toolArgs);
    return { ok: true, delegated: true, selected_tool: specialized.tool, recommended_next_tool: null, reason: specialized.reason, result, audit: delegationAudit };
  }
  if (!candidates.length) throw new Error("No candidate Cloudflare endpoints found in spec index. Try seed_spec or a more specific request.");

  const deterministic = chooseDeterministicEndpoint(index, request, args);
  const ai = deterministic ? null : await aiSelectCloudflare(env, request, candidates, { ...args, skills: requestSkills, docs_hits: docsHits }).catch(() => null);
  const choice = deterministic || (ai && candidates.find(c => c.method === ai.method && c.path === ai.path) ? ai : { ...candidates.find(c => c.method === "GET") || candidates[0], query: {}, body: null, reason: "heuristic fallback" });

  if (mutationMethod(choice.method) && !args.allow_mutation) {
    return { ok: false, blocked: true, reason: "Mutation endpoint selected but allow_mutation was not true.", selected: choice, audit: { candidates: compactCandidates(candidates) } };
  }

  const pathResolution = resolvePath(choice.path, request, args, env, choice.deterministic_path_params || {});
  const selected = {
    method: choice.method,
    path: choice.path,
    endpoint_template: choice.path,
    query: choice.query || {},
    body: choice.body || undefined,
    account_id: args.account_id ? "provided" : "default",
    reason: choice.reason || (ai && ai.reason) || "selected"
  };
  const audit = {
    selected_endpoint_template: choice.path,
    extracted_path_params: Object.fromEntries(Object.entries(pathResolution.rawParams).map(([k, v]) => [k, k === "account_id" ? (v ? "<account_id>" : null) : v])),
    required_path_params: pathResolution.required,
    unresolved_path_params: pathResolution.missing,
    final_resolved_path: pathResolution.auditPath,
    query_params: selected.query,
    candidates: compactCandidates(deterministic ? [choice, ...candidates] : candidates),
    skills_applied: requestSkills.map(s => s.id),
    docs_hits: docsHits.map(d => ({ doc_id: d.doc_id, title: d.title, url: d.url, score: d.score, snippet: d.snippet, structured_claims: d.structured_claims || [] })),
    recommended_next_tool: specialized?.tool || null
  };
  const endpointSkills = matchSkillsByEndpoint(skillDoc, choice.path);
  const responseNotes = unique([].concat(requestSkills, endpointSkills).map(s => s.response_note));

  if (pathResolution.missing.length) {
    return { ok: false, error_type: "missing_path_param", missing_params: pathResolution.missing, selected, response_notes: responseNotes, audit };
  }

  if (args.dry_run) return { ok: true, dry_run: true, selected, planned: { ...selected, final_resolved_path: pathResolution.auditPath }, response_notes: responseNotes, audit };

  const res = await cfApi(env, selected.method, pathResolution.resolvedPath, selected.query, selected.body, args.account_id);
  return { ok: res.status >= 200 && res.status < 300, status: res.status, selected, path_params: audit.extracted_path_params, final_resolved_path: audit.final_resolved_path, data: compactCloudflareData(res.data), response_notes: responseNotes, rate_limit: res.rate_limit, audit };
}

function makeLoopId(request) {
  const text = String(request || "");
  let h = 0;
  for (let i = 0; i < text.length; i++) h = Math.imul(31, h) + text.charCodeAt(i) | 0;
  return `cloudloop_${Date.now()}_${Math.abs(h).toString(16)}`;
}

function cloudLoopPacketId(agent, lane) {
  const base = `${agent || "agent"}_${lane || "packet"}`.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `${base}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function makePacket(agent, lane, status, confidence, data = {}) {
  return {
    packet_id: cloudLoopPacketId(agent, lane),
    agent,
    lane,
    status,
    confidence: Math.max(0, Math.min(1, Number(confidence) || 0)),
    direct_claims: data.direct_claims || [],
    inferred_guidance: data.inferred_guidance || [],
    evidence: data.evidence || [],
    unknowns: data.unknowns || [],
    risks: data.risks || [],
    recommended_next_actions: data.recommended_next_actions || [],
    data: data.data || {}
  };
}

function sanitizeCloudLoopArgs(args = {}) {
  const safe = {};
  for (const [key, value] of Object.entries(args || {})) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "account_id") safe[key] = "provided";
    else if (key === "migration_sql") safe[key] = { chars: String(value).length, statement_count: splitStatements(String(value)).length, preview: String(value).slice(0, 220) };
    else if (key === "allow_mutation") safe.allow_mutation_requested = Boolean(value);
    else safe[key] = value;
  }
  safe.allow_mutation_effective = false;
  return safe;
}

function compactLoopToolArgs(args = {}) {
  return Object.fromEntries(Object.entries(args || {}).filter(([, v]) => v !== undefined && v !== null && v !== ""));
}

function redactLoopToolArgs(args = {}) {
  return Object.fromEntries(Object.entries(compactLoopToolArgs(args)).map(([k, v]) => [k, k === "account_id" ? "provided" : v]));
}

function routeCloudLoopRequest(request, args = {}) {
  const requestedDomain = String(args.domain || "auto").toLowerCase();
  const domain = requestedDomain === "github" ? "github" : "cloudflare";
  const mode = args.mode === "read_only" ? "read_only" : "dry_run";
  const specialized = specializedToolForRequest(request, { ...args, allow_mutation: false });
  const d1Intent = Boolean(specialized?.tool === "d1_migration_preflight" || (d1Requested(request) && /\b(migration|preflight|schema|sql|statement|sqlite_master|tables?|bindings?)\b/i.test(String(request || ""))));
  const selectedNextTool = d1Intent ? "d1_migration_preflight" : "ask_cloudflare";
  return {
    domain,
    requested_domain: requestedDomain,
    mode,
    effective_mode: mode === "read_only" ? "read_only" : "dry_run",
    allow_mutation_requested: Boolean(args.allow_mutation),
    allow_mutation_effective: false,
    max_iterations_requested: args.max_iterations || 1,
    max_iterations_effective: 1,
    include_docs: args.include_docs !== false,
    include_runtime: args.include_runtime !== false,
    intents: {
      d1: d1Requested(request),
      d1_migration_or_schema: d1Intent,
      worker_settings: workerSettingsRequested(request),
      deploy_or_binding: /\b(deploy|binding|bindings|secret|secrets|wrangler|worker settings)\b/i.test(String(request || ""))
    },
    selected_next_tool: selectedNextTool,
    specialized_tool: specialized ? { name: specialized.tool, reason: specialized.reason, arguments: redactLoopToolArgs(specialized.arguments || {}) } : null,
    unsupported: requestedDomain === "github"
  };
}

async function cloudForwardDocsPacket(env, request, args = {}) {
  if (args.include_docs === false) {
    return makePacket("DocsEvidenceAgent", "forward", "skipped", 1, { unknowns: ["include_docs was false"] });
  }
  try {
    const docs = await docsForAsk(env, request, args.docs_limit || 3, args);
    const claims = docs.flatMap(d => d.structured_claims || []);
    return makePacket("DocsEvidenceAgent", "forward", docs.length ? "success" : "warning", docs.length ? 0.74 : 0.35, {
      direct_claims: claims,
      evidence: docs.map(d => ({ doc_id: d.doc_id, title: d.title, url: d.url, score: d.score, snippet: d.snippet })),
      unknowns: docs.length ? [] : ["No cached docs evidence matched; refresh_cloudflare_docs may be needed."],
      recommended_next_actions: docs.length ? [{ name: "get_cloudflare_doc_excerpt", reason: "Read focused excerpts for the strongest docs hits before mutation." }] : [{ name: "refresh_cloudflare_docs", reason: "Refresh cached docs if docs evidence is required." }]
    });
  } catch (e) {
    return makePacket("DocsEvidenceAgent", "forward", "warning", 0.25, { unknowns: [`Docs lookup failed: ${e.message}`] });
  }
}

async function cloudForwardEndpointPacket(env, request, args = {}, router = null) {
  try {
    const index = await loadIndex(env);
    const candidates = endpointCandidates(index, request, args.limit || 8);
    const specialized = specializedToolForRequest(request, { ...args, allow_mutation: false });
    const deterministic = specialized ? null : chooseDeterministicEndpoint(index, request, { ...args, allow_mutation: false });
    let toolArgs = specialized ? compactLoopToolArgs(specialized.arguments || {}) : null;
    let boundD1Resolution = null;
    if (specialized?.tool === "d1_migration_preflight") {
      const enriched = await enrichD1PreflightArgsFromWorker(env, request, toolArgs);
      toolArgs = enriched.args;
      boundD1Resolution = enriched.resolution;
    }
    const selected = specialized ? {
      name: specialized.tool,
      type: "mcp_tool",
      mode: "read_only_preflight",
      reason: specialized.reason,
      arguments: redactLoopToolArgs(toolArgs)
    } : deterministic ? {
      name: "call",
      type: "cloudflare_endpoint",
      method: deterministic.method,
      path: deterministic.path,
      reason: deterministic.reason,
      query: deterministic.query || {},
      body: deterministic.body || null
    } : {
      name: router?.selected_next_tool || "ask_cloudflare",
      type: "mcp_tool",
      mode: "dry_run",
      arguments: { request, dry_run: true, allow_mutation: false }
    };
    return makePacket("EndpointSelectionAgent", "forward", "success", specialized || deterministic ? 0.86 : 0.62, {
      evidence: [{ endpoint_candidates: compactCandidates(candidates), specialized_tool: specialized ? specialized.tool : null, deterministic_endpoint: deterministic ? { method: deterministic.method, path: deterministic.path } : null, d1_binding_resolution: boundD1Resolution }],
      inferred_guidance: ["Select one focused next action; do not execute write, DDL, deploy, or delete operations in Cloud-Loop v0.7.2."],
      recommended_next_actions: [selected],
      data: { selected, candidate_count: candidates.length }
    });
  } catch (e) {
    return makePacket("EndpointSelectionAgent", "forward", "error", 0.2, { unknowns: [`Endpoint selection failed: ${e.message}`] });
  }
}

function inferWorkerScriptName(request, args = {}) {
  if (args.script_name) return String(args.script_name).trim();
  const text = String(request || "");
  const patterns = [
    /\bscript(?:\s+name)?\s+[`'\"]?([a-z0-9][a-z0-9_-]{1,80})[`'\"]?/i,
    /\bworker(?:\s+script)?\s+[`'\"]?([a-z0-9][a-z0-9_-]{1,80})[`'\"]?/i
  ];
  const stop = new Set(["settings", "setting", "bindings", "binding", "deploy", "deployment", "inspection", "inspect", "script", "worker"]);
  for (const pattern of patterns) {
    const hit = text.match(pattern);
    const candidate = hit && hit[1] ? hit[1].trim() : "";
    if (candidate && !stop.has(candidate.toLowerCase())) return candidate;
  }
  return null;
}

function compactWorkerBindingForLoop(binding = {}) {
  const out = { name: binding.name, type: binding.type };
  for (const key of ["id", "database_id", "bucket_name", "namespace_id", "index_name", "service", "environment", "class_name", "script_name"]) {
    if (binding[key] !== undefined && binding[key] !== null && binding[key] !== "") out[key] = binding[key];
  }
  if (String(binding.type || "").includes("secret")) out.secret_value_readable = false;
  if (binding.type === "plain_text") out.text = "<redacted_plain_text>";
  return out;
}

function compactWorkerSettingsForLoop(settings = {}) {
  return {
    compatibility_date: settings.compatibility_date || null,
    compatibility_flags: settings.compatibility_flags || [],
    usage_model: settings.usage_model || null,
    logpush: settings.logpush || false,
    bindings: (settings.bindings || []).map(compactWorkerBindingForLoop)
  };
}

async function enrichD1PreflightArgsFromWorker(env, request, args = {}) {
  const enriched = { ...(args || {}) };
  if (placeholderD1DatabaseName(enriched.database_name)) delete enriched.database_name;
  if (!enriched.script_name) enriched.script_name = inferWorkerScriptName(request, enriched);
  const shouldResolve = Boolean(enriched.script_name && !enriched.database_id && (!enriched.database_name || boundD1Requested(request, enriched)));
  if (!shouldResolve) return { args: compactLoopToolArgs(enriched), resolution: null };
  try {
    const settings = await getWorkerSettings(env, enriched.script_name, enriched.account_id);
    const d1Bindings = d1BindingsFromWorkerSettings(settings);
    const choices = d1Bindings.map(b => ({ name: b.name, database_id: d1BindingDatabaseId(b), database_name: d1BindingDatabaseName(b) }));
    if (d1Bindings.length === 1) {
      const binding = d1Bindings[0];
      const databaseId = d1BindingDatabaseId(binding);
      if (databaseId) {
        enriched.database_id = databaseId;
        delete enriched.database_name;
        return {
          args: compactLoopToolArgs(enriched),
          resolution: {
            status: "resolved_single_binding",
            script_name: enriched.script_name,
            binding_name: binding.name,
            database_id: databaseId,
            database_name: d1BindingDatabaseName(binding)
          }
        };
      }
    }
    return {
      args: compactLoopToolArgs(enriched),
      resolution: {
        status: d1Bindings.length > 1 ? "ambiguous_multiple_bindings" : "no_d1_bindings",
        script_name: enriched.script_name,
        choices
      }
    };
  } catch (e) {
    return { args: compactLoopToolArgs(enriched), resolution: { status: "error", script_name: enriched.script_name, message: e.message } };
  }
}

async function cloudForwardRuntimePacket(env, request, args = {}, router = null) {
  if (args.include_runtime === false) {
    return makePacket("RuntimeReadOnlyAgent", "forward", "skipped", 1, { unknowns: ["include_runtime was false"] });
  }
  if (router?.selected_next_tool === "d1_migration_preflight") {
    const specialized = specializedToolForRequest(request, { ...args, allow_mutation: false }) || { arguments: args };
    const initialToolArgs = compactLoopToolArgs({ ...(specialized.arguments || {}), account_id: args.account_id });
    const enriched = await enrichD1PreflightArgsFromWorker(env, request, initialToolArgs);
    const toolArgs = enriched.args;
    try {
      const result = await d1MigrationPreflight(env, toolArgs);
      return makePacket("RuntimeReadOnlyAgent", "forward", "success", 0.84, {
        direct_claims: ["d1_migration_preflight completed as a read-only runtime inspection and did not execute migration SQL."],
        evidence: [{ tool: "d1_migration_preflight", database_found: result.database_found, database_id: result.database_id, worker_found: result.worker_found, bound_d1_resolution: enriched.resolution || result.bound_d1_resolution || null, warnings: result.warnings, tables_preview: (result.tables || []).slice(0, 20), sql_split: result.sql_split }],
        inferred_guidance: result.recommended_execution_sequence || [],
        recommended_next_actions: (result.recommended_next_tools || []).map(name => ({ name, reason: "Recommended by d1_migration_preflight" })),
        data: { called_tool: "d1_migration_preflight", mutates_cloudflare: false, executes_sql: false }
      });
    } catch (e) {
      return makePacket("RuntimeReadOnlyAgent", "forward", "warning", 0.35, { unknowns: [`Read-only D1 preflight failed: ${e.message}`], data: { called_tool: "d1_migration_preflight", mutates_cloudflare: false } });
    }
  }
  const scriptName = inferWorkerScriptName(request, args);
  const workerRuntimeRequested = router?.mode === "read_only" && (router?.intents?.worker_settings || router?.intents?.deploy_or_binding);
  if (workerRuntimeRequested) {
    if (!scriptName) {
      return makePacket("RuntimeReadOnlyAgent", "forward", "warning", 0.42, {
        unknowns: ["Read-only Worker runtime inspection needs script_name or an unambiguous Worker script name in the request."],
        recommended_next_actions: [{ name: "ask_cloud_loop", reason: "Retry with script_name and mode:'read_only'." }],
        data: { mutates_cloudflare: false }
      });
    }
    try {
      const settings = await getWorkerSettings(env, scriptName, args.account_id);
      const snapshot = compactWorkerSettingsForLoop(settings);
      return makePacket("RuntimeReadOnlyAgent", "forward", "success", 0.86, {
        direct_claims: ["get_worker_settings completed as a read-only Worker settings and bindings inspection."],
        evidence: [{ tool: "get_worker_settings", script_name: scriptName, ...snapshot }],
        inferred_guidance: ["Preserve the complete binding manifest before any deploy because Worker deploy APIs replace bindings rather than merging them."],
        recommended_next_actions: [{ name: "get_worker_settings", reason: "Review current bindings/settings before any deploy or binding change." }],
        data: {
          called_tool: "get_worker_settings",
          mutates_cloudflare: false,
          read_only_api_calls: [{ method: "GET", path: "/accounts/{account_id}/workers/scripts/{script_name}/settings", script_name: scriptName }]
        }
      });
    } catch (e) {
      return makePacket("RuntimeReadOnlyAgent", "forward", "warning", 0.35, { unknowns: [`Read-only Worker settings inspection failed: ${e.message}`], data: { called_tool: "get_worker_settings", mutates_cloudflare: false } });
    }
  }
  return makePacket("RuntimeReadOnlyAgent", "forward", "skipped", 0.78, { inferred_guidance: ["No runtime read was required for this dry-run route."], data: { mutates_cloudflare: false } });
}

function cloudInverseRiskPacket(request, args = {}, forwardPackets = [], router = null) {
  const text = String(request || "").toLowerCase();
  const d1Intent = router?.intents?.d1_migration_or_schema || d1Requested(request);
  const deployIntent = router?.intents?.deploy_or_binding || /\b(deploy|binding|bindings|secret|secrets|wrangler)\b/.test(text);
  const risks = [
    { key: "mutation_power_withheld", level: "blocked", message: "Cloud-Loop v0.7.2 forces allow_mutation=false and does not execute write, DDL, deploy, delete, or binding changes." }
  ];
  const guidance = ["Use forward packets only to select one safe next action; require a separate explicit command for mutation." ];
  if (d1Intent) {
    risks.push(
      { key: "one_statement_sql_rule", level: "required", message: "D1 SQL must be executed one statement per call; split migrations and call execute_d1_sql separately only after confirmation." },
      { key: "migration_ledger_inspection", level: "required", message: "Inspect sqlite_master and migration ledger candidates before applying new schema migrations." },
      { key: "worker_binding_replacement_warning", level: "required", message: "Worker deploy APIs replace the full binding set; inspect and preserve every binding before any deploy." }
    );
    guidance.push("For D1 schema migration requests, route first to d1_migration_preflight and inspect ledger/table state before execution.");
  }
  if (deployIntent && !d1Intent) {
    risks.push({ key: "worker_binding_replacement_warning", level: "required", message: "Worker deploy APIs replace the full binding set; get_worker_settings must be reviewed and secret bindings must be supplied from trusted secrets before deploy." });
  }
  if (router?.unsupported) risks.push({ key: "unsupported_domain", level: "blocked", message: "GitHub loop routing is not enabled in the Cloudflare MCP v0.7.2 tool." });
  return makePacket("InverseRiskAgent", "inverse", risks.some(r => r.level === "blocked") ? "blocked" : "warning", d1Intent ? 0.9 : 0.74, {
    risks,
    inferred_guidance: guidance,
    evidence: [{ forward_packet_count: forwardPackets.length, selected_next_tool: router?.selected_next_tool || null }],
    recommended_next_actions: d1Intent ? [{ name: "d1_migration_preflight", reason: "Read-only D1 migration safety preflight is required before execution." }] : [{ name: "ask_cloudflare", reason: "Use dry_run=true for endpoint selection before any action." }]
  });
}

function cloudRiskPacket(request, args = {}, router = null) {
  const risks = [];
  if (router?.allow_mutation_requested) risks.push({ key: "requested_mutation_overridden", level: "blocked", message: "allow_mutation was requested but forced to false in ask_cloud_loop v0.7.2." });
  if (router?.intents?.d1_migration_or_schema) risks.push({ key: "d1_migration_requires_receipt", level: "warning", message: "Future execution must verify schema after each one-statement call and write an audit receipt." });
  if (router?.intents?.deploy_or_binding) risks.push({ key: "binding_loss", level: "warning", message: "Deploying a Worker without a full binding manifest can remove secrets, R2, D1, KV, or AI bindings." });
  if (!risks.length) risks.push({ key: "no_mutation_in_scope", level: "info", message: "No mutation path is selected by this dry-run loop." });
  return makePacket("SafetyRiskAgent", "risk", risks.some(r => r.level === "blocked") ? "blocked" : "warning", 0.82, { risks, data: { mutates_cloudflare: false, mutations_allowed: false } });
}

function cloudVerificationPacket(forwardPackets = [], inversePackets = [], riskPackets = [], selectedNextAction = null) {
  const allRisks = inversePackets.concat(riskPackets).flatMap(p => p.risks || []);
  const checks = [
    { name: "selected_next_action_present", ok: Boolean(selectedNextAction?.name) },
    { name: "forward_packets_present", ok: forwardPackets.length > 0 },
    { name: "inverse_packets_present", ok: inversePackets.length > 0 },
    { name: "mutations_made_empty", ok: true },
    { name: "d1_one_statement_rule_present_when_needed", ok: !selectedNextAction || selectedNextAction.name !== "d1_migration_preflight" || allRisks.some(r => r.key === "one_statement_sql_rule") },
    { name: "binding_replacement_warning_present_when_needed", ok: allRisks.some(r => r.key === "worker_binding_replacement_warning") || selectedNextAction?.name !== "d1_migration_preflight" }
  ];
  return makePacket("VerificationAgent", "verification", checks.every(c => c.ok) ? "success" : "warning", checks.every(c => c.ok) ? 0.9 : 0.55, {
    direct_claims: ["Verification completed without granting mutation power."],
    evidence: [{ checks }],
    unknowns: checks.filter(c => !c.ok).map(c => `Failed verification check: ${c.name}`)
  });
}

function synthesizeCloudLoop(request, router, forwardPackets, inversePackets, riskPackets, verificationPackets) {
  const endpointPacket = forwardPackets.find(p => p.agent === "EndpointSelectionAgent");
  const selected = endpointPacket?.recommended_next_actions?.[0] || { name: router.selected_next_tool || "ask_cloudflare", type: "mcp_tool", arguments: { request, dry_run: true, allow_mutation: false } };
  const blocked = router.unsupported || riskPackets.concat(inversePackets).some(p => p.status === "error");
  const packetStatuses = forwardPackets.concat(inversePackets, riskPackets, verificationPackets).map(p => p.status);
  return {
    selected_next_action: selected,
    requires_confirmation: false,
    convergence: {
      status: blocked ? "blocked" : "converged",
      iteration_count: 1,
      max_iterations: 1,
      packet_statuses: packetStatuses,
      confidence: verificationPackets[0]?.confidence || 0.7,
      reason: blocked ? "Loop is blocked before mutation or unsupported routing." : "Forward, inverse, risk, and verification packets converge on one safe next action."
    }
  };
}

function buildCloudLoopReceipt(loopId, router, forwardPackets, inversePackets, riskPackets, verificationPackets, selectedNextAction) {
  const docs = forwardPackets.flatMap(p => p.evidence || []).flatMap(e => Array.isArray(e) ? e : [e]).filter(e => e && e.doc_id);
  const runtimeCalls = forwardPackets.filter(p => p.data?.called_tool).map(p => p.data.called_tool);
  const readOnlyApiCalls = forwardPackets.flatMap(p => p.data?.read_only_api_calls || []);
  return {
    loop_id: loopId,
    worker: WORKER_NAME,
    version: VERSION,
    tools_considered: unique(["ask_cloud_loop", "ask_cloudflare", "d1_migration_preflight", "get_worker_settings", "query_d1_sql", "execute_d1_sql"]),
    tools_called: unique(runtimeCalls),
    api_endpoints_considered: forwardPackets.flatMap(p => p.evidence || []).flatMap(e => e.endpoint_candidates || []).map(e => ({ method: e.method, path: e.path })),
    api_calls_made: [],
    read_only_api_calls_made: readOnlyApiCalls,
    cloudflare_write_calls_made: [],
    mutations_made: [],
    docs_consulted: docs.map(d => ({ doc_id: d.doc_id, title: d.title, url: d.url })),
    runtime_inspection: runtimeCalls.map(name => ({ tool: name, mode: "read_only" })),
    blocked_actions: router.allow_mutation_requested ? ["allow_mutation request ignored; v0.7.2 is dry-run/read-only only"] : [],
    selected_next_action: selectedNextAction,
    requires_confirmation: false
  };
}

async function askCloudLoop(env, args = {}) {
  const request = String(args.request || "").trim();
  if (!request) throw new Error("request is required");
  const safeArgs = { ...args, allow_mutation: false, max_iterations: 1 };
  const loopId = makeLoopId(request);
  const router = routeCloudLoopRequest(request, args);
  const forwardPackets = [];
  forwardPackets.push(await cloudForwardDocsPacket(env, request, safeArgs));
  forwardPackets.push(await cloudForwardEndpointPacket(env, request, safeArgs, router));
  forwardPackets.push(await cloudForwardRuntimePacket(env, request, safeArgs, router));
  const inversePackets = [cloudInverseRiskPacket(request, safeArgs, forwardPackets, router)];
  const riskPackets = [cloudRiskPacket(request, safeArgs, router)];
  const preliminary = synthesizeCloudLoop(request, router, forwardPackets, inversePackets, riskPackets, []);
  const verificationPackets = [cloudVerificationPacket(forwardPackets, inversePackets, riskPackets, preliminary.selected_next_action)];
  const synthesis = synthesizeCloudLoop(request, router, forwardPackets, inversePackets, riskPackets, verificationPackets);
  const receipt = buildCloudLoopReceipt(loopId, router, forwardPackets, inversePackets, riskPackets, verificationPackets, synthesis.selected_next_action);
  return {
    ok: !router.unsupported,
    loop_id: loopId,
    version: VERSION,
    mode: router.effective_mode,
    request,
    router: { ...router, sanitized_args: sanitizeCloudLoopArgs(args) },
    forward_packets: forwardPackets,
    inverse_packets: inversePackets,
    risk_packets: riskPackets,
    verification_packets: verificationPackets,
    selected_next_action: synthesis.selected_next_action,
    requires_confirmation: synthesis.requires_confirmation,
    convergence: synthesis.convergence,
    receipt
  };
}

async function dispatch(name, args, env) {
  if (name === "cf_api_status") {
    let seeded = false, count = null;
    try { const idx = await loadIndex(env); seeded = true; count = idx.length; } catch {}
    return {
      worker: WORKER_NAME,
      version: VERSION,
      status: "ok",
      bindings: {
        CF_API_TOKEN: Boolean(env.CF_API_TOKEN),
        CF_ACCOUNT_ID: Boolean(env.CF_ACCOUNT_ID),
        GITHUB_TOKEN: Boolean(env.GITHUB_TOKEN),
        SPEC: Boolean(env.SPEC),
        AI: Boolean(env.AI)
      },
      spec_seeded: seeded,
      indexed_endpoints: count,
      tools: TOOLS.map(t => t.name)
    };
  }

  if (name === "ask_cloudflare") return await askCloudflare(env, args || {});
  if (name === "ask_cloud_loop") return await askCloudLoop(env, args || {});
  if (name === "refresh_cloudflare_docs") return await refreshCloudflareDocs(env, args || {});
  if (name === "search_cloudflare_docs") return await searchCloudflareDocs(env, args || {});
  if (name === "get_cloudflare_doc") return await getCloudflareDoc(env, args || {});
  if (name === "get_cloudflare_doc_excerpt") return await getCloudflareDocExcerpt(env, args || {});
  if (name === "d1_migration_preflight") return await d1MigrationPreflight(env, args || {});
  if (name === "list_skills") return { ...(await loadSkills(env)), worker: WORKER_NAME, how_to_extend: (await loadSkills(env)).how_to_extend || "Copy an existing skill's shape; use triggers, endpoints, guidance, response_note, enabled." };
  if (name === "upsert_skill") return await upsertSkill(env, args || {});

  if (name === "seed_spec") return await buildIndex(env);

  if (name === "search") {
    const index = await loadIndex(env);
    const q = (args.query || "").toLowerCase();
    const tag = (args.tag || "").toLowerCase();
    const limit = args.limit || 30;
    let results = index;
    if (tag) results = results.filter(e => e.tags.some(t => t.toLowerCase() === tag));
    if (q) results = results.filter(e =>
      e.path.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q))
    );
    return { total_matches: results.length, results: results.slice(0, limit) };
  }

  if (name === "call") {
    const { method, path, query, body, account_id, paginate } = args;
    if (!method || !path) throw new Error("method and path are required");
    let r = await cfApi(env, method, path, query, body, account_id);
    if (paginate && Array.isArray(r.data?.result) && r.data?.result_info) {
      let combined = r.data.result;
      const info = r.data.result_info;
      let page = info.page || 1;
      const perPage = info.per_page || combined.length || 1;
      const totalCount = info.total_count;
      let pagesFetched = 1;
      let lastPageSize = combined.length;
      while (
        pagesFetched < MAX_PAGINATION_PAGES &&
        combined.length < MAX_PAGINATION_ITEMS &&
        (totalCount !== undefined ? combined.length < totalCount : lastPageSize === perPage)
      ) {
        page++;
        const nq = Object.assign({}, query || {}, { page });
        const nr = await cfApi(env, method, path, nq, body, account_id);
        if (!Array.isArray(nr.data?.result) || nr.data.result.length === 0) break;
        combined = combined.concat(nr.data.result);
        lastPageSize = nr.data.result.length;
        pagesFetched++;
      }
      return {
        status: r.status,
        data: { ...r.data, result: combined, result_info: { ...info, fetched_count: combined.length } },
        pages_fetched: pagesFetched,
        rate_limit: r.rate_limit
      };
    }
    return { status: r.status, data: r.data, rate_limit: r.rate_limit };
  }

  if (name === "list_d1_databases") {
    const dbs = await listD1(env, args.account_id);
    return { count: dbs.length, databases: dbs.map(d => ({ name: d.name, uuid: d.uuid, created_at: d.created_at })) };
  }

  if (name === "resolve_d1_database") {
    const id = await resolveD1Id(env, { database_name: args.name }, args.account_id);
    return { name: args.name, uuid: id };
  }

  if (name === "execute_d1_sql" || name === "query_d1_sql") {
    if (!args.sql) throw new Error("sql is required");
    const id = await resolveD1Id(env, args, args.account_id);
    const result = await d1Query(env, id, args.sql, args.params, args.account_id);
    return { database_id: id, result };
  }

  if (name === "list_d1_tables") {
    const id = await resolveD1Id(env, args, args.account_id);
    const result = await d1Query(env, id, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", null, args.account_id);
    const rows = result?.[0]?.results || result?.results || [];
    return { database_id: id, tables: rows.map(r => r.name) };
  }

  if (name === "get_worker_settings") {
    const { script_name, account_id } = args;
    if (!script_name) throw new Error("script_name is required");
    const settings = await getWorkerSettings(env, script_name, account_id);
    return {
      script_name,
      bindings: settings.bindings || [],
      compatibility_date: settings.compatibility_date,
      compatibility_flags: settings.compatibility_flags || []
    };
  }

  if (name === "deploy_worker_with_bindings") {
    const { script_name, script_content, bindings, compatibility_date, compatibility_flags, enable_subdomain, account_id } = args;
    if (!script_name || !script_content) throw new Error("script_name and script_content are required");
    const cfResult = await putScript(env, script_name, script_content, bindings || [], compatibility_date, account_id, compatibility_flags);
    let subdomain = null;
    if (enable_subdomain !== false) subdomain = await enableSubdomainFor(env, script_name, account_id);
    return { ok: true, script_name, bindings_set: (bindings || []).map(b => ({ type: b.type, name: b.name })), subdomain, cloudflare_result: cfResult };
  }

  if (name === "deploy_worker_from_github") {
    const { owner, repo, branch, file_path, script_name, bindings, compatibility_date, compatibility_flags, enable_subdomain, account_id } = args;
    if (!owner || !repo || !file_path || !script_name) throw new Error("owner, repo, file_path, and script_name are required");
    const content = await githubFetchRaw(env, owner, repo, file_path, branch);
    const cfResult = await putScript(env, script_name, content, bindings || [], compatibility_date, account_id, compatibility_flags);
    let subdomain = null;
    if (enable_subdomain !== false) subdomain = await enableSubdomainFor(env, script_name, account_id);
    return {
      ok: true,
      script_name,
      source: `${owner}/${repo}/${file_path}@${branch || "default"}`,
      source_bytes: content.length,
      bindings_set: (bindings || []).map(b => ({ type: b.type, name: b.name })),
      subdomain,
      cloudflare_result: cfResult
    };
  }

  if (name === "setup_worker_with_d1_schema") {
    const {
      owner, repo, branch, worker_file_path, script_name, database_name,
      schema_file_path, vars, d1_binding_name, smoke_test, compatibility_date, account_id
    } = args;
    if (!owner || !repo || !worker_file_path || !script_name || !database_name) {
      throw new Error("owner, repo, worker_file_path, script_name, and database_name are required");
    }

    const db = await resolveOrCreateD1(env, database_name, account_id);
    const bindings = [{ type: "d1", name: d1_binding_name || "DB", id: db.id }];
    if (vars) for (const [k, v] of Object.entries(vars)) bindings.push({ type: "plain_text", name: k, text: String(v) });

    const content = await githubFetchRaw(env, owner, repo, worker_file_path, branch);
    const deployResult = await putScript(env, script_name, content, bindings, compatibility_date, account_id);
    const subdomain = await enableSubdomainFor(env, script_name, account_id);

    let schema = null;
    if (schema_file_path) {
      const schemaSql = await githubFetchRaw(env, owner, repo, schema_file_path, branch);
      const statements = splitStatements(schemaSql);
      schema = { total_statements: statements.length, executed: [] };
      for (let i = 0; i < statements.length; i++) {
        try {
          const r = await d1Query(env, db.id, statements[i], null, account_id);
          schema.executed.push({ index: i, ok: true, meta: r?.[0]?.meta || r?.meta || null });
        } catch (e) {
          schema.executed.push({ index: i, ok: false, error: e.message, statement: statements[i].slice(0, 200) });
          schema.stopped_early = true;
          break;
        }
      }
    }

    let smoke = null;
    if (smoke_test) {
      try {
        const subdomainName = await getWorkersSubdomain(env, account_id);
        const testUrl = `https://${script_name}.${subdomainName}.workers.dev${smoke_test.path || "/"}`;
        smoke = await fetchWithSubdomainRetry(testUrl, smoke_test);
      } catch (e) {
        smoke = { error: e.message };
      }
    }

    return {
      ok: true,
      script_name,
      database: { name: database_name, id: db.id, created: db.created },
      bindings_set: bindings.map(b => ({ type: b.type, name: b.name })),
      deploy: deployResult,
      subdomain,
      schema,
      smoke_test: smoke
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === "/health" || url.pathname === "/status") return j(await dispatch("cf_api_status", {}, env));
    if (url.pathname === "/tools") return j({ ok: true, tools: TOOLS });
    if (url.pathname === "/admin/seed") {
      try { return j(await buildIndex(env)); } catch (e) { return j({ error: e.message }, 500); }
    }
    if (request.method !== "POST") return j({ error: "POST /mcp required" }, 404);
    let body;
    try { body = await request.json(); } catch { return er(null, -32700, "Parse error"); }
    const { id = null, method, params = {} } = body;
    try {
      if (method === "initialize") {
        return rr(id, { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: WORKER_NAME, version: VERSION } });
      }
      if (method === "notifications/initialized") return new Response(null, { status: 204, headers: CORS });
      if (method === "ping") return rr(id, {});
      if (method === "tools/list") return rr(id, { tools: TOOLS });
      if (method === "tools/call") {
        let result;
        try {
          result = await dispatch(params?.name, params?.arguments || {}, env);
        } catch (e) {
          return tr(id, `Error: ${e.message}`);
        }
        return tr(id, truncate(JSON.stringify(result, null, 2)));
      }
      return er(id, -32601, `Method not found: ${method}`);
    } catch (e) {
      return er(id, -32603, `Tool error: ${e.message}`);
    }
  }
};
