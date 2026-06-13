const VERSION="0.1.0";
const WORKER_NAME="afo-repo-change-ledger-mcp";
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization,Mcp-Session-Id'};
const TOOLS=[{
  "name": "afo-repo-change-ledger_status",
  "description": "Health check. Returns version, all binding statuses, and tool list.",
  "inputSchema": {
    "type": "object",
    "properties": {},
    "required": []
  }
},
{
  "name": "create_patch_intent",
  "description": "Create a durable patch intent record for a repo. This stores proposed target files, objective, plan, risk notes, smoke tests, and optional generated diff text. It does not mutate GitHub.",
  "inputSchema": {
    "type": "object",
    "required": [],
    "properties": {
      "repo": {
        "type": "string",
        "description": "Repo slug such as owner/name"
      },
      "branch": {
        "type": "string",
        "default": "main"
      },
      "title": {
        "type": "string"
      },
      "objective": {
        "type": "string"
      },
      "target_files": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "plan": {
        "type": "string"
      },
      "risk": {
        "type": "string"
      },
      "smoke_tests": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "patch_text": {
        "type": "string"
      },
      "created_by": {
        "type": "string",
        "default": "chatgpt"
      }
    }
  }
},
{
  "name": "list_patch_intents",
  "description": "List patch intents, optionally filtered by repo and status.",
  "inputSchema": {
    "type": "object",
    "required": [],
    "properties": {
      "repo": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "limit": {
        "type": "number",
        "default": 20
      }
    }
  }
},
{
  "name": "get_patch_intent",
  "description": "Get a full patch intent by id.",
  "inputSchema": {
    "type": "object",
    "required": [],
    "properties": {
      "intent_id": {
        "type": "string"
      }
    }
  }
},
{
  "name": "update_patch_intent",
  "description": "Update editable fields on a draft or approved patch intent. Does not mutate GitHub.",
  "inputSchema": {
    "type": "object",
    "required": [],
    "properties": {
      "intent_id": {
        "type": "string"
      },
      "title": {
        "type": "string"
      },
      "objective": {
        "type": "string"
      },
      "target_files": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "plan": {
        "type": "string"
      },
      "risk": {
        "type": "string"
      },
      "smoke_tests": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "patch_text": {
        "type": "string"
      }
    }
  }
},
{
  "name": "approve_patch_intent",
  "description": "Mark a patch intent as approved for executor pickup.",
  "inputSchema": {
    "type": "object",
    "required": [],
    "properties": {
      "intent_id": {
        "type": "string"
      },
      "approved_by": {
        "type": "string",
        "default": "user"
      },
      "approval_note": {
        "type": "string"
      }
    }
  }
},
{
  "name": "reject_patch_intent",
  "description": "Reject a patch intent with a reason.",
  "inputSchema": {
    "type": "object",
    "required": [],
    "properties": {
      "intent_id": {
        "type": "string"
      },
      "reason": {
        "type": "string"
      },
      "rejected_by": {
        "type": "string",
        "default": "user"
      }
    }
  }
},
{
  "name": "mark_patch_applied",
  "description": "Record that an approved patch intent was applied to GitHub, with commit/deploy/test receipt data.",
  "inputSchema": {
    "type": "object",
    "required": [],
    "properties": {
      "intent_id": {
        "type": "string"
      },
      "commit_sha": {
        "type": "string"
      },
      "commit_url": {
        "type": "string"
      },
      "branch": {
        "type": "string"
      },
      "deploy_url": {
        "type": "string"
      },
      "test_result": {
        "type": "string"
      },
      "notes": {
        "type": "string"
      }
    }
  }
},
{
  "name": "export_executor_handoff",
  "description": "Export an approved patch intent into a concise executor handoff for a GitHub/GitZip build chat.",
  "inputSchema": {
    "type": "object",
    "required": [],
    "properties": {
      "intent_id": {
        "type": "string"
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
async function handle(name,args,env,ctx){
  if(name==="afo_repo_change_ledger_status"){const res={status:"ok",worker:WORKER_NAME,version:VERSION,generated_at:"2026-06-13T17:51:33.449Z",bindings:{},tools:TOOLS.map(t=>t.name)};
  try{await ensureSchema(env.DB);res.bindings.DB=true;}catch{res.bindings.DB=false;}
  try{await env.KV.put("_ping","1",{expirationTtl:60});res.bindings.KV=true;}catch{res.bindings.KV=false;}
  return res;}
  await ensureSchema(env.DB);
  if (name === "create_patch_intent") {
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS patch_intents (intent_id TEXT PRIMARY KEY, repo TEXT NOT NULL, branch TEXT, title TEXT, objective TEXT, target_files_json TEXT, plan TEXT, risk TEXT, smoke_tests_json TEXT, patch_text TEXT, status TEXT, created_by TEXT, approved_by TEXT, applied_commit TEXT, receipt_json TEXT, created_at TEXT, updated_at TEXT)'); const repoSlug=args.repo; if(!repoSlug) throw new Error('repo required'); const id=genId('intent'); const ts=nowIso(); const files=JSON.stringify(args.target_files||[]); const tests=JSON.stringify(args.smoke_tests||[]); await dbRun(env.DB,'INSERT INTO patch_intents VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,repoSlug,args.branch||'main',args.title||'Untitled patch intent',args.objective||'',files,args.plan||'',args.risk||'',tests,args.patch_text||'', 'draft', args.created_by||'chatgpt', null, null, null, ts, ts]); await kvSet(env.KV,'patch_intent:last:'+repoSlug,id); return {ok:true,intent_id:id,repo:repoSlug,branch:args.branch||'main',status:'draft',target_files:args.target_files||[],next:'Review with get_patch_intent, then approve_patch_intent before execution'};
  }

  if (name === "list_patch_intents") {
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS patch_intents (intent_id TEXT PRIMARY KEY, repo TEXT NOT NULL, branch TEXT, title TEXT, objective TEXT, target_files_json TEXT, plan TEXT, risk TEXT, smoke_tests_json TEXT, patch_text TEXT, status TEXT, created_by TEXT, approved_by TEXT, applied_commit TEXT, receipt_json TEXT, created_at TEXT, updated_at TEXT)'); let sql='SELECT intent_id,repo,branch,title,objective,target_files_json,status,created_by,approved_by,applied_commit,created_at,updated_at FROM patch_intents'; const p=[]; const w=[]; if(args.repo){w.push('repo=?');p.push(args.repo)} if(args.status){w.push('status=?');p.push(args.status)} if(w.length) sql+=' WHERE '+w.join(' AND '); sql+=' ORDER BY created_at DESC LIMIT ?'; p.push(args.limit||20); const rows=await dbAll(env.DB,sql,p); return {ok:true,count:rows.length,intents:rows.map(r=>({...r,target_files:JSON.parse(r.target_files_json||'[]')}))};
  }

  if (name === "get_patch_intent") {
    if(!args.intent_id) throw new Error('intent_id required'); await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS patch_intents (intent_id TEXT PRIMARY KEY, repo TEXT NOT NULL, branch TEXT, title TEXT, objective TEXT, target_files_json TEXT, plan TEXT, risk TEXT, smoke_tests_json TEXT, patch_text TEXT, status TEXT, created_by TEXT, approved_by TEXT, applied_commit TEXT, receipt_json TEXT, created_at TEXT, updated_at TEXT)'); const rows=await dbAll(env.DB,'SELECT * FROM patch_intents WHERE intent_id=? LIMIT 1',[args.intent_id]); const r=rows[0]; if(!r) return {ok:true,found:false,intent:null}; return {ok:true,found:true,intent:{...r,target_files:JSON.parse(r.target_files_json||'[]'),smoke_tests:JSON.parse(r.smoke_tests_json||'[]'),receipt:r.receipt_json?JSON.parse(r.receipt_json):null}};
  }

  if (name === "update_patch_intent") {
    if(!args.intent_id) throw new Error('intent_id required'); const rows=await dbAll(env.DB,'SELECT * FROM patch_intents WHERE intent_id=? LIMIT 1',[args.intent_id]); if(!rows.length) return {ok:false,error:'not found'}; const r=rows[0]; const title=args.title!==undefined?args.title:r.title; const objective=args.objective!==undefined?args.objective:r.objective; const files=args.target_files!==undefined?JSON.stringify(args.target_files):r.target_files_json; const plan=args.plan!==undefined?args.plan:r.plan; const risk=args.risk!==undefined?args.risk:r.risk; const tests=args.smoke_tests!==undefined?JSON.stringify(args.smoke_tests):r.smoke_tests_json; const patch=args.patch_text!==undefined?args.patch_text:r.patch_text; await dbRun(env.DB,'UPDATE patch_intents SET title=?,objective=?,target_files_json=?,plan=?,risk=?,smoke_tests_json=?,patch_text=?,updated_at=? WHERE intent_id=?',[title,objective,files,plan,risk,tests,patch,nowIso(),args.intent_id]); return {ok:true,intent_id:args.intent_id,updated:true};
  }

  if (name === "approve_patch_intent") {
    if(!args.intent_id) throw new Error('intent_id required'); const receipt={approval_note:args.approval_note||'',approved_at:nowIso()}; await dbRun(env.DB,'UPDATE patch_intents SET status=?,approved_by=?,receipt_json=?,updated_at=? WHERE intent_id=?',['approved',args.approved_by||'user',JSON.stringify(receipt),nowIso(),args.intent_id]); return {ok:true,intent_id:args.intent_id,status:'approved',approved_by:args.approved_by||'user'};
  }

  if (name === "reject_patch_intent") {
    if(!args.intent_id) throw new Error('intent_id required'); const receipt={rejected_by:args.rejected_by||'user',reason:args.reason||'',rejected_at:nowIso()}; await dbRun(env.DB,'UPDATE patch_intents SET status=?,receipt_json=?,updated_at=? WHERE intent_id=?',['rejected',JSON.stringify(receipt),nowIso(),args.intent_id]); return {ok:true,intent_id:args.intent_id,status:'rejected'};
  }

  if (name === "mark_patch_applied") {
    if(!args.intent_id) throw new Error('intent_id required'); const receipt={commit_sha:args.commit_sha||'',commit_url:args.commit_url||'',branch:args.branch||'',deploy_url:args.deploy_url||'',test_result:args.test_result||'',notes:args.notes||'',applied_at:nowIso()}; await dbRun(env.DB,'UPDATE patch_intents SET status=?,applied_commit=?,receipt_json=?,updated_at=? WHERE intent_id=?',['applied',args.commit_sha||'',JSON.stringify(receipt),nowIso(),args.intent_id]); return {ok:true,intent_id:args.intent_id,status:'applied',receipt};
  }

  if (name === "export_executor_handoff") {
    if(!args.intent_id) throw new Error('intent_id required'); const rows=await dbAll(env.DB,'SELECT * FROM patch_intents WHERE intent_id=? LIMIT 1',[args.intent_id]); const r=rows[0]; if(!r) return {ok:false,error:'not found'}; const files=JSON.parse(r.target_files_json||'[]'); const tests=JSON.parse(r.smoke_tests_json||'[]'); const handoff=['# Patch Executor Handoff', '', '**Intent:** '+r.intent_id, '**Repo:** '+r.repo, '**Branch:** '+(r.branch||'main'), '**Status:** '+r.status, '**Title:** '+(r.title||''), '', '## Objective', r.objective||'', '', '## Target files', ...files.map(f=>'- '+f), '', '## Plan', r.plan||'', '', '## Risk notes', r.risk||'', '', '## Smoke tests', ...tests.map(t=>'- '+t), '', '## Patch text / notes', r.patch_text||''].join('\n'); return {ok:true,intent_id:r.intent_id,status:r.status,handoff};
  }

  throw new Error("Unknown tool: "+name);}
export default{async fetch(request,env,ctx){if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});const url=new URL(request.url);if(url.pathname==="/health")return Response.json({status:"ok",worker:WORKER_NAME,version:VERSION},{headers:CORS});if(request.method!=="POST")return new Response("not found",{status:404,headers:CORS});let body;try{body=await request.json();}catch{return errResp(null,-32700,"Parse error");}const{id,method,params}=body;if(method==="initialize")return rpc(id,{protocolVersion:"2024-11-05",capabilities:{tools:{}},serverInfo:{name:WORKER_NAME,version:VERSION}});if(method==="notifications/initialized")return new Response(null,{status:204,headers:CORS});if(method==="ping")return rpc(id,{});if(method==="tools/list")return rpc(id,{tools:TOOLS});if(method==="tools/call"){try{return tool(id,await handle(params?.name,params?.arguments||{},env,ctx));}catch(e){return errResp(id,-32603,"Tool error: "+e.message);}}return errResp(id,-32601,"Method not found: "+method);}};