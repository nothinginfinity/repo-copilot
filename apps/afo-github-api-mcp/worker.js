const VERSION = "0.1.0";
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
    description: "Call any GitHub REST API endpoint directly, authenticated with GITHUB_TOKEN. Use search first to find the right method and path. The literal substrings {owner} and {repo} in path are auto-replaced with the owner/repo arguments or the default repo if set.",
    inputSchema: {
      type: "object",
      properties: {
        method: { type: "string", description: "HTTP method: GET, POST, PUT, PATCH, or DELETE" },
        path: { type: "string", description: "API path, e.g. /repos/{owner}/{repo}/pulls" },
        owner: { type: "string", description: "Overrides {owner} in path" },
        repo: { type: "string", description: "Overrides {repo} in path" },
        query: { type: "object", description: "Query string parameters" },
        body: { type: "object", description: "JSON request body for POST/PUT/PATCH" }
      },
      required: ["method", "path"]
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
    description: "List recent Actions workflow runs for a repo, optionally scoped to one workflow, branch, or status.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        workflow_id: { type: "string", description: "Optional: scope to one workflow (filename or id)" },
        branch: { type: "string" },
        status: { type: "string", description: "e.g. 'completed', 'in_progress', 'queued', 'failure'" },
        limit: { type: "number", description: "Default 10" }
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
  const opts = {
    method: m,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
      "User-Agent": WORKER_NAME,
      "Content-Type": "application/json"
    }
  };
  if (body !== undefined && !["GET", "HEAD"].includes(m)) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw: text }; }
  return { status: res.status, data: parsed };
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
        DEFAULT_OWNER: env.DEFAULT_OWNER || null,
        DEFAULT_REPO: env.DEFAULT_REPO || null
      },
      spec_seeded: seeded,
      indexed_endpoints: count,
      tools: TOOLS.map(t => t.name)
    };
  }

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
    const { method, path, query, body, owner, repo } = args;
    if (!method || !path) throw new Error("method and path are required");
    const { owner: o, repo: r } = resolveOwnerRepo(env, { owner, repo });
    const res = await ghApi(env, method, path, query, body, o, r);
    return { status: res.status, data: res.data };
  }

  if (name === "trigger_workflow_dispatch") {
    const { workflow_id, ref, inputs } = args;
    if (!workflow_id) throw new Error("workflow_id is required");
    const { owner, repo } = resolveOwnerRepo(env, args);
    if (!owner || !repo) throw new Error("owner and repo are required (no default set)");
    const res = await ghApi(env, "POST", `/repos/{owner}/{repo}/actions/workflows/${workflow_id}/dispatches`, null,
      { ref: ref || "main", inputs: inputs || {} }, owner, repo);
    return { status: res.status, ok: res.status === 204, data: res.data };
  }

  if (name === "list_workflow_runs") {
    const { workflow_id, branch, status, limit } = args;
    const { owner, repo } = resolveOwnerRepo(env, args);
    if (!owner || !repo) throw new Error("owner and repo are required (no default set)");
    const path = workflow_id
      ? `/repos/{owner}/{repo}/actions/workflows/${workflow_id}/runs`
      : "/repos/{owner}/{repo}/actions/runs";
    const query = { per_page: limit || 10 };
    if (branch) query.branch = branch;
    if (status) query.status = status;
    const res = await ghApi(env, "GET", path, query, null, owner, repo);
    const runs = (res.data.workflow_runs || []).map(r => ({
      id: r.id, name: r.name, status: r.status, conclusion: r.conclusion,
      head_branch: r.head_branch, head_sha: r.head_sha,
      run_started_at: r.run_started_at, html_url: r.html_url
    }));
    return { total_count: res.data.total_count, runs };
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
      head_branch: r.head_branch, head_sha: r.head_sha
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
    return { total_count: res.data.total_count, jobs };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (url.pathname === "/health") return j({ status: "ok", worker: WORKER_NAME, version: VERSION });
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
