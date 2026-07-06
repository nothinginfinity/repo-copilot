const VERSION = "0.3.1";
const AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const WORKER_NAME = "afo-github-api-mcp";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id"
};

const SPEC_URL = "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json";
const SPEC_KEY = "gh-openapi-spec/index.json";
const MAX_RESPONSE_CHARS = 30000;
const GITHUB_API_VERSION = "2022-11-28";
const MAX_PAGINATION_PAGES = 10;
const MAX_PAGINATION_ITEMS = 2000;

const TOOLS = [
  {
    name: "gh_api_status",
    description: "Health check. Shows binding presence and whether the spec index has been seeded.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "search",
    description: "Search the GitHub REST API OpenAPI spec for endpoints across the entire API (repos, pulls, issues, actions, releases, orgs, branch protection, webhooks, code-security, and more). Filter by free-text query (matches path, summary, tags) and/or an exact tag. Returns method, path, tags, and summary for each match so you can then call the endpoint with the call tool.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free text to match against path, summary, or tags, e.g. 'branch protection' or 'workflow dispatch'" },
        tag: { type: "string", description: "Exact tag to filter by, e.g. 'pulls', 'actions', 'repos', 'issues'" },
        limit: { type: "number", description: "Max results to return, default 30" }
      },
      required: []
    }
  },
  {
    name: "call",
    description: "Call any GitHub REST API endpoint directly, authenticated with GITHUB_TOKEN. Use search first to find the right method and path. The literal substrings {owner} and {repo} in path are auto-replaced with the owner/repo arguments or the default repo if set. Automatically retries on 429/5xx with backoff. Set paginate=true to follow Link-header pagination when the response is a top-level array (capped at 10 pages / 2000 items).",
    inputSchema: {
      type: "object",
      properties: {
        method: { type: "string", description: "HTTP method: GET, POST, PUT, PATCH, or DELETE" },
        path: { type: "string", description: "API path, e.g. /repos/{owner}/{repo}/pulls" },
        owner: { type: "string", description: "Overrides {owner} in path" },
        repo: { type: "string", description: "Overrides {repo} in path" },
        query: { type: "object", description: "Query string parameters" },
        body: { type: "object", description: "JSON request body for POST/PUT/PATCH" },
        paginate: { type: "boolean", description: "Follow pagination if the response is a top-level array. Default false." }
      },
      required: ["method", "path"]
    }
  },
  {
    name: "ask_github",
    description: "AI-assisted GitHub API investigator. Takes a natural-language request, searches the GitHub OpenAPI index, selects a safe endpoint, builds parameters, executes it, and returns a compact answer with an audit trail. Defaults to read-only GET operations unless allow_mutation=true.",
    inputSchema: {
      type: "object",
      properties: {
        request: { type: "string", description: "Natural-language GitHub API task or investigation question" },
        owner: { type: "string" },
        repo: { type: "string" },
        allow_mutation: { type: "boolean", description: "Default false. Required for POST/PUT/PATCH/DELETE." },
        dry_run: { type: "boolean", description: "If true, select endpoint and params but do not call GitHub." },
        limit: { type: "number", description: "Candidate endpoint limit, default 8" }
      },
      required: ["request"]
    }
  },
  {
    name: "seed_spec",
    description: "Fetch the latest GitHub REST API OpenAPI spec from github/rest-api-description and rebuild the search index in R2. Run any time you want to pick up new endpoints.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "trigger_workflow_dispatch",
    description: "Trigger a GitHub Actions workflow_dispatch run.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        workflow_id: { type: "string", description: "Workflow filename (e.g. 'deploy.yml') or numeric id" },
        ref: { type: "string", description: "Branch or tag to run on, default 'main'" },
        inputs: { type: "object", description: "Workflow input parameters, if the workflow defines any" }
      },
      required: ["workflow_id"]
    }
  },
  {
    name: "list_workflow_runs",
    description: "List recent Actions workflow runs for a repo, optionally scoped to one workflow, branch, or status. Set all_pages=true to follow pagination beyond the first page (capped at 10 pages / 2000 runs).",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        workflow_id: { type: "string", description: "Optional: scope to one workflow (filename or id)" },
        branch: { type: "string" },
        status: { type: "string", description: "e.g. 'completed', 'in_progress', 'queued', 'failure'" },
        limit: { type: "number", description: "Per-page size, default 10" },
        all_pages: { type: "boolean", description: "Follow pagination to fetch beyond the first page. Default false." }
      },
      required: []
    }
  },
  {
    name: "get_workflow_run",
    description: "Get the status/conclusion of one Actions workflow run.",
    inputSchema: {
      type: "object",
      properties: { owner: { type: "string" }, repo: { type: "string" }, run_id: { type: "number" } },
      required: ["run_id"]
    }
  },
  {
    name: "list_workflow_run_jobs",
    description: "List jobs and step-level status for one Actions workflow run - useful for diagnosing why a deploy failed without downloading log archives.",
    inputSchema: {
      type: "object",
      properties: { owner: { type: "string" }, repo: { type: "string" }, run_id: { type: "number" } },
      required: ["run_id"]
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
    `\n...[truncated, ${str.length} total chars. Narrow the query or use pagination params like per_page/page.]`;
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

function extractRateLimit(headers) {
  const remaining = headers.get("x-ratelimit-remaining");
  const limit = headers.get("x-ratelimit-limit");
  const reset = headers.get("x-ratelimit-reset");
  if (remaining === null && limit === null) return null;
  return {
    remaining: remaining !== null ? Number(remaining) : null,
    limit: limit !== null ? Number(limit) : null,
    reset_at: reset !== null ? new Date(Number(reset) * 1000).toISOString() : null
  };
}

function parseLinkHeader(linkHeader) {
  if (!linkHeader) return {};
  const links = {};
  linkHeader.split(",").forEach(part => {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) links[match[2]] = match[1];
  });
  return links;
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

function resolveOwnerRepo(env, args) {
  const owner = args.owner || env.DEFAULT_OWNER;
  const repo = args.repo || env.DEFAULT_REPO;
  return { owner, repo };
}

function ghHeaders(env, jsonBody) {
  const h = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
    "User-Agent": WORKER_NAME
  };
  if (jsonBody) h["Content-Type"] = "application/json";
  return h;
}

async function ghApi(env, method, path, query, body, owner, repo) {
  if (!env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN binding missing");
  let resolvedPath = path;
  if (owner) resolvedPath = resolvedPath.replaceAll("{owner}", owner);
  if (repo) resolvedPath = resolvedPath.replaceAll("{repo}", repo);
  let url = `https://api.github.com${resolvedPath}`;
  if (query && Object.keys(query).length) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) qs.set(k, String(v));
    url += `${url.includes("?") ? "&" : "?"}${qs.toString()}`;
  }
  const m = (method || "GET").toUpperCase();
  const opts = { method: m, headers: ghHeaders(env, true) };
  if (body !== undefined && !["GET", "HEAD"].includes(m)) opts.body = JSON.stringify(body);
  const res = await fetchWithRetry(url, opts);
  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw: text }; }
  return { status: res.status, data: parsed, rate_limit: extractRateLimit(res.headers), links: parseLinkHeader(res.headers.get("link")) };
}

