const VERSION="0.1.0";
const WORKER_NAME="afo-repo-indexer-mcp";
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization,Mcp-Session-Id'};
const TOOLS=[{
  "name": "afo-repo-indexer_status",
  "description": "Health check. Returns version, all binding statuses, and tool list.",
  "inputSchema": {
    "type": "object",
    "properties": {},
    "required": []
  }
},
{
  "name": "index_repo",
  "description": "Crawl a GitHub repo path, chunk all text files, generate embeddings with Workers AI, and upsert into Vectorize. Idempotent — checks KV for the last indexed SHA and skips unchanged files. Records job status in D1.",
  "inputSchema": {
    "properties": {
      "branch": {
        "default": "main",
        "description": "Branch to index",
        "type": "string"
      },
      "force": {
        "default": false,
        "description": "Re-index even if SHA unchanged",
        "type": "boolean"
      },
      "max_files": {
        "default": 30,
        "description": "Max files to index per call (default: 30)",
        "type": "number"
      },
      "owner": {
        "default": "nothinginfinity",
        "description": "GitHub owner/org",
        "type": "string"
      },
      "path": {
        "description": "Subtree path to index — empty for root",
        "type": "string"
      },
      "repo": {
        "description": "GitHub repo name",
        "type": "string"
      }
    },
    "required": [
      "repo"
    ],
    "type": "object"
  }
},
{
  "name": "search_repos",
  "description": "Semantic search across all indexed repos using Vectorize. Returns ranked file chunks with source repo, path, and similarity score.",
  "inputSchema": {
    "properties": {
      "query": {
        "description": "Natural language or code search query",
        "type": "string"
      },
      "repo": {
        "description": "Limit to a specific repo slug (optional)",
        "type": "string"
      },
      "top_k": {
        "default": 8,
        "description": "Number of results (default: 8, max: 20)",
        "type": "number"
      }
    },
    "required": [
      "query"
    ],
    "type": "object"
  }
},
{
  "name": "list_indexed_repos",
  "description": "List all repos that have been indexed, with last indexed SHA and file counts.",
  "inputSchema": {
    "properties": {
      "limit": {
        "default": 30,
        "type": "number"
      }
    },
    "required": [],
    "type": "object"
  }
},
{
  "name": "get_index_job",
  "description": "Get status and details of a specific indexing job by job_id.",
  "inputSchema": {
    "properties": {
      "job_id": {
        "description": "Job ID from index_repo",
        "type": "string"
      }
    },
    "required": [
      "job_id"
    ],
    "type": "object"
  }
}];
function rpc(id,r){return Response.json({jsonrpc:"2.0",id,result:r},{headers:CORS});}
function errResp(id,c,m){return Response.json({jsonrpc:"2.0",id,error:{code:c,message:m}},{headers:CORS});}
function tool(id,r){return rpc(id,{content:[{type:"text",text:JSON.stringify(r,null,2)}]});}
function genId(p){return p+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8);}
function nowIso(){return new Date().toISOString();}
async function dbRun(db,sql,p){const s=db.prepare(sql);return p?s.bind(...p).run():s.run();}
async function dbFirst(db,sql,p){const s=db.prepare(sql);return p?s.bind(...p).first():s.first();}
async function dbAll(db,sql,p){const s=db.prepare(sql);const r=p?await s.bind(...p).all():await s.all();return r.results||[];}
async function ensureSchema(db){await db.prepare(`CREATE TABLE IF NOT EXISTS mcp_sessions (session_id TEXT PRIMARY KEY,worker_name TEXT NOT NULL,status TEXT DEFAULT 'active',parent_id TEXT,metadata TEXT,started_at TEXT NOT NULL,updated_at TEXT NOT NULL,finished_at TEXT)`).run();await db.prepare(`CREATE TABLE IF NOT EXISTS action_execution_logs (log_id TEXT PRIMARY KEY,session_id TEXT,worker_name TEXT NOT NULL,tool_name TEXT NOT NULL,status TEXT NOT NULL,input_json TEXT,output_summary TEXT,payload_uri TEXT,error_message TEXT,duration_ms INTEGER,input_tokens INTEGER,output_tokens INTEGER,vector_id TEXT,created_at TEXT NOT NULL)`).run();await db.prepare(`CREATE TABLE IF NOT EXISTS schema_migrations (migration_id TEXT PRIMARY KEY,worker_name TEXT NOT NULL,description TEXT,applied_at TEXT NOT NULL,checksum TEXT)`).run();}
async function kvSet(kv,k,v,o){await kv.put(k,typeof v==="string"?v:JSON.stringify(v),o||{});}
async function kvGet(kv,k){const v=await kv.get(k);if(v===null)return null;try{return JSON.parse(v);}catch{return v;}}
async function embedText(ai,t){if(!ai)return null;try{const r=await ai.run("@cf/baai/bge-base-en-v1.5",{text:[t.slice(0,512)]});return(r.data&&r.data[0])||null;}catch{return null;}}
async function vectorQuery(v,ai,q,k){const vec=await embedText(ai,q);if(!vec)return[];try{const r=await v.query(vec,{topK:k||5,returnMetadata:true});return r.matches||[];}catch{return[];}}
async function handle(name,args,env,ctx){
  if(name==="afo_repo_indexer_status"){const res={status:"ok",worker:WORKER_NAME,version:VERSION,generated_at:"2026-06-13T15:13:46.746Z",bindings:{},tools:TOOLS.map(t=>t.name)};
  try{await ensureSchema(env.DB);res.bindings.DB=true;}catch{res.bindings.DB=false;}
  try{await env.KV.put("_ping","1",{expirationTtl:60});res.bindings.KV=true;}catch{res.bindings.KV=false;}
  res.bindings.VECTORIZE=!!env.VECTORIZE;res.bindings.AI=!!env.AI;
  return res;}
  await ensureSchema(env.DB);
  if (name === "index_repo") {
    const { repo } = args;
    if (!repo) throw new Error("index_repo: repo required");
    const owner = args.owner || 'nothinginfinity';
    const branch = args.branch || 'main';
    const maxFiles = args.max_files || 30;
    const repoKey = owner + '/' + args.repo;
    const jobId = genId('idx');
    const ts = nowIso();
    const kvKey = 'index:' + repoKey + ':' + (args.path || 'root') + ':sha';
    const lastSha = await kvGet(env.KV, kvKey);
    let currentSha = 'unknown';
    try { const refRes = await fetch('https://api.github.com/repos/' + owner + '/' + args.repo + '/git/ref/heads/' + branch, { headers: { 'Authorization': 'Bearer ' + env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json', 'User-Agent': 'afo-repo-indexer-mcp/0.1.0' } }); if (refRes.ok) { const j = await refRes.json(); currentSha = j.object && j.object.sha ? j.object.sha.slice(0, 12) : 'unknown'; } } catch {}
    if (!args.force && lastSha === currentSha && currentSha !== 'unknown') { return { ok: true, skipped: true, reason: 'SHA unchanged since last index', sha: currentSha, repo: repoKey }; }
    async function listFiles(path, depth) { if (depth > 6) return []; const url = 'https://api.github.com/repos/' + owner + '/' + args.repo + '/contents/' + encodeURIComponent(path || '') + '?ref=' + branch; const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + env.GITHUB_TOKEN, 'Accept': 'application/vnd.github+json', 'User-Agent': 'afo-repo-indexer-mcp/0.1.0' } }); if (!res.ok) return []; const items = await res.json(); if (!Array.isArray(items)) return []; const files = []; const SKIP_EXT = new Set(['png','jpg','jpeg','gif','webp','ico','woff','woff2','ttf','pdf','zip','wasm','bin']); const SKIP_DIR = new Set(['node_modules','.git','.wrangler','dist','build']); for (const item of items) { if (item.type === 'file') { const ext = item.name.split('.').pop().toLowerCase(); if (!SKIP_EXT.has(ext) && item.size < 100000) files.push({ path: item.path, size: item.size, sha: item.sha }); } else if (item.type === 'dir' && !SKIP_DIR.has(item.name)) { const sub = await listFiles(item.path, depth + 1); files.push(...sub); } } return files; }
    const allFiles = await listFiles(args.path || '', 0);
    const toIndex = allFiles.slice(0, maxFiles);
    await dbRun(env.DB, 'CREATE TABLE IF NOT EXISTS index_jobs (job_id TEXT PRIMARY KEY, repo_key TEXT NOT NULL, branch TEXT, path TEXT, files_planned INTEGER, files_indexed INTEGER, status TEXT, created_at TEXT, updated_at TEXT)');
    await dbRun(env.DB, 'INSERT INTO index_jobs VALUES (?,?,?,?,?,?,?,?,?)', [jobId, repoKey, branch, args.path || '', toIndex.length, 0, 'running', ts, ts]);
    let indexed = 0;
    const errors = [];
    for (const file of toIndex) { try { const rawRes = await fetch('https://api.github.com/repos/' + owner + '/' + args.repo + '/contents/' + encodeURIComponent(file.path) + '?ref=' + branch, { headers: { 'Authorization': 'Bearer ' + env.GITHUB_TOKEN, 'Accept': 'application/vnd.github.raw+json', 'User-Agent': 'afo-repo-indexer-mcp/0.1.0' } }); if (!rawRes.ok) continue; const content = await rawRes.text(); if (!content.trim()) continue; const chunks = []; const CHUNK = 400; const OVERLAP = 80; for (let i = 0; i < content.length; i += CHUNK - OVERLAP) { chunks.push(content.slice(i, i + CHUNK)); if (i + CHUNK >= content.length) break; } for (let c = 0; c < Math.min(chunks.length, 5); c++) { const text = repoKey + ' ' + file.path + ': ' + chunks[c]; const embRes = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [text.slice(0, 512)] }); const vector = embRes.data && embRes.data[0]; if (!vector) continue; const vecId = jobId + '_' + indexed + '_' + c; await env.VECTORIZE.upsert([{ id: vecId, values: vector, metadata: { repo: repoKey, path: file.path, chunk: c, sha: file.sha, branch } }]); } indexed++; } catch (e) { errors.push({ path: file.path, error: e.message }); } }
    await dbRun(env.DB, 'UPDATE index_jobs SET files_indexed=?,status=?,updated_at=? WHERE job_id=?', [indexed, errors.length > 0 ? 'partial' : 'complete', nowIso(), jobId]);
    if (indexed > 0) await kvSet(env.KV, kvKey, currentSha);
    await kvSet(env.KV, 'index:' + repoKey + ':last_job', jobId);
    return { ok: true, job_id: jobId, repo: repoKey, branch, path: args.path || 'root', files_found: allFiles.length, files_indexed: indexed, files_truncated: allFiles.length > maxFiles, sha: currentSha, errors };
  }

  if (name === "search_repos") {
    const { query } = args;
    if (!query) throw new Error("search_repos: query required");
    const topK = Math.min(args.top_k || 8, 20);
    const embRes = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [args.query.slice(0, 512)] });
    const vector = embRes.data && embRes.data[0];
    if (!vector) throw new Error('Embedding failed');
    const results = await env.VECTORIZE.query(vector, { topK, returnMetadata: true });
    let matches = results.matches || [];
    if (args.repo) matches = matches.filter(function(m) { return m.metadata && m.metadata.repo && m.metadata.repo.includes(args.repo); });
    return { ok: true, query: args.query, count: matches.length, results: matches.map(function(m) { return { score: m.score, repo: m.metadata && m.metadata.repo, path: m.metadata && m.metadata.path, chunk: m.metadata && m.metadata.chunk, sha: m.metadata && m.metadata.sha, id: m.id }; }) };
  }

  if (name === "list_indexed_repos") {
    await dbRun(env.DB, 'CREATE TABLE IF NOT EXISTS index_jobs (job_id TEXT PRIMARY KEY, repo_key TEXT NOT NULL, branch TEXT, path TEXT, files_planned INTEGER, files_indexed INTEGER, status TEXT, created_at TEXT, updated_at TEXT)');
    const rows = await dbAll(env.DB, 'SELECT repo_key, branch, path, files_indexed, status, created_at FROM index_jobs ORDER BY created_at DESC LIMIT ?', [args.limit || 30]);
    const byRepo = {};
    for (const r of rows) { if (!byRepo[r.repo_key]) byRepo[r.repo_key] = r; }
    return { ok: true, indexed_repos: Object.values(byRepo), total: Object.keys(byRepo).length };
  }

  if (name === "get_index_job") {
    const { job_id } = args;
    if (!job_id) throw new Error("get_index_job: job_id required");
    await dbRun(env.DB, 'CREATE TABLE IF NOT EXISTS index_jobs (job_id TEXT PRIMARY KEY, repo_key TEXT NOT NULL, branch TEXT, path TEXT, files_planned INTEGER, files_indexed INTEGER, status TEXT, created_at TEXT, updated_at TEXT)');
    const rows = await dbAll(env.DB, 'SELECT * FROM index_jobs WHERE job_id = ? LIMIT 1', [args.job_id]);
    return { ok: true, job: rows[0] || null, found: rows.length > 0 };
  }

  throw new Error("Unknown tool: "+name);}
export default{async fetch(request,env,ctx){if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});const url=new URL(request.url);if(url.pathname==="/health")return Response.json({status:"ok",worker:WORKER_NAME,version:VERSION},{headers:CORS});if(request.method!=="POST")return new Response("not found",{status:404,headers:CORS});let body;try{body=await request.json();}catch{return errResp(null,-32700,"Parse error");}const{id,method,params}=body;if(method==="initialize")return rpc(id,{protocolVersion:"2024-11-05",capabilities:{tools:{}},serverInfo:{name:WORKER_NAME,version:VERSION}});if(method==="notifications/initialized")return new Response(null,{status:204,headers:CORS});if(method==="ping")return rpc(id,{});if(method==="tools/list")return rpc(id,{tools:TOOLS});if(method==="tools/call"){try{return tool(id,await handle(params?.name,params?.arguments||{},env,ctx));}catch(e){return errResp(id,-32603,"Tool error: "+e.message);}}return errResp(id,-32601,"Method not found: "+method);}};