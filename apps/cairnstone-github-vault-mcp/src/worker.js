const VERSION = "0.2.0";
const NAME = "cairnstone-github-vault-mcp";
const V5_URL = "https://cairnstone-v5.jaredtechfit.workers.dev/mcp";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,Mcp-Session-Id"
};

const TOOLS = [
  { name: "github_vault_status", description: "Show indexed repo/file/stone/query counts, schema readiness, and runtime capability status.", inputSchema: { type: "object", properties: {} } },
  { name: "stone_github_account", description: "Index accessible GitHub repositories for an owner. Stones each file into CairnStone V5 (bridged); keeps a local compatibility-feature cache.", inputSchema: { type: "object", properties: { owner: { type: "string" }, visibility: { type: "string", enum: ["all","public","private"] }, limit: { type: "number" }, max_files_per_repo: { type: "number" } }, required: ["owner"] } },
  { name: "stone_github_repo", description: "Index one GitHub repository. Stones each file into CairnStone V5 (bridged); keeps a local compatibility-feature cache.", inputSchema: { type: "object", properties: { repo: { type: "string" }, branch: { type: "string" }, max_files: { type: "number" } }, required: ["repo"] } },
  { name: "stone_github_file", description: "Stone one exact GitHub file into CairnStone V5 (bridged).", inputSchema: { type: "object", properties: { repo: { type: "string" }, path: { type: "string" }, ref: { type: "string" } }, required: ["repo","path"] } },
  { name: "query_github_vault", description: "Search the local compatibility-feature cache of indexed files. Every call is persisted and searchable later via search_query_history.", inputSchema: { type: "object", properties: { query: { type: "string" }, limit: { type: "number" } }, required: ["query"] } },
  { name: "get_repo_manifest", description: "Return a repo's local file/feature index plus its live CairnStone V5 chain manifest (HEAD, stones, edges).", inputSchema: { type: "object", properties: { repo: { type: "string" } }, required: ["repo"] } },
  { name: "discover_repo_combinations", description: "Find likely repo/file combinations by shared capabilities and complementary patterns (tool/code compatibility). Every call is persisted and searchable later via search_query_history.", inputSchema: { type: "object", properties: { query: { type: "string" }, repo: { type: "string" }, limit: { type: "number" } } } },
  { name: "search_query_history", description: "Search previously run query_github_vault / discover_repo_combinations calls and their persisted results, without re-running them.", inputSchema: { type: "object", properties: { query: { type: "string" }, kind: { type: "string", enum: ["query_github_vault","discover_repo_combinations"] }, repo: { type: "string" }, limit: { type: "number" } } } },
  { name: "refresh_changed_repos", description: "Refresh repos whose default branch SHA changed since the last index.", inputSchema: { type: "object", properties: { owner: { type: "string" }, limit: { type: "number" }, max_files_per_repo: { type: "number" } }, required: ["owner"] } }
];

const INCLUDE = [
  /^readme\.md$/i, /^package\.json$/i, /^wrangler\.(jsonc|json|toml)$/i, /^schema\.sql$/i,
  /^src\//, /^app\//, /^apps\//, /^workers\//, /^docs\//, /^templates\//, /^examples\//, /^migrations\//,
  /(^\/)(vite|next|tsconfig|eslint|tailwind|astro|svelte)\.config\./
];
const SKIP = [
  /(^\/)(node_modules|dist|build|\.next|\.git|coverage|vendor|tmp|cache)\//,
  /(^\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/i,
  /\.(png|jpg|jpeg|gif|webp|mp4|mov|mp3|wav|pdf|zip|gz|wasm|map|min\.js)$/i
];

function J(v, status = 200) { return Response.json(v, { status, headers: CORS }); }
function T(v, type = "text/plain; charset=utf-8") { return new Response(v, { headers: { ...CORS, "Content-Type": type } }); }
function now() { return new Date().toISOString(); }
function id(prefix) { return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8); }