async function ghFetchAbsolute(env, url) {
  const res = await fetchWithRetry(url, { method: "GET", headers: ghHeaders(env, false) });
  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw: text }; }
  return { status: res.status, data: parsed, rate_limit: extractRateLimit(res.headers), links: parseLinkHeader(res.headers.get("link")) };
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

function endpointCandidates(index, request, limit = 8) {
  const terms = String(request || "").toLowerCase().split(/[^a-z0-9_./-]+/).filter(Boolean).slice(0, 18);
  return index.map(e => ({ ...e, _score: scoreEndpoint(e, terms) }))
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

async function aiSelectGithub(env, request, candidates, args) {
  if (!env.AI) return null;
  const prompt = [
    "You are selecting a GitHub REST API endpoint for an MCP worker.",
    "Return strict JSON only with keys: method,path,query,body,reason.",
    "Default to safe read-only GET endpoints. Do not choose POST/PUT/PATCH/DELETE unless allow_mutation is true.",
    `allow_mutation=${Boolean(args.allow_mutation)}`,
    `default_owner=${args.owner || env.DEFAULT_OWNER || ""}`,
    `default_repo=${args.repo || env.DEFAULT_REPO || ""}`,
    `request=${request}`,
    `candidates=${JSON.stringify(candidates).slice(0, 12000)}`
  ].join("\n");
  const out = await env.AI.run(AI_MODEL, { messages: [{ role: "user", content: prompt }], max_tokens: 900 });
  return extractJson(out.response || out.result || out.output_text || "");
}

function compactGithubData(data) {
  if (Array.isArray(data)) return data.slice(0, 20);
  if (!data || typeof data !== "object") return data;
  const keep = {};
  for (const key of ["id", "name", "full_name", "private", "html_url", "status", "conclusion", "state", "head_branch", "head_sha", "message", "total_count", "workflow_runs", "jobs", "default_branch", "updated_at", "created_at"]) {
    if (data[key] !== undefined) keep[key] = Array.isArray(data[key]) ? data[key].slice(0, 20) : data[key];
  }
  return Object.keys(keep).length ? keep : data;
}

function uniqueValues(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

function githubPathParamNames(path) {
  return uniqueValues(Array.from(String(path || "").matchAll(/\{([a-zA-Z0-9_]+)\}/g)).map(m => m[1]));
}

function cleanGithubParam(value) {
  return String(value || "").trim().replace(/^["']+/, "").replace(/["',.;:)\]}]+$/, "");
}

function readGithubParam(args, name) {
  if (!args || typeof args !== "object") return null;
  const stores = [args.path_params, args.params, args];
  for (const store of stores) {
    if (store && Object.prototype.hasOwnProperty.call(store, name) && store[name] !== undefined && store[name] !== null) {
      const value = cleanGithubParam(store[name]);
      if (value) return value;
    }
  }
  return null;
}

function valueAfterLabels(request, labels) {
  const source = String(request || "");
  const lower = source.toLowerCase();
  for (const label of labels) {
    const idx = lower.indexOf(String(label).toLowerCase());
    if (idx < 0) continue;
    let tail = source.slice(idx + String(label).length).trim();
    tail = tail.replace(/^(is|exactly|named|called|=|:)\s*/i, "").trim();
    const token = cleanGithubParam((tail.split(/\s+/)[0]) || "");
    if (token && !["for", "and", "with", "return", "read", "list", "show", "get"].includes(token.toLowerCase())) return token;
  }
  return null;
}

function numericGithubParam(request, args, name, labels) {
  const explicit = readGithubParam(args, name);
  if (explicit) return explicit;
  const value = valueAfterLabels(request, labels || [name, name.replace(/_/g, " ")]);
  return value && /^[0-9]+$/.test(value) ? value : null;
}

function workflowIdParam(request, args) {
  const explicit = readGithubParam(args, "workflow_id");
  if (explicit) return explicit;
  const direct = valueAfterLabels(request, ["workflow_id", "workflow id", "workflow file", "workflow"]);
  if (direct) return direct;
  const yaml = String(request || "").split(/\s+/).find(t => /\.ya?ml["',.;:)]*$/i.test(t));
  return yaml ? cleanGithubParam(yaml) : null;
}

function githubPathParam(name, request, args, env) {
  const defaults = resolveOwnerRepo(env, args || {});
  if (name === "owner") return readGithubParam(args, name) || defaults.owner;
  if (name === "repo") return readGithubParam(args, name) || defaults.repo;
  if (name === "run_id") return numericGithubParam(request, args, name, ["run_id", "run id", "run"]);
  if (name === "job_id") return numericGithubParam(request, args, name, ["job_id", "job id", "job"]);
  if (name === "issue_number") return numericGithubParam(request, args, name, ["issue_number", "issue number", "issue"]);
  if (name === "pull_number") return numericGithubParam(request, args, name, ["pull_number", "pull number", "pull request", "pr"]);
  if (name === "workflow_id") return workflowIdParam(request, args);
  const explicit = readGithubParam(args, name);
  if (explicit) return explicit;
  if (name === "path") return valueAfterLabels(request, ["path", "file path", "content path", "file"]);
  if (name === "ref") return valueAfterLabels(request, ["ref", "branch", "tag"]);
  if (name === "branch") return valueAfterLabels(request, ["branch", "ref"]);
  return valueAfterLabels(request, [name, name.replace(/_/g, " "), name.replace(/_/g, "-")]);
}

function encodeGithubParam(name, value) {
  if (name === "path") return String(value).split("/").map(part => encodeURIComponent(part)).join("/");
  return encodeURIComponent(String(value));
}

function resolveGithubPath(path, request, args, env, preset = {}) {
  const names = githubPathParamNames(path);
  const rawParams = {};
  for (const name of names) rawParams[name] = preset[name] || githubPathParam(name, request, args, env);
  const required = names.map(name => ({ name, filled: Boolean(rawParams[name]), value: rawParams[name] || null }));
  const missing = required.filter(p => !p.filled).map(p => p.name);
  const resolvedPath = String(path || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) => rawParams[name] ? encodeGithubParam(name, rawParams[name]) : `{${name}}`);
  return { rawParams, required, missing, resolvedPath };
}

function endpointFromIndex(index, method, path) {
  return (index || []).find(e => e.method === method && e.path === path) || { method, path, tags: ["github"], summary: "Deterministic GitHub route" };
}

function requestText(request) {
  return String(request || "").toLowerCase();
}

function workflowRunsRequested(request) {
  const text = requestText(request);
  return /\b(workflow|action|actions)\b/.test(text) && /\b(runs?|history|recent|list|show)\b/.test(text);
}

function workflowRunJobsRequested(request) {
  const text = requestText(request);
  return /\b(run|workflow|action|actions)\b/.test(text) && /\b(jobs?|steps?)\b/.test(text);
}

function repoContentsRequested(request) {
  const text = requestText(request);
  return /\b(contents?|file|source|read)\b/.test(text) && /\b(path|file|contents?)\b/.test(text);
}

function repoInfoRequested(request) {
  const text = requestText(request);
  return /\b(repo|repository)\b/.test(text) && /\b(info|metadata|details|default branch|private|visibility)\b/.test(text);
}

function chooseDeterministicGithubEndpoint(index, request, args, env) {
  const runId = githubPathParam("run_id", request, args, env);
  const workflowId = githubPathParam("workflow_id", request, args, env);
  const contentPath = githubPathParam("path", request, args, env);
  if (workflowRunJobsRequested(request) && runId) return { ...endpointFromIndex(index, "GET", "/repos/{owner}/{repo}/actions/runs/{run_id}/jobs"), query: {}, body: null, reason: "deterministic workflow run jobs route", deterministic_path_params: { run_id: runId } };
  if (runId && /\b(status|conclusion|inspect|details|read|get)\b/.test(requestText(request))) return { ...endpointFromIndex(index, "GET", "/repos/{owner}/{repo}/actions/runs/{run_id}"), query: {}, body: null, reason: "deterministic workflow run route", deterministic_path_params: { run_id: runId } };
  if (workflowRunsRequested(request)) {
    const path = workflowId ? "/repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs" : "/repos/{owner}/{repo}/actions/runs";
    const params = workflowId ? { workflow_id: workflowId } : {};
    return { ...endpointFromIndex(index, "GET", path), query: { per_page: args.per_page || args.limit || 10 }, body: null, reason: "deterministic workflow runs list route", deterministic_path_params: params };
  }
  if (repoContentsRequested(request) && contentPath) return { ...endpointFromIndex(index, "GET", "/repos/{owner}/{repo}/contents/{path}"), query: {}, body: null, reason: "deterministic repository contents route", deterministic_path_params: { path: contentPath } };
  if (repoInfoRequested(request)) return { ...endpointFromIndex(index, "GET", "/repos/{owner}/{repo}"), query: {}, body: null, reason: "deterministic repository info route" };
  return null;
}

function compactCandidates(candidates) {
  return (candidates || []).slice(0, 12).map(c => ({ method: c.method, path: c.path, summary: c.summary, tags: c.tags }));
}

async function askGithub(env, args) {
  const request = String(args.request || "").trim();
  if (!request) throw new Error("request is required");
  const index = await loadIndex(env);
  const candidates = endpointCandidates(index, request, args.limit || 8);
  if (!candidates.length) throw new Error("No candidate GitHub endpoints found in spec index. Try seed_spec or a more specific request.");
  const deterministic = chooseDeterministicGithubEndpoint(index, request, args, env);
  const ai = deterministic ? null : await aiSelectGithub(env, request, candidates, args).catch(() => null);
  const choice = deterministic || (ai && candidates.find(c => c.method === ai.method && c.path === ai.path) ? ai : { ...candidates.find(c => c.method === "GET") || candidates[0], query: {}, body: null, reason: "heuristic fallback" });
  if (mutationMethod(choice.method) && !args.allow_mutation) {
    return { ok: false, blocked: true, reason: "Mutation endpoint selected but allow_mutation was not true.", selected: choice, candidates };
  }
  const { owner, repo } = resolveOwnerRepo(env, args);
  const pathResolution = resolveGithubPath(choice.path, request, args, env, choice.deterministic_path_params || {});
  const planned = { method: choice.method, path: choice.path, endpoint_template: choice.path, query: choice.query || {}, body: choice.body || undefined, owner, repo, reason: choice.reason || (ai && ai.reason) || "selected" };
  const audit = {
    selected_endpoint_template: choice.path,
    extracted_path_params: pathResolution.rawParams,
    required_path_params: pathResolution.required,
    unresolved_path_params: pathResolution.missing,
    final_resolved_path: pathResolution.resolvedPath,
    query_params: planned.query,
    candidates: compactCandidates(deterministic ? [choice, ...candidates] : candidates)
  };
  if (pathResolution.missing.length) {
    return { ok: false, error_type: "missing_path_param", missing_params: pathResolution.missing, selected: planned, audit };
  }
  if (args.dry_run) return { ok: true, dry_run: true, selected: planned, planned: { ...planned, final_resolved_path: pathResolution.resolvedPath }, path_params: audit.extracted_path_params, audit };
  const res = await ghApi(env, planned.method, pathResolution.resolvedPath, planned.query, planned.body, owner, repo);
  return { ok: res.status >= 200 && res.status < 300, status: res.status, selected: planned, path_params: audit.extracted_path_params, final_resolved_path: audit.final_resolved_path, data: compactGithubData(res.data), rate_limit: res.rate_limit, audit };
}

async function dispatch(name, args, env) {
  if (name === "gh_api_status") {
    let seeded = false, count = null;
    try { const idx = await loadIndex(env); seeded = true; count = idx.length; } catch {}
    return {
      worker: WORKER_NAME,
      version: VERSION,
      status: "ok",
      bindings: {
        GITHUB_TOKEN: Boolean(env.GITHUB_TOKEN),
        SPEC: Boolean(env.SPEC),
        AI: Boolean(env.AI),
        DEFAULT_OWNER: env.DEFAULT_OWNER || null,
        DEFAULT_REPO: env.DEFAULT_REPO || null
      },
      spec_seeded: seeded,
      indexed_endpoints: count,
      tools: TOOLS.map(t => t.name)
    };
  }

  if (name === "ask_github") return await askGithub(env, args || {});

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
    const { method, path, query, body, owner, repo, paginate } = args;
    if (!method || !path) throw new Error("method and path are required");
    const { owner: o, repo: r } = resolveOwnerRepo(env, { owner, repo });
    const res = await ghApi(env, method, path, query, body, o, r);
    if (paginate && Array.isArray(res.data)) {
      let combined = res.data;
      let nextUrl = res.links.next;
      let pages = 1;
      while (nextUrl && pages < MAX_PAGINATION_PAGES && combined.length < MAX_PAGINATION_ITEMS) {
        const nres = await ghFetchAbsolute(env, nextUrl);
        if (!Array.isArray(nres.data)) break;
        combined = combined.concat(nres.data);
        nextUrl = nres.links.next;
        pages++;
      }
      return { status: res.status, data: combined, pages_fetched: pages, rate_limit: res.rate_limit };
    }
    return { status: res.status, data: res.data, rate_limit: res.rate_limit };
  }

  if (name === "trigger_workflow_dispatch") {
    const { workflow_id, ref, inputs } = args;
    if (!workflow_id) throw new Error("workflow_id is required");
    const { owner, repo } = resolveOwnerRepo(env, args);
    if (!owner || !repo) throw new Error("owner and repo are required (no default set)");
    const res = await ghApi(env, "POST", `/repos/{owner}/{repo}/actions/workflows/${workflow_id}/dispatches`, null,
      { ref: ref || "main", inputs: inputs || {} }, owner, repo);
    return { status: res.status, ok: res.status === 204, data: res.data, rate_limit: res.rate_limit };
  }

  if (name === "list_workflow_runs") {
    const { workflow_id, branch, status, limit, all_pages } = args;
    const { owner, repo } = resolveOwnerRepo(env, args);
    if (!owner || !repo) throw new Error("owner and repo are required (no default set)");
    const path = workflow_id
      ? `/repos/{owner}/{repo}/actions/workflows/${workflow_id}/runs`
      : "/repos/{owner}/{repo}/actions/runs";
    const query = { per_page: limit || 10 };
    if (branch) query.branch = branch;
    if (status) query.status = status;
    const res = await ghApi(env, "GET", path, query, null, owner, repo);
    let allRuns = res.data.workflow_runs || [];
    let pages = 1;
    if (all_pages) {
      let nextUrl = res.links.next;
      while (nextUrl && pages < MAX_PAGINATION_PAGES && allRuns.length < MAX_PAGINATION_ITEMS) {
        const nres = await ghFetchAbsolute(env, nextUrl);
        allRuns = allRuns.concat(nres.data.workflow_runs || []);
        nextUrl = nres.links.next;
        pages++;
      }
    }
    const runs = allRuns.map(r => ({
      id: r.id, name: r.name, status: r.status, conclusion: r.conclusion,
      head_branch: r.head_branch, head_sha: r.head_sha,
      run_started_at: r.run_started_at, html_url: r.html_url
    }));
    return { total_count: res.data.total_count, fetched: runs.length, pages_fetched: pages, runs, rate_limit: res.rate_limit };
  }

  if (name === "get_workflow_run") {
    const { run_id } = args;
    if (!run_id) throw new Error("run_id is required");
    const { owner, repo } = resolveOwnerRepo(env, args);
    if (!owner || !repo) throw new Error("owner and repo are required (no default set)");
    const res = await ghApi(env, "GET", `/repos/{owner}/{repo}/actions/runs/${run_id}`, null, null, owner, repo);
    const r = res.data;
    return {
      id: r.id, status: r.status, conclusion: r.conclusion, html_url: r.html_url,
      run_started_at: r.run_started_at, updated_at: r.updated_at,
      head_branch: r.head_branch, head_sha: r.head_sha,
      rate_limit: res.rate_limit
    };
  }

  if (name === "list_workflow_run_jobs") {
    const { run_id } = args;
    if (!run_id) throw new Error("run_id is required");
    const { owner, repo } = resolveOwnerRepo(env, args);
    if (!owner || !repo) throw new Error("owner and repo are required (no default set)");
    const res = await ghApi(env, "GET", `/repos/{owner}/{repo}/actions/runs/${run_id}/jobs`, null, null, owner, repo);
    const jobs = (res.data.jobs || []).map(job => ({
      name: job.name, status: job.status, conclusion: job.conclusion,
      started_at: job.started_at, completed_at: job.completed_at,
      steps: (job.steps || []).map(s => ({ name: s.name, status: s.status, conclusion: s.conclusion, number: s.number }))
    }));
    return { total_count: res.data.total_count, jobs, rate_limit: res.rate_limit };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === "/health" || url.pathname === "/status") return j(await dispatch("gh_api_status", {}, env));
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
