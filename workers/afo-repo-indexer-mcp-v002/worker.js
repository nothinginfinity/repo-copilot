const VERSION="0.02.1";
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
  "description": "Production v0.02 resumable repo indexer. Lists repo files deterministically, starts from offset/cursor/resume, fetches raw file text, chunks, embeds with Workers AI, upserts to Vectorize, records job progress in D1, and stores next cursor in KV.",
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
        "default": 10
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
  "name": "list_indexed_repos",
  "description": "List recent v0.02 index jobs.",
  "inputSchema": {
    "type": "object",
    "required": [],
    "properties": {
      "limit": {
        "type": "number",
        "default": 30
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
  if(name==="afo_repo_indexer_mcp_v002_status"){const res={status:"ok",worker:WORKER_NAME,version:VERSION,generated_at:"2026-06-13T16:01:08.470Z",bindings:{},tools:TOOLS.map(t=>t.name)};
  try{await ensureSchema(env.DB);res.bindings.DB=true;}catch{res.bindings.DB=false;}
  try{await env.KV.put("_ping","1",{expirationTtl:60});res.bindings.KV=true;}catch{res.bindings.KV=false;}
  res.bindings.VECTORIZE=!!env.VECTORIZE;res.bindings.AI=!!env.AI;
  return res;}
  await ensureSchema(env.DB);
  if (name === "index_repo_batch") {
    const { repo } = args;
    if (!repo) throw new Error("index_repo_batch: repo required");
    const owner=args.owner||'nothinginfinity',repo=args.repo,branch=args.branch||'main',root=args.path||'',repoKey=owner+'/'+repo,pathKey=repoKey+':'+branch+':'+(root||'root'),jobId=genId('idx2'),ts=nowIso(); const max=Math.max(1,Math.min(args.max_files||10,15)), cursorKey='index:v002:'+pathKey+':cursor', shaKey='index:v002:'+pathKey+':sha'; let start=0; if(typeof args.offset==='number')start=Math.max(0,Math.floor(args.offset)); if(args.cursor){const n=parseInt(args.cursor,10); if(!Number.isNaN(n))start=n;} if(args.resume){const n=parseInt(await kvGet(env.KV,cursorKey)||'0',10); if(!Number.isNaN(n))start=n;} async function gh(url,accept){return fetch(url,{headers:{Authorization:'Bearer '+env.GITHUB_TOKEN,Accept:accept||'application/vnd.github+json','User-Agent':'afo-repo-indexer-mcp-v002'}})} const ref=await gh('https://api.github.com/repos/'+owner+'/'+repo+'/git/ref/heads/'+encodeURIComponent(branch)); let commit='unknown'; if(ref.ok){const j=await ref.json(); commit=j.object&&j.object.sha?j.object.sha:'unknown'} const shortSha=commit.slice(0,12), last=await kvGet(env.KV,shaKey); if(!args.force&&!args.resume&&!args.cursor&&typeof args.offset!=='number'&&last===shortSha&&shortSha!=='unknown')return{ok:true,skipped:true,reason:'SHA unchanged; use resume/cursor/offset/force to continue',repo:repoKey,sha:shortSha,cursor:await kvGet(env.KV,cursorKey)||'0'}; const tree=await gh('https://api.github.com/repos/'+owner+'/'+repo+'/git/trees/'+encodeURIComponent(branch)+'?recursive=1'); if(!tree.ok)throw new Error('GitHub tree fetch failed '+tree.status); const tj=await tree.json(), badExt=new Set(['png','jpg','jpeg','gif','webp','ico','woff','woff2','ttf','pdf','zip','wasm','bin','mp4','mov']), badDir=['node_modules/','.git/','.wrangler/','dist/','build/','.next/','coverage/']; let files=(tj.tree||[]).filter(f=>f.type==='blob'&&(!root||f.path===root||f.path.startsWith(root.replace(/\/$/,'')+'/'))&&f.size<120000&&!badDir.some(d=>f.path.includes(d))&&!badExt.has((f.path.split('.').pop()||'').toLowerCase())).map(f=>({path:f.path,size:f.size,sha:f.sha})).sort((a,b)=>a.path.localeCompare(b.path)); const batch=files.slice(start,start+max), next=start+batch.length, done=next>=files.length; await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS index_jobs_v002 (job_id TEXT PRIMARY KEY, repo_key TEXT, branch TEXT, path TEXT, sha TEXT, files_found INTEGER, start_offset INTEGER, next_cursor INTEGER, files_planned INTEGER, files_indexed INTEGER, status TEXT, created_at TEXT, updated_at TEXT)'); await dbRun(env.DB,'INSERT INTO index_jobs_v002 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',[jobId,repoKey,branch,root,shortSha,files.length,start,next,batch.length,0,'running',ts,ts]); let indexed=0,errors=[]; for(const file of batch){try{const enc=file.path.split('/').map(encodeURIComponent).join('/'); const raw=await fetch('https://raw.githubusercontent.com/'+owner+'/'+repo+'/'+encodeURIComponent(branch)+'/'+enc,{headers:{Authorization:'Bearer '+env.GITHUB_TOKEN,'User-Agent':'afo-repo-indexer-mcp-v002'}}); if(!raw.ok){errors.push({path:file.path,error:'raw '+raw.status}); continue} const txt=await raw.text(); if(!txt.trim())continue; const chunks=[]; for(let i=0;i<txt.length;i+=450){chunks.push(txt.slice(i,i+600)); if(i+600>=txt.length)break} for(let c=0;c<Math.min(chunks.length,5);c++){const input=(repoKey+' '+file.path+' '+chunks[c]).slice(0,512); const er=await env.AI.run('@cf/baai/bge-base-en-v1.5',{text:[input]}); const vector=er.data&&er.data[0]; if(!vector)continue; await env.VECTORIZE.upsert([{id:'v002_'+jobId+'_'+(start+indexed)+'_'+c,values:vector,metadata:{repo:repoKey,path:file.path,chunk:c,sha:file.sha,branch,index_version:'0.02.1',offset:start+indexed}}])} indexed++}catch(e){errors.push({path:file.path,error:e.message})}} const status=errors.length?'partial':'complete'; await dbRun(env.DB,'UPDATE index_jobs_v002 SET files_indexed=?,status=?,updated_at=? WHERE job_id=?',[indexed,status,nowIso(),jobId]); await kvSet(env.KV,cursorKey,String(next)); if(done&&indexed>0)await kvSet(env.KV,shaKey,shortSha); await kvSet(env.KV,'index:v002:'+repoKey+':last_job',jobId); return{ok:true,job_id:jobId,repo:repoKey,branch,path:root||'root',sha:shortSha,files_found:files.length,start_offset:start,files_planned:batch.length,files_indexed:indexed,next_cursor:String(next),files_remaining:Math.max(0,files.length-next),done,errors};
  }

  if (name === "get_index_cursor") {
    const { repo } = args;
    if (!repo) throw new Error("get_index_cursor: repo required");
    const owner=args.owner||'nothinginfinity',branch=args.branch||'main',path=args.path||'',repoKey=owner+'/'+args.repo,cursorKey='index:v002:'+repoKey+':'+branch+':'+(path||'root')+':cursor',shaKey='index:v002:'+repoKey+':'+branch+':'+(path||'root')+':sha'; return{ok:true,repo:repoKey,branch,path:path||'root',cursor:await kvGet(env.KV,cursorKey)||'0',sha:await kvGet(env.KV,shaKey)||null};
  }

  if (name === "reset_index_cursor") {
    const { repo } = args;
    if (!repo) throw new Error("reset_index_cursor: repo required");
    const owner=args.owner||'nothinginfinity',branch=args.branch||'main',path=args.path||'',repoKey=owner+'/'+args.repo,cursorKey='index:v002:'+repoKey+':'+branch+':'+(path||'root')+':cursor',offset=Math.max(0,Math.floor(args.offset||0)); await kvSet(env.KV,cursorKey,String(offset)); return{ok:true,repo:repoKey,branch,path:path||'root',cursor:String(offset)};
  }

  if (name === "get_index_job") {
    const { job_id } = args;
    if (!job_id) throw new Error("get_index_job: job_id required");
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS index_jobs_v002 (job_id TEXT PRIMARY KEY, repo_key TEXT, branch TEXT, path TEXT, sha TEXT, files_found INTEGER, start_offset INTEGER, next_cursor INTEGER, files_planned INTEGER, files_indexed INTEGER, status TEXT, created_at TEXT, updated_at TEXT)'); const rows=await dbAll(env.DB,'SELECT * FROM index_jobs_v002 WHERE job_id=? LIMIT 1',[args.job_id]); return{ok:true,found:rows.length>0,job:rows[0]||null};
  }

  if (name === "list_indexed_repos") {
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS index_jobs_v002 (job_id TEXT PRIMARY KEY, repo_key TEXT, branch TEXT, path TEXT, sha TEXT, files_found INTEGER, start_offset INTEGER, next_cursor INTEGER, files_planned INTEGER, files_indexed INTEGER, status TEXT, created_at TEXT, updated_at TEXT)'); const rows=await dbAll(env.DB,'SELECT * FROM index_jobs_v002 ORDER BY created_at DESC LIMIT ?',[args.limit||30]); return{ok:true,indexed_repos:rows,total:rows.length};
  }

  if (name === "search_repos") {
    const { query } = args;
    if (!query) throw new Error("search_repos: query required");
    const topK=Math.min(args.top_k||8,20); const embRes=await env.AI.run('@cf/baai/bge-base-en-v1.5',{text:[args.query.slice(0,512)]}); const vector=embRes.data&&embRes.data[0]; if(!vector)throw new Error('Embedding failed'); const results=await env.VECTORIZE.query(vector,{topK,returnMetadata:true}); let matches=results.matches||[]; if(args.repo)matches=matches.filter(m=>m.metadata&&m.metadata.repo&&m.metadata.repo.includes(args.repo)); return{ok:true,query:args.query,count:matches.length,results:matches.map(m=>({score:m.score,repo:m.metadata&&m.metadata.repo,path:m.metadata&&m.metadata.path,chunk:m.metadata&&m.metadata.chunk,sha:m.metadata&&m.metadata.sha,index_version:m.metadata&&m.metadata.index_version,offset:m.metadata&&m.metadata.offset,id:m.id}))};
  }

  throw new Error("Unknown tool: "+name);}
export default{async fetch(request,env,ctx){if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});const url=new URL(request.url);if(url.pathname==="/health")return Response.json({status:"ok",worker:WORKER_NAME,version:VERSION},{headers:CORS});if(request.method!=="POST")return new Response("not found",{status:404,headers:CORS});let body;try{body=await request.json();}catch{return errResp(null,-32700,"Parse error");}const{id,method,params}=body;if(method==="initialize")return rpc(id,{protocolVersion:"2024-11-05",capabilities:{tools:{}},serverInfo:{name:WORKER_NAME,version:VERSION}});if(method==="notifications/initialized")return new Response(null,{status:204,headers:CORS});if(method==="ping")return rpc(id,{});if(method==="tools/list")return rpc(id,{tools:TOOLS});if(method==="tools/call"){try{return tool(id,await handle(params?.name,params?.arguments||{},env,ctx));}catch(e){return errResp(id,-32603,"Tool error: "+e.message);}}return errResp(id,-32601,"Method not found: "+method);}};