async function digest(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function b64decode(s) {
  const bin = atob(String(s || "").replace(/\n/g, ""));
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function language(path) {
  const p = path.toLowerCase();
  if (p.endsWith(".ts") || p.endsWith(".tsx")) return "TypeScript";
  if (p.endsWith(".js") || p.endsWith(".jsx") || p.endsWith(".mjs")) return "JavaScript";
  if (p.endsWith(".md")) return "Markdown";
  if (p.endsWith(".json") || p.endsWith(".jsonc")) return "JSON";
  if (p.endsWith(".sql")) return "SQL";
  if (p.endsWith(".toml")) return "TOML";
  if (p.endsWith(".py")) return "Python";
  if (p.endsWith(".rs")) return "Rust";
  if (p.endsWith(".zig")) return "Zig";
  return "Text";
}
function shouldIndex(path, size = 0) {
  if (size > 240000) return false;
  if (SKIP.some(r => r.test(path))) return false;
  return INCLUDE.some(r => r.test(path)) || /\.(js|ts|jsx|tsx|mjs|md|json|jsonc|toml|sql|py|rs|zig|css|html)$/i.test(path);
}
function words(text) {
  return [...new Set(String(text || "").toLowerCase().match(/[a-z0-9_#.-]{3,}/g) || [])];
}
// Local, cheap compatibility-feature detection. This is deliberately kept
// local (not sent to CairnStone V5) - it's a different concept from V5's
// stone flags, used only for cross-repo "can pair with" discovery.
function features(path, text) {
  const t = `${path}\n${text}`.toLowerCase();
  const out = [];
  const add = (k, rx) => { if (rx.test(t)) out.push(k); };
  add("cloudflare_worker", /export\s+default|wrangler|fetch\(request|d1|r2|kv/);
  add("mcp_server", /jsonrpc|tools\/list|tools\/call|mcp|inputschema/);
  add("three_js_3d_ui", /three\.js|webgl|scene|perspectivecamera|mesh|icosahedron|spherical|constellation|3d/);
  add("podcast_rss", /podcast|rss|itunes:|enclosure|episode|transcript/);
  add("d1_database", /d1|prepare\(|database|create table|sqlite/);
  add("r2_storage", /r2|bucket|put\(|get\(/);
  add("kv_cache", /kv|namespace|cache/);
  add("dashboard_ui", /<html|<canvas|react|vue|svelte|dashboard|cockpit|ui/);
  add("template_system", /template|scene\.json|manifest|compiler|generate|factory/);
  add("github_api", /api\.github\.com|github_token|repos\/|git\/trees/);
  return [...new Set(out)];
}
function kindFor(path, feats) {
  if (feats.includes("cloudflare_worker") && feats.includes("dashboard_ui")) return "cloudflare_worker_ui";
  if (feats.includes("cloudflare_worker") && feats.includes("mcp_server")) return "cloudflare_worker_mcp";
  if (feats.includes("three_js_3d_ui")) return "three_3d_ui";
  if (feats.includes("podcast_rss")) return "podcast_pipeline";
  if (/readme\.md$/i.test(path)) return "repo_readme";
  if (/wrangler\./i.test(path)) return "cloudflare_config";
  if (/package\.json$/i.test(path)) return "node_package";
  return "github_file";
}
// CairnStone V5 chain naming convention used across this Project: bare repo
// name (no owner prefix), e.g. "OpenMontage", "cairnstone-github-vault-mcp".
function chainFor(repo) { return repo.split("/").pop(); }

async function schema(env) {
  if (!env.DB) return { ok: false, error: "missing D1 binding DB" };
  const statements = [
    "CREATE TABLE IF NOT EXISTS repos (full_name TEXT PRIMARY KEY, owner TEXT, name TEXT, visibility TEXT, default_branch TEXT, description TEXT, language TEXT, html_url TEXT, latest_sha TEXT, last_indexed_at TEXT, metadata_json TEXT)",
    "CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, repo_full_name TEXT, path TEXT, branch TEXT, sha TEXT, size INTEGER, language TEXT, stone_hash TEXT, indexed_at TEXT, metadata_json TEXT, UNIQUE(repo_full_name,path,branch))",
    "CREATE TABLE IF NOT EXISTS stones (hash TEXT PRIMARY KEY, chain TEXT, kind TEXT, title TEXT, lod5 TEXT, lod4 TEXT, summary TEXT, flags_json TEXT, metadata_json TEXT, raw_text TEXT, created_at TEXT)",
    "CREATE TABLE IF NOT EXISTS edges (id TEXT PRIMARY KEY, from_stone TEXT, to_stone TEXT, edge_type TEXT, reason TEXT, confidence REAL, created_at TEXT)",
    "CREATE TABLE IF NOT EXISTS index_jobs (id TEXT PRIMARY KEY, kind TEXT, subject TEXT, status TEXT, created_at TEXT, updated_at TEXT, stats_json TEXT, error TEXT)",
    "CREATE TABLE IF NOT EXISTS queries (id TEXT PRIMARY KEY, kind TEXT, query_text TEXT, repo_scope TEXT, params_json TEXT, result_summary TEXT, result_json TEXT, result_count INTEGER, created_at TEXT)",
    "CREATE INDEX IF NOT EXISTS idx_files_repo ON files(repo_full_name)",
    "CREATE INDEX IF NOT EXISTS idx_stones_chain ON stones(chain)",
    "CREATE INDEX IF NOT EXISTS idx_stones_kind ON stones(kind)",
    "CREATE INDEX IF NOT EXISTS idx_edges_from ON edges(from_stone)",
    "CREATE INDEX IF NOT EXISTS idx_edges_to ON edges(to_stone)",
    "CREATE INDEX IF NOT EXISTS idx_queries_kind ON queries(kind)",
    "CREATE INDEX IF NOT EXISTS idx_queries_repo ON queries(repo_scope)",
    "CREATE INDEX IF NOT EXISTS idx_queries_created ON queries(created_at)"
  ];
  for (const sql of statements) await env.DB.prepare(sql).run();
  return { ok: true };
}
async function run(env, sql, params = []) { await schema(env); return env.DB.prepare(sql).bind(...params).run(); }
async function first(env, sql, params = []) { await schema(env); return env.DB.prepare(sql).bind(...params).first(); }
async function all(env, sql, params = []) { await schema(env); const r = await env.DB.prepare(sql).bind(...params).all(); return r.results || []; }

async function gh(env, path) {
  if (!env.GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN secret binding.");
  const r = await fetch("https://api.github.com" + path, {
    headers: {
      "Authorization": "Bearer " + env.GITHUB_TOKEN,
      "Accept": "application/vnd.github+json",
      "User-Agent": NAME,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${typeof data === "string" ? data : JSON.stringify(data).slice(0, 500)}`);
  return data;
}

// Bridge to CairnStone V5 via service binding (Workers can't fetch another
// *.workers.dev directly - see AFO Toolchain guide Section 5). This worker
// no longer stores raw file content itself; V5 is the source of truth.
async function v5Call(env, toolName, args) {
  if (!env.CAIRNSTONE_V5) throw new Error("Missing CAIRNSTONE_V5 service binding.");
  const r = await env.CAIRNSTONE_V5.fetch(V5_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: id("v5"), method: "tools/call", params: { name: toolName, arguments: args } })
  });
  const data = await r.json();
  if (data.error) throw new Error("CairnStone V5 error: " + data.error.message);
  const text = data.result && data.result.content && data.result.content[0] && data.result.content[0].text;
  if (!text) throw new Error("CairnStone V5: empty response for " + toolName);
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

async function listRepos(env, owner, visibility = "all", limit = 100) {
  const user = await gh(env, "/user");
  let repos;
  if (user.login.toLowerCase() === owner.toLowerCase()) {
    repos = await gh(env, `/user/repos?per_page=${Math.min(limit, 100)}&sort=updated&direction=desc&affiliation=owner,collaborator,organization_member`);
    repos = repos.filter(r => r.owner.login.toLowerCase() === owner.toLowerCase());
  } else {
    repos = await gh(env, `/users/${encodeURIComponent(owner)}/repos?per_page=${Math.min(limit, 100)}&sort=updated&direction=desc`);
  }
  if (visibility === "public") repos = repos.filter(r => !r.private);
  if (visibility === "private") repos = repos.filter(r => r.private);
  return repos.slice(0, limit);
}
async function branchSha(env, repo, branch) {
  const ref = await gh(env, `/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  return ref.object?.sha || null;
}
async function repoTree(env, repo, branch) {
  const sha = await branchSha(env, repo, branch);
  if (!sha) return [];
  const tree = await gh(env, `/repos/${repo}/git/trees/${sha}?recursive=1`);
  return tree.tree || [];
}
async function blobText(env, repo, sha) {
  const blob = await gh(env, `/repos/${repo}/git/blobs/${sha}`);
  return b64decode(blob.content);
}
async function upsertRepo(env, meta, latestSha) {
  await run(env,
    "INSERT OR REPLACE INTO repos VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [meta.full_name, meta.owner.login, meta.name, meta.private ? "private" : "public", meta.default_branch, meta.description || "", meta.language || "", meta.html_url, latestSha, now(), JSON.stringify({ topics: meta.topics, stars: meta.stargazers_count })]
  );
}

// Stones the file into CairnStone V5 (the real vault) via the service
// binding, then keeps only a thin local pointer + compatibility-feature
// cache row - no raw content duplicated locally.
async function storeFileStone(env, repo, path, branch, sha, size, text) {
  const feats = features(path, text);
  const kind = kindFor(path, feats);
  const chain = chainFor(repo);
  const [owner, repoName] = repo.split("/");
  const v5 = await v5Call(env, "cairnstone_create_github_file_stone", {
    author: "cairnstone-github-vault-mcp",
    owner, repo: repoName, path, ref: branch, chain,
    metadata: { detected_features: feats, kind, indexed_via: NAME }
  });
  const hash = v5.stone_hash;
  if (!hash) throw new Error("CairnStone V5 did not return a stone_hash for " + path);
  const lod5 = (v5.stone && v5.stone.layers && v5.stone.layers.lod5) || "";
  const title = (v5.stone && v5.stone.border && v5.stone.border.title) || path.split("/").pop();
  await run(env, "INSERT OR REPLACE INTO stones VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [hash, chain, kind, title, lod5, "", lod5, JSON.stringify({ features: feats, word_count: words(text).length }), "{}", "", now()]);
  const fileId = await digest(repo + ":" + path + ":" + branch);
  await run(env, "INSERT OR REPLACE INTO files VALUES (?,?,?,?,?,?,?,?,?,?)",
    [fileId, repo, path, branch, sha, size, language(path), hash, now(), JSON.stringify({ v5_chain: chain })]);
  return { hash, path, kind, features: feats, v5_chain: chain };
}

// Local, heuristic cross-repo compatibility edges - a different concept
// from CairnStone V5's own graph, so this stays local by design.
async function linkCandidates(env, repo) {
  const stones = await all(env, "SELECT hash,path,kind,flags_json,lod5 FROM files JOIN stones ON files.stone_hash=stones.hash WHERE repo_full_name=? LIMIT 500", [repo]);
  let edges = 0;
  for (const a of stones) for (const b of stones) {
    if (a.hash === b.hash) continue;
    const af = JSON.parse(a.flags_json || "{}").features || [];
    const bf = JSON.parse(b.flags_json || "{}").features || [];
    let type = null, reason = "";
    if (af.includes("podcast_rss") && bf.includes("three_js_3d_ui")) { type = "can_feed"; reason = "Podcast episode metadata can be rendered as 3D scene nodes."; }
    if (af.includes("three_js_3d_ui") && bf.includes("podcast_rss")) { type = "can_visualize"; reason = "3D scene runtime can visualize podcast episode metadata."; }
    if (af.includes("cloudflare_worker") && bf.includes("cloudflare_config")) { type = "uses_binding"; reason = "Worker source pairs with Cloudflare config."; }
    if (!type) continue;
    const eid = await digest(`${a.hash}:${type}:${b.hash}`);
    await run(env, "INSERT OR IGNORE INTO edges VALUES (?, ?, ?, ?, ?, ?, ?)", [eid, a.hash, b.hash, type, reason, 0.82, now()]);
    edges++;
  }
  return edges;
}
async function stoneRepo(env, args) {
  const repo = args.repo;
  const meta = await gh(env, `/repos/${repo}`);
  const branch = args.branch || meta.default_branch || "main";
  const latest = await branchSha(env, repo, branch).catch(() => "");
  await upsertRepo(env, meta, latest);
  const tree = await repoTree(env, repo, branch);
  const max = Math.min(Number(args.max_files || 80), 300);
  const candidates = tree.filter(x => x.type === "blob" && shouldIndex(x.path, x.size)).slice(0, max);
  const stoned = [];
  const errors = [];
  for (const f of candidates) {
    try {
      const text = await blobText(env, repo, f.sha);
      stoned.push(await storeFileStone(env, repo, f.path, branch, f.sha, f.size, text));
    } catch (e) {
      errors.push({ path: f.path, error: e.message });
    }
  }
  const edges = await linkCandidates(env, repo);
  return { ok: true, repo, branch, latest_sha: latest, chain: chainFor(repo), candidates: candidates.length, stoned_count: stoned.length, edge_count: edges, stoned, errors };
}
async function stoneAccount(env, args) {
  const repos = await listRepos(env, args.owner, args.visibility || "all", Number(args.limit || 25));
  const jobId = id("job");
  await run(env, "INSERT OR REPLACE INTO index_jobs VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [jobId, "account", args.owner, "running", now(), now(), "{}", null]);
  const results = [];
  for (const r of repos) {
    try {
      const result = await stoneRepo(env, { repo: r.full_name, max_files: args.max_files_per_repo || 60 });
      results.push({ repo: r.full_name, ok: true, stoned_count: result.stoned_count });
    } catch (e) {
      results.push({ repo: r.full_name, ok: false, error: e.message });
    }
  }
  const stats = { repos: repos.length, indexed: results.filter(x => x.ok).length, failed: results.filter(x => !x.ok).length };
  await run(env, "UPDATE index_jobs SET status=?, updated_at=?, stats_json=? WHERE id=?", ["complete", now(), JSON.stringify(stats), jobId]);
  return { ok: true, job_id: jobId, stats, results };
}
async function stoneFile(env, args) {
  const repo = args.repo;
  const ref = args.ref || "main";
  const p = encodeURIComponent(args.path).replace(/%2F/g, "/");
  const item = await gh(env, `/repos/${repo}/contents/${p}?ref=${encodeURIComponent(ref)}`);
  if (item.type !== "file") throw new Error("Path is not a file.");
  const text = item.content ? b64decode(item.content) : await blobText(env, repo, item.sha);
  const out = await storeFileStone(env, repo, args.path, ref, item.sha, item.size, text);
  await linkCandidates(env, repo);
  return { ok: true, repo, ref, ...out };
}
async function status(env) {
  const db = Boolean(env.DB), token = Boolean(env.GITHUB_TOKEN), v5 = Boolean(env.CAIRNSTONE_V5);
  if (!db) return { ok: false, worker: NAME, version: VERSION, db, github_token: token, cairnstone_v5_binding: v5 };
  await schema(env);
  const repos = await first(env, "SELECT COUNT(*) n FROM repos");
  const files = await first(env, "SELECT COUNT(*) n FROM files");
  const stones = await first(env, "SELECT COUNT(*) n FROM stones");
  const edges = await first(env, "SELECT COUNT(*) n FROM edges");
  const jobs = await first(env, "SELECT COUNT(*) n FROM index_jobs");
  const queries = await first(env, "SELECT COUNT(*) n FROM queries");
  return { ok: true, worker: NAME, version: VERSION, db, github_token: token, cairnstone_v5_binding: v5, counts: { repos: repos.n, files: files.n, stones: stones.n, edges: edges.n, jobs: jobs.n, queries: queries.n }, tools: TOOLS.map(t => t.name) };
}

async function logQuery(env, kind, queryText, repoScope, params, result) {
  const qid = id("q");
  const count = typeof result.count === "number" ? result.count : (Array.isArray(result.results) ? result.results.length : 0);
  const summary = `${kind}: "${queryText || ""}" -> ${count} result(s)`;
  await run(env, "INSERT INTO queries VALUES (?,?,?,?,?,?,?,?,?)",
    [qid, kind, queryText || "", repoScope || "", JSON.stringify(params || {}), summary, JSON.stringify(result).slice(0, 20000), count, now()]);
  return qid;
}

async function searchVault(env, args) {
  const q = String(args.query || "").toLowerCase();
  const limit = Math.min(Number(args.limit || 20), 100);
  const qs = words(q).slice(0, 12);
  const rows = await all(env, "SELECT files.repo_full_name, files.path, files.branch, files.sha, stones.hash, stones.kind, stones.title, stones.lod5, stones.flags_json FROM stones JOIN files ON stones.hash=files.stone_hash LIMIT 2000");
  const scored = rows.map(r => {
    const hay = `${r.repo_full_name} ${r.path} ${r.kind} ${r.title} ${r.lod5} ${r.flags_json}`.toLowerCase();
    let score = 0;
    for (const term of qs) if (hay.includes(term)) score += term.length + 2;
    if (hay.includes(q)) score += 50;
    return { ...r, score };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map(r => ({
    repo: r.repo_full_name, path: r.path, branch: r.branch, sha: r.sha, stone_hash: r.hash, kind: r.kind, score: r.score, summary: r.lod5, features: JSON.parse(r.flags_json || "{}").features || []
  }));
  const result = { ok: true, query: args.query, count: scored.length, results: scored };
  await logQuery(env, "query_github_vault", args.query, null, args, result);
  return result;
}

async function manifest(env, args) {
  const repo = args.repo;
  const chain = chainFor(repo);
  const files = await all(env, "SELECT files.path, files.branch, files.sha, files.language, files.stone_hash, stones.kind, stones.lod5, stones.flags_json FROM files JOIN stones ON files.stone_hash=stones.hash WHERE repo_full_name=? ORDER BY files.path", [repo]);
  const byKind = {};
  for (const f of files) byKind[f.kind] = (byKind[f.kind] || 0) + 1;
  const feats = [...new Set(files.flatMap(f => JSON.parse(f.flags_json || "{}").features || []))];
  const repoRow = await first(env, "SELECT * FROM repos WHERE full_name=?", [repo]);
  const localEdges = await all(env, "SELECT edge_type, reason, confidence FROM edges WHERE from_stone IN (SELECT stone_hash FROM files WHERE repo_full_name=?) LIMIT 50", [repo]);
  let v5Manifest = null;
  try { v5Manifest = await v5Call(env, "cairnstone_get_chain_manifest", { chain }); } catch (e) { v5Manifest = { ok: false, error: e.message }; }
  return { ok: true, chain, repo: repoRow, file_count: files.length, kinds: byKind, features: feats, files, local_compatibility_edges: localEdges, cairnstone_v5: v5Manifest };
}

async function discover(env, args) {
  const q = args.query || args.repo || "";
  const base = q ? (await searchVaultRaw(env, { query: q, limit: 80 })) : await all(env, "SELECT files.repo_full_name repo, files.path path, stones.hash stone_hash, stones.kind kind, stones.lod5 summary, stones.flags_json flags_json FROM stones JOIN files ON stones.hash=files.stone_hash LIMIT 200");
  const rows = await all(env, "SELECT files.repo_full_name repo, files.path path, stones.hash stone_hash, stones.kind kind, stones.lod5 summary, stones.flags_json flags_json FROM stones JOIN files ON stones.hash=files.stone_hash LIMIT 2000");
  const pairs = [];
  for (const a of base) for (const b of rows) {
    if (a.stone_hash === b.stone_hash || a.repo === b.repo) continue;
    const af = a.features || JSON.parse(a.flags_json || "{}").features || [];
    const bf = JSON.parse(b.flags_json || "{}").features || [];
    let reason = null, type = null, score = 0;
    if (af.includes("podcast_rss") && bf.includes("three_js_3d_ui")) { type = "candidate_fusion"; reason = "Podcast/RSS episode metadata can feed 3D scene nodes."; score = 94; }
    if (af.includes("three_js_3d_ui") && bf.includes("podcast_rss")) { type = "candidate_fusion"; reason = "3D UI can visualize podcast/RSS episode data."; score = 94; }
    if (af.includes("cloudflare_worker") && bf.includes("cloudflare_config")) { type = "config_pair"; reason = "Worker source may pair with Cloudflare deployment config."; score = 70; }
    if (af.includes("template_system") && bf.includes("dashboard_ui")) { type = "template_reuse"; reason = "Template/compiler pattern may be reusable by dashboard UI."; score = 68; }
    if (!reason) continue;
    pairs.push({ type, score, reason, from: { repo: a.repo, path: a.path, kind: a.kind, stone_hash: a.stone_hash, summary: a.summary }, to: { repo: b.repo, path: b.path, kind: b.kind, stone_hash: b.stone_hash, summary: b.summary }, shared_or_complementary_features: { from: af, to: bf } });
  }
  pairs.sort((a, b) => b.score - a.score);
  const result = { ok: true, query: q, count: pairs.length, results: pairs.slice(0, Math.min(Number(args.limit || 20), 100)) };
  await logQuery(env, "discover_repo_combinations", q, args.repo || null, args, result);
  return result;
}
// Internal helper (no history logging) used by discover() to avoid
// double-logging one discover call as two query-history rows.
async function searchVaultRaw(env, args) {
  const q = String(args.query || "").toLowerCase();
  const limit = Math.min(Number(args.limit || 20), 100);
  const qs = words(q).slice(0, 12);
  const rows = await all(env, "SELECT files.repo_full_name, files.path, files.branch, files.sha, stones.hash, stones.kind, stones.title, stones.lod5, stones.flags_json FROM stones JOIN files ON stones.hash=files.stone_hash LIMIT 2000");
  return rows.map(r => {
    const hay = `${r.repo_full_name} ${r.path} ${r.kind} ${r.title} ${r.lod5} ${r.flags_json}`.toLowerCase();
    let score = 0;
    for (const term of qs) if (hay.includes(term)) score += term.length + 2;
    if (hay.includes(q)) score += 50;
    return { repo: r.repo_full_name, path: r.path, stone_hash: r.hash, kind: r.kind, score, summary: r.lod5, flags_json: r.flags_json, features: JSON.parse(r.flags_json || "{}").features || [] };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

async function searchHistory(env, args) {
  const limit = Math.min(Number(args.limit || 20), 100);
  let sql = "SELECT id, kind, query_text, repo_scope, result_summary, result_count, created_at FROM queries WHERE 1=1";
  const params = [];
  if (args.kind) { sql += " AND kind=?"; params.push(args.kind); }
  if (args.repo) { sql += " AND repo_scope=?"; params.push(args.repo); }
  if (args.query) { sql += " AND (query_text LIKE ? OR result_summary LIKE ?)"; params.push(`%${args.query}%`, `%${args.query}%`); }
  sql += " ORDER BY created_at DESC LIMIT ?"; params.push(limit);
  const rows = await all(env, sql, params);
  return { ok: true, count: rows.length, results: rows };
}

async function refreshChanged(env, args) {
  const repos = await listRepos(env, args.owner, "all", Number(args.limit || 50));
  const refreshed = [];
  for (const r of repos) {
    const branch = r.default_branch || "main";
    const latest = await branchSha(env, r.full_name, branch).catch(() => "");
    const row = await first(env, "SELECT latest_sha FROM repos WHERE full_name=?", [r.full_name]);
    if (!row || row.latest_sha !== latest) refreshed.push(await stoneRepo(env, { repo: r.full_name, branch, max_files: args.max_files_per_repo || 60 }));
  }
  return { ok: true, refreshed_count: refreshed.length, refreshed };
}
async function handleTool(name, args, env) {
  if (name === "github_vault_status") return status(env);
  if (name === "stone_github_account") return stoneAccount(env, args);
  if (name === "stone_github_repo") return stoneRepo(env, args);
  if (name === "stone_github_file") return stoneFile(env, args);
  if (name === "query_github_vault") return searchVault(env, args);
  if (name === "get_repo_manifest") return manifest(env, args);
  if (name === "discover_repo_combinations") return discover(env, args);
  if (name === "search_query_history") return searchHistory(env, args);
  if (name === "refresh_changed_repos") return refreshChanged(env, args);
  throw new Error("Unknown tool: " + name);
}
function rpc(id, result) { return J({ jsonrpc: "2.0", id, result }); }
function rpcError(id, code, message) { return J({ jsonrpc: "2.0", id, error: { code, message } }); }
function page() {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${NAME}</title><style>
  body{font-family:system-ui;margin:0;background:#07111f;color:#e8f1ff}main{max-width:1100px;margin:auto;padding:28px}.hero{background:linear-gradient(135deg,#102a43,#0b1727);border:1px solid #294866;border-radius:24px;padding:24px}input,textarea,button{font:inherit;border-radius:12px;border:1px solid #375a7f;padding:12px;background:#091827;color:#e8f1ff}button{cursor:pointer;background:#4cc9f0;color:#03101a;font-weight:800}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.card{background:#0b1727;border:1px solid #253b55;border-radius:18px;padding:16px;margin:12px 0}pre{white-space:pre-wrap;overflow:auto;background:#020817;padding:14px;border-radius:14px}.muted{color:#9fb3c8}</style></head><body><main>
  <section class="hero"><h1>GitHub Stone Vault MCP</h1><p>GitHub &rarr; CairnStone V5 bridge indexer, local compatibility search, and repo-combination discovery.</p><p class="muted">Bind D1 as DB, CAIRNSTONE_V5 as a service binding, and GITHUB_TOKEN as a secret. Then call MCP tools or use /api/search?q=...</p></section>
  <div class="grid"><div class="card"><h2>Search</h2><input id="q" placeholder="Joe Rogan 3D podcast explorer" style="width:100%"><p><button onclick="go()">Search vault</button></p></div><div class="card"><h2>Status</h2><button onclick="status()">Load status</button></div></div>
  <pre id="out"></pre>
  <script>
  async function show(x){out.textContent=JSON.stringify(x,null,2)}
  async function status(){show(await (await fetch('/api/status')).json())}
  async function go(){show(await (await fetch('/api/search?q='+encodeURIComponent(q.value))).json())}
  status()
  </script></main></body></html>`;
}
async function body(req) { try { return await req.json(); } catch { return null; } }

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    try {
      if (url.pathname === "/" || url.pathname === "/dashboard") return T(page(), "text/html; charset=utf-8");
      if (url.pathname === "/health" || url.pathname === "/api/status") return J(await status(env));
      if (url.pathname === "/mcp/tools") return J({ name: NAME, version: VERSION, tools: TOOLS });
      if (url.pathname === "/mcp/schema") return J({ name: NAME, version: VERSION, tools: TOOLS });
      if (url.pathname === "/api/search") return J(await searchVault(env, { query: url.searchParams.get("q") || "", limit: url.searchParams.get("limit") || 20 }));
      if (url.pathname === "/api/discover") return J(await discover(env, { query: url.searchParams.get("q") || "", repo: url.searchParams.get("repo") || "", limit: url.searchParams.get("limit") || 20 }));
      if (url.pathname === "/mcp/call" && request.method === "POST") {
        const p = await body(request);
        return J(await handleTool(p.tool || p.name, p.input || p.arguments || {}, env));
      }
      if (request.method === "POST") {
        const p = await body(request);
        const { id: rid, method, params = {} } = p || {};
        if (method === "initialize") return rpc(rid, { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: NAME, version: VERSION } });
        if (method === "notifications/initialized") return new Response(null, { status: 204, headers: CORS });
        if (method === "tools/list") return rpc(rid, { tools: TOOLS });
        if (method === "tools/call") {
          try {
            const result = await handleTool(params.name, params.arguments || {}, env);
            return rpc(rid, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
          } catch (e) { return rpcError(rid, -32603, e.message); }
        }
        return rpcError(rid, -32601, "Method not found: " + method);
      }
      return J({ ok: false, error: "not_found", routes: ["/","/health","/api/status","/api/search","/api/discover","/mcp/tools","/mcp/call"] }, 404);
    } catch (e) {
      return J({ ok: false, error: e.message, worker: NAME, version: VERSION }, 500);
    }
  }
};
