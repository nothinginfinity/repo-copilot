const VERSION="0.02.0";
const WORKER_NAME="afo-repo-indexer-mcp-v002";
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization,Mcp-Session-Id'};
const TOOLS=[{
  "name": "afo-repo-indexer-mcp-v002_status",
  "description": "Health check. Returns version, all binding statuses, and tool list.",
  "inputSchema": {
    "type": "object",
    "properties": {},
    "required": []
  }
},
{
  "name": "index_repo_batch",
  "description": "v0.02 resumable index API. Indexes a deterministic batch using offset/cursor/resume controls. This stamped scaffold records cursor/job state; implementation is intended to replace v0.1 root-slice behavior with cursor batching.",
  "inputSchema": {
    "type": "object",
    "required": [
      "repo"
    ],
    "properties": {
      "owner": {
        "type": "string",
        "default": "nothinginfinity"
      },
      "repo": {
        "type": "string"
      },
      "branch": {
        "type": "string",
        "default": "main"
      },
      "path": {
        "type": "string"
      },
      "max_files": {
        "type": "number",
        "default": 20
      },
      "offset": {
        "type": "number"
      },
      "cursor": {
        "type": "string"
      },
      "resume": {
        "type": "boolean",
        "default": false
      },
      "force": {
        "type": "boolean",
        "default": false
      }
    }
  }
},
{
  "name": "get_index_cursor",
  "description": "Return the stored v0.02 cursor for a repo/path/branch.",
  "inputSchema": {
    "type": "object",
    "required": [
      "repo"
    ],
    "properties": {
      "owner": {
        "type": "string",
        "default": "nothinginfinity"
      },
      "repo": {
        "type": "string"
      },
      "branch": {
        "type": "string",
        "default": "main"
      },
      "path": {
        "type": "string"
      }
    }
  }
},
{
  "name": "reset_index_cursor",
  "description": "Reset the stored v0.02 cursor for a repo/path/branch.",
  "inputSchema": {
    "type": "object",
    "required": [
      "repo"
    ],
    "properties": {
      "owner": {
        "type": "string",
        "default": "nothinginfinity"
      },
      "repo": {
        "type": "string"
      },
      "branch": {
        "type": "string",
        "default": "main"
      },
      "path": {
        "type": "string"
      },
      "offset": {
        "type": "number",
        "default": 0
      }
    }
  }
},
{
  "name": "get_index_job",
  "description": "Get v0.02 indexing job state by job_id.",
  "inputSchema": {
    "type": "object",
    "required": [
      "job_id"
    ],
    "properties": {
      "job_id": {
        "type": "string"
      }
    }
  }
},
{
  "name": "search_repos",
  "description": "Semantic search across indexed repos using the shared Vectorize index.",
  "inputSchema": {
    "type": "object",
    "required": [
      "query"
    ],
    "properties": {
      "query": {
        "type": "string"
      },
      "repo": {
        "type": "string"
      },
      "top_k": {
        "type": "number",
        "default": 8
      }
    }
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
  if(name==="afo_repo_indexer_mcp_v002_status"){const res={status:"ok",worker:WORKER_NAME,version:VERSION,generated_at:"2026-06-13T15:48:21.114Z",bindings:{},tools:TOOLS.map(t=>t.name)};
  try{await ensureSchema(env.DB);res.bindings.DB=true;}catch{res.bindings.DB=false;}
  try{await env.KV.put("_ping","1",{expirationTtl:60});res.bindings.KV=true;}catch{res.bindings.KV=false;}
  res.bindings.VECTORIZE=!!env.VECTORIZE;res.bindings.AI=!!env.AI;
  return res;}
  await ensureSchema(env.DB);
  if (name === "index_repo_batch") {
    const { repo } = args;
    if (!repo) throw new Error("index_repo_batch: repo required");
    const owner=args.owner||'nothinginfinity'; const branch=args.branch||'main'; const path=args.path||''; const repoKey=owner+'/'+args.repo; const pathKey=repoKey+':'+branch+':'+(path||'root'); const cursorKey='index:v002:'+pathKey+':cursor'; let start=0; if(typeof args.offset==='number') start=Math.max(0,Math.floor(args.offset)); if(args.cursor){ const n=parseInt(args.cursor,10); if(!Number.isNaN(n)) start=n; } if(args.resume){ const saved=await kvGet(env.KV,cursorKey); const n=parseInt(saved||'0',10); if(!Number.isNaN(n)) start=n; } const maxFiles=Math.max(1,Math.min(args.max_files||20,25)); const next=start+maxFiles; const jobId=genId('idx2'); await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS index_jobs_v002 (job_id TEXT PRIMARY KEY, repo_key TEXT, branch TEXT, path TEXT, start_offset INTEGER, next_cursor INTEGER, files_planned INTEGER, status TEXT, created_at TEXT, updated_at TEXT)'); await dbRun(env.DB,'INSERT INTO index_jobs_v002 VALUES (?,?,?,?,?,?,?,?,?,?)',[jobId,repoKey,branch,path,start,next,maxFiles,'scaffold',nowIso(),nowIso()]); await kvSet(env.KV,cursorKey,String(next)); return {ok:true, scaffold:true, message:'v0.02 cursor-aware worker stamped; replace scaffold handler with full GitHub crawl/index implementation for production indexing', job_id:jobId, repo:repoKey, branch, path:path||'root', start_offset:start, next_cursor:String(next), max_files:maxFiles};
  }

  if (name === "get_index_cursor") {
    const { repo } = args;
    if (!repo) throw new Error("get_index_cursor: repo required");
    const owner=args.owner||'nothinginfinity'; const branch=args.branch||'main'; const path=args.path||''; const repoKey=owner+'/'+args.repo; const cursorKey='index:v002:'+repoKey+':'+branch+':'+(path||'root')+':cursor'; return {ok:true, repo:repoKey, branch, path:path||'root', cursor:await kvGet(env.KV,cursorKey)||'0'};
  }

  if (name === "reset_index_cursor") {
    const { repo } = args;
    if (!repo) throw new Error("reset_index_cursor: repo required");
    const owner=args.owner||'nothinginfinity'; const branch=args.branch||'main'; const path=args.path||''; const repoKey=owner+'/'+args.repo; const cursorKey='index:v002:'+repoKey+':'+branch+':'+(path||'root')+':cursor'; const offset=Math.max(0,Math.floor(args.offset||0)); await kvSet(env.KV,cursorKey,String(offset)); return {ok:true, repo:repoKey, branch, path:path||'root', cursor:String(offset)};
  }

  if (name === "get_index_job") {
    const { job_id } = args;
    if (!job_id) throw new Error("get_index_job: job_id required");
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS index_jobs_v002 (job_id TEXT PRIMARY KEY, repo_key TEXT, branch TEXT, path TEXT, start_offset INTEGER, next_cursor INTEGER, files_planned INTEGER, status TEXT, created_at TEXT, updated_at TEXT)'); const rows=await dbAll(env.DB,'SELECT * FROM index_jobs_v002 WHERE job_id=? LIMIT 1',[args.job_id]); return {ok:true, found:rows.length>0, job:rows[0]||null};
  }

  if (name === "search_repos") {
    const { query } = args;
    if (!query) throw new Error("search_repos: query required");
    const topK=Math.min(args.top_k||8,20); const embRes=await env.AI.run('@cf/baai/bge-base-en-v1.5',{text:[args.query.slice(0,512)]}); const vector=embRes.data&&embRes.data[0]; if(!vector) throw new Error('Embedding failed'); const results=await env.VECTORIZE.query(vector,{topK,returnMetadata:true}); let matches=results.matches||[]; if(args.repo) matches=matches.filter(m=>m.metadata&&m.metadata.repo&&m.metadata.repo.includes(args.repo)); return {ok:true, query:args.query, count:matches.length, results:matches.map(m=>({score:m.score, repo:m.metadata&&m.metadata.repo, path:m.metadata&&m.metadata.path, chunk:m.metadata&&m.metadata.chunk, sha:m.metadata&&m.metadata.sha, id:m.id}))};
  }

  throw new Error("Unknown tool: "+name);}
export default{async fetch(request,env,ctx){if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});const url=new URL(request.url);if(url.pathname==="/health")return Response.json({status:"ok",worker:WORKER_NAME,version:VERSION},{headers:CORS});if(request.method!=="POST")return new Response("not found",{status:404,headers:CORS});let body;try{body=await request.json();}catch{return errResp(null,-32700,"Parse error");}const{id,method,params}=body;if(method==="initialize")return rpc(id,{protocolVersion:"2024-11-05",capabilities:{tools:{}},serverInfo:{name:WORKER_NAME,version:VERSION}});if(method==="notifications/initialized")return new Response(null,{status:204,headers:CORS});if(method==="ping")return rpc(id,{});if(method==="tools/list")return rpc(id,{tools:TOOLS});if(method==="tools/call"){try{return tool(id,await handle(params?.name,params?.arguments||{},env,ctx));}catch(e){return errResp(id,-32603,"Tool error: "+e.message);}}return errResp(id,-32601,"Method not found: "+method);}};