// afo-mcp-factory v0.1.0
// Autonomous MCP Worker factory. Accepts a blueprint JSON payload and stamps out
// a production-ready stateful MCP worker directly to GitHub.
//
// Tools: factory_status | validate_blueprint | generate_worker | get_generation_receipt | list_generations

const VERSION = '0.1.0';
const CF_ACCOUNT_ID = '280908cb4e54b81745740accf5f0500f';
const CF_BASE = 'https://api.cloudflare.com/client/v4';
const CORS = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization,Mcp-Session-Id'};

const TOOLS = [
  {name:'factory_status',description:'Health check. Returns factory version, binding status, and generation stats.',inputSchema:{type:'object',properties:{},required:[]}},
  {name:'validate_blueprint',description:'Validates a blueprint JSON against the mcp-blueprint-schema without generating any files. Returns validation errors or a dry-run plan.',inputSchema:{type:'object',required:['blueprint'],properties:{blueprint:{type:'object',description:'The blueprint JSON to validate.'}}}},
  {name:'generate_worker',description:'Full factory run: validates blueprint, resolves/creates Cloudflare infrastructure, renders all files from templates, commits to GitHub, and optionally deploys. Returns a job_id and receipt.',inputSchema:{type:'object',required:['blueprint'],properties:{blueprint:{type:'object',description:'Blueprint JSON conforming to mcp-blueprint-schema.'},dry_run:{type:'boolean',description:'If true, returns generated file contents without committing or deploying.'}}}},
  {name:'get_generation_receipt',description:'Retrieve the full generation receipt for a past factory job.',inputSchema:{type:'object',required:['job_id'],properties:{job_id:{type:'string',description:'Job ID returned by generate_worker.'}}}},
  {name:'list_generations',description:'List recent factory generation jobs with their status and output worker names.',inputSchema:{type:'object',properties:{limit:{type:'number',description:'Max results (default: 10)'}},required:[]}},
];

function rpc(id,r){return Response.json({jsonrpc:'2.0',id,result:r},{headers:CORS});}
function rpcErr(id,c,m){return Response.json({jsonrpc:'2.0',id,error:{code:c,message:m}},{headers:CORS});}
function toolOk(id,r){return rpc(id,{content:[{type:'text',text:JSON.stringify(r,null,2)}]});}
function genId(p){return p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);}
function nowIso(){return new Date().toISOString();}
function slugHash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h)+s.charCodeAt(i);return(h>>>0).toString(16).padStart(8,'0');}

async function dbRun(db,sql,p){const s=db.prepare(sql);return p?s.bind(...p).run():s.run();}
async function dbFirst(db,sql,p){const s=db.prepare(sql);return p?s.bind(...p).first():s.first();}
async function dbAll(db,sql,p){const s=db.prepare(sql);const r=p?await s.bind(...p).all():await s.all();return r.results||[];}

async function ensureSchema(db){
  await dbRun(db,`CREATE TABLE IF NOT EXISTS factory_jobs (job_id TEXT PRIMARY KEY,project_name TEXT NOT NULL,namespace TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',blueprint_hash TEXT,files_generated INTEGER DEFAULT 0,infra_created TEXT,commit_sha TEXT,deploy_url TEXT,error_message TEXT,receipt_json TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`);
  await dbRun(db,'CREATE INDEX IF NOT EXISTS idx_jobs_project ON factory_jobs(project_name)');
  await dbRun(db,'CREATE INDEX IF NOT EXISTS idx_jobs_status ON factory_jobs(status)');
}

async function cfGet(env,path){const res=await fetch(CF_BASE+'/accounts/'+CF_ACCOUNT_ID+path,{headers:{'Authorization':'Bearer '+env.CF_API_TOKEN,'Accept':'application/json','User-Agent':'afo-mcp-factory/'+VERSION}});if(!res.ok)throw new Error('CF GET '+path+' -> '+res.status+': '+await res.text());return res.json();}
async function cfPost(env,path,body){const res=await fetch(CF_BASE+'/accounts/'+CF_ACCOUNT_ID+path,{method:'POST',headers:{'Authorization':'Bearer '+env.CF_API_TOKEN,'Content-Type':'application/json','User-Agent':'afo-mcp-factory/'+VERSION},body:JSON.stringify(body)});if(!res.ok)throw new Error('CF POST '+path+' -> '+res.status+': '+await res.text());return res.json();}

async function resolveD1(env,name,autoCreate){const list=await cfGet(env,'/d1/database?per_page=100');const ex=(list.result||[]).find(function(d){return d.name===name;});if(ex)return{id:ex.uuid,name:ex.name,created:false};if(!autoCreate)throw new Error('D1 not found: '+name);const c=await cfPost(env,'/d1/database',{name});return{id:c.result.uuid,name,created:true};}
async function resolveKV(env,title,autoCreate){const list=await cfGet(env,'/storage/kv/namespaces?per_page=100');const ex=(list.result||[]).find(function(k){return k.title===title;});if(ex)return{id:ex.id,title:ex.title,created:false};if(!autoCreate)throw new Error('KV not found: '+title);const c=await cfPost(env,'/storage/kv/namespaces',{title});return{id:c.result.id,title,created:true};}
async function resolveR2(env,bucketName,autoCreate){const list=await cfGet(env,'/r2/buckets?per_page=100');const ex=(list.result&&list.result.buckets||[]).find(function(b){return b.name===bucketName;});if(ex)return{name:bucketName,created:false};if(!autoCreate)throw new Error('R2 not found: '+bucketName);await cfPost(env,'/r2/buckets',{name:bucketName});return{name:bucketName,created:true};}
async function resolveVectorize(env,indexName,autoCreate,dimensions,metric){const list=await cfGet(env,'/vectorize/v2/indexes');const ex=(list.result||[]).find(function(v){return v.name===indexName;});if(ex)return{name:indexName,created:false,config:ex.config};if(!autoCreate)throw new Error('Vectorize not found: '+indexName+'. Use afo-cf-resource-admin-mcp to create first.');const c=await cfPost(env,'/vectorize/v2/indexes',{name:indexName,config:{dimensions:dimensions||768,metric:metric||'cosine'}});return{name:indexName,created:true,config:c.result&&c.result.config};}

async function ghGetSha(env,owner,repo,path,branch){try{const url='https://api.github.com/repos/'+owner+'/'+repo+'/contents/'+encodeURIComponent(path)+'?ref='+(branch||'main');const res=await fetch(url,{headers:{'Authorization':'Bearer '+env.GITHUB_TOKEN,'Accept':'application/vnd.github+json','User-Agent':'afo-mcp-factory/'+VERSION}});if(!res.ok)return null;const d=await res.json();return d.sha||null;}catch{return null;}}
async function ghPut(env,owner,repo,path,content,message,branch,existingSha){const url='https://api.github.com/repos/'+owner+'/'+repo+'/contents/'+encodeURIComponent(path);const body={message,content:btoa(unescape(encodeURIComponent(content))),branch:branch||'main'};if(existingSha)body.sha=existingSha;const res=await fetch(url,{method:'PUT',headers:{'Authorization':'Bearer '+env.GITHUB_TOKEN,'Accept':'application/vnd.github+json','Content-Type':'application/json','User-Agent':'afo-mcp-factory/'+VERSION},body:JSON.stringify(body)});if(!res.ok)throw new Error('GitHub PUT '+path+' -> '+res.status+': '+await res.text());const data=await res.json();return data.commit&&data.commit.sha?data.commit.sha:null;}

function validateBlueprint(bp){
  const errors=[];
  if(!bp||typeof bp!=='object')return['Blueprint must be a JSON object'];
  if(!bp.metadata){errors.push('metadata is required');}
  else{if(!bp.metadata.project_name)errors.push('metadata.project_name is required');else if(!/^[a-z0-9-]+$/.test(bp.metadata.project_name))errors.push('metadata.project_name must be kebab-case');if(!bp.metadata.namespace)errors.push('metadata.namespace is required');if(!bp.metadata.version)errors.push('metadata.version is required');else if(!/^\d+\.\d+\.\d+$/.test(bp.metadata.version))errors.push('metadata.version must be semver');if(!bp.metadata.description)errors.push('metadata.description is required');}
  if(!bp.tools||!Array.isArray(bp.tools)){errors.push('tools array is required');}
  else if(!bp.tools.length){errors.push('tools must have at least 1 entry');}
  else{const vht=['d1_write','d1_read','kv_put','kv_get','r2_put','r2_get','vector_upsert','vector_query','http_fetch','composite','custom'];bp.tools.forEach(function(t,i){if(!t.name)errors.push('tools['+i+'].name required');else if(!/^[a-z_]+$/.test(t.name))errors.push('tools['+i+'].name must be snake_case');if(!t.description)errors.push('tools['+i+'].description required');if(!t.handler_type)errors.push('tools['+i+'].handler_type required');else if(!vht.includes(t.handler_type))errors.push('tools['+i+'].handler_type must be one of: '+vht.join(', '));if((t.handler_type==='d1_write'||t.handler_type==='d1_read')&&!t.sql_template)errors.push('tools['+i+'] ('+t.name+'): sql_template required for '+t.handler_type);});const names=bp.tools.map(function(t){return t.name;});const dupes=names.filter(function(n,i){return names.indexOf(n)!==i;});if(dupes.length)errors.push('Duplicate tool names: '+dupes.join(', '));}
  return errors;
}

function renderToolDefinitions(tools,ns,opts){
  const defs=[];
  if(opts.includeStatusTool)defs.push('  {name:\''+ns+'_status\',description:\'Health check.\',inputSchema:{type:\'object\',properties:{},required:[]}}');
  if(opts.includeSessionTools){defs.push('  {name:\'start_session\',description:\'Start a tracked session. Returns session_id.\',inputSchema:{type:\'object\',properties:{description:{type:\'string\'},metadata:{type:\'object\'},parent_id:{type:\'string\'}},required:[]}}');defs.push('  {name:\'get_session\',description:\'Get session details and recent logs.\',inputSchema:{type:\'object\',properties:{session_id:{type:\'string\'}},required:[\'session_id\']}}');defs.push('  {name:\'list_sessions\',description:\'List recent sessions for this namespace.\',inputSchema:{type:\'object\',properties:{limit:{type:\'number\'}},required:[]}}');}
  tools.forEach(function(t){const p=t.parameters||{type:'object',properties:{},required:[]};defs.push('  {name:\''+t.name+'\',description:\''+t.description.replace(/'/g,"\\'")+'\',inputSchema:'+JSON.stringify(p)+'}');});
  return defs.join(',\n');
}

function renderToolHandlers(tools){
  return tools.map(function(t){
    let body='';
    if(t.handler_type==='d1_write'){const params=(t.sql_params||[]).map(function(p){return p==='_now'?'nowIso()':'args.'+p;});body='  if(!env.DB)throw new Error(\'DB binding required\');\n  await dbRun(env.DB,\''+t.sql_template.replace(/'/g,"\\'")+'\',\n    ['+params.join(',')+']);\n  return{ok:true,tool:\''+t.name+'\'};';}
    else if(t.handler_type==='d1_read'){const params=(t.sql_params||[]).map(function(p){return'args.'+p;});const single=t.sql_template&&t.sql_template.toUpperCase().includes('LIMIT 1');body='  if(!env.DB)throw new Error(\'DB binding required\');\n  const result=await '+(single?'dbFirst':'dbAll')+'(env.DB,\''+t.sql_template.replace(/'/g,"\\'")+'\',\n    ['+params.join(',')+']);\n  return{ok:true,result};';}
    else if(t.handler_type==='kv_put'){body='  if(!env.KV)throw new Error(\'KV binding required\');\n  await kvSet(env.KV,String(args.key),args.value,args.ttl_seconds);\n  return{ok:true,key:args.key};}'}
    else if(t.handler_type==='kv_get'){body='  if(!env.KV)throw new Error(\'KV binding required\');\n  const value=await kvGet(env.KV,String(args.key));\n  return{ok:true,key:args.key,found:value!==null,value};}'}
    else if(t.handler_type==='r2_put'){body='  if(!env.R2)throw new Error(\'R2 binding required\');\n  const uri=await r2Put(env.R2,String(args.key),args.payload);\n  return{ok:true,uri};}'}
    else if(t.handler_type==='r2_get'){body='  if(!env.R2)throw new Error(\'R2 binding required\');\n  const payload=await r2Get(env.R2,String(args.key));\n  return{ok:true,key:args.key,found:payload!==null,payload};}'}
    else if(t.handler_type==='vector_upsert'){body='  if(!env.VECTORIZE||!env.AI)throw new Error(\'VECTORIZE+AI required\');\n  const emb=await env.AI.run(\'@cf/baai/bge-base-en-v1.5\',{text:[String(args.text).slice(0,512)]});\n  const vector=emb.data&&emb.data[0];if(!vector)throw new Error(\'Embedding failed\');\n  await env.VECTORIZE.upsert([{id:String(args.id),values:vector,metadata:args.metadata||{}}]);\n  return{ok:true,id:args.id};}'}
    else if(t.handler_type==='vector_query'){body='  if(!env.VECTORIZE||!env.AI)throw new Error(\'VECTORIZE+AI required\');\n  const emb=await env.AI.run(\'@cf/baai/bge-base-en-v1.5\',{text:[String(args.query).slice(0,512)]});\n  const vector=emb.data&&emb.data[0];if(!vector)throw new Error(\'Embedding failed\');\n  const results=await env.VECTORIZE.query(vector,{topK:args.top_k||5,returnMetadata:true});\n  return{ok:true,matches:results.matches||[]};}'}
    else if(t.handler_type==='http_fetch'){body='  const res=await fetch(String(args.url),{method:args.method||\'GET\',headers:args.headers||{},body:args.body?JSON.stringify(args.body):undefined});\n  const data=await res.text();\n  return{ok:res.ok,status:res.status,body:data.slice(0,4096)};'}
    else{body='  // TODO: implement '+t.name+'\n  throw new Error(\''+t.name+' not yet implemented. Edit the generated worker.\');'}
    return 'async function handle_'+t.name+'(args,env){\n'+body+'\n}';
  }).join('\n\n');
}

function renderWorkerSource(bp,resolvedBindings){
  const meta=bp.metadata;const infra=bp.infrastructure||{};const tools=bp.tools||[];const opts=bp.generation_options||{};const ns=meta.namespace;
  const includeStatus=opts.include_status_tool!==false;const includeSessions=opts.include_session_tools!==false;
  const defaultTimeout=tools.reduce(function(m,t){return Math.min(m,t.timeout_ms||25000);},25000);
  const logPayloadDefault=tools.some(function(t){return t.log_payload!==false;})?'true':'false';
  const toolDefsBlock=renderToolDefinitions(tools,ns,{includeStatusTool:includeStatus,includeSessionTools:includeSessions});
  const handlerFunctions=renderToolHandlers(tools);
  const handlerMapBuiltin=[];
  if(includeStatus)handlerMapBuiltin.push('  [\''+ns+'_status\',handle_'+ns+'_status]');
  if(includeSessions)handlerMapBuiltin.push('  [\'start_session\',handle_start_session]','  [\'get_session\',handle_get_session]','  [\'list_sessions\',handle_list_sessions]');
  const fullHandlerMap=[...handlerMapBuiltin,...tools.map(function(t){return'  [\''+t.name+'\',handle_'+t.name+']';})].join(',\n');

  const statusFn=includeStatus?[
    'async function handle_'+ns+'_status(_args,env){',
    '  let dbOk=false,kvOk=false,r2Ok=false,vecOk=false,aiOk=false,sc=0;',
    '  try{if(env.DB){await ensureBaselineSchema(env.DB);const r=await dbFirst(env.DB,"SELECT COUNT(*) as n FROM mcp_sessions WHERE namespace=? AND status=\'active\'",[NAMESPACE]);sc=r?r.n:0;dbOk=true;}}catch{}',
    '  try{if(env.KV){await env.KV.put(\'_ping\',\'1\',{expirationTtl:30});kvOk=true;}}catch{}',
    '  try{if(env.R2){await env.R2.head(\'_ping\');r2Ok=true;}}catch{r2Ok=!!env.R2;}',
    '  vecOk=!!env.VECTORIZE;aiOk=!!env.AI;',
    '  return{status:\'ok\',worker:WORKER_NAME,version:WORKER_VERSION,namespace:NAMESPACE,bindings:{DB:dbOk,KV:kvOk,R2:r2Ok,VECTORIZE:vecOk,AI:aiOk},active_sessions:sc,tools:TOOLS.map(function(t){return t.name;})};',
    '}',
  ].join('\n'):'';

  const sessionFns=includeSessions?[
    'async function handle_start_session(args,env){if(!env.DB)throw new Error(\'DB required\');const session_id=genId(\'sess\');const ts=nowIso();await dbRun(env.DB,\'INSERT INTO mcp_sessions VALUES(?,?,?,?,?,?,?,?)\',[session_id,NAMESPACE,\'active\',args.description||null,JSON.stringify(args.metadata||{}),args.parent_id||null,ts,ts]);if(env.KV)await kvSet(env.KV,NAMESPACE+\':active_session\',session_id);return{ok:true,session_id,namespace:NAMESPACE,created_at:ts};}',
    'async function handle_get_session(args,env){if(!env.DB)throw new Error(\'DB required\');const session=await dbFirst(env.DB,\'SELECT * FROM mcp_sessions WHERE session_id=?\',[args.session_id]);if(!session)return{ok:false,error:\'Session not found: \'+args.session_id};const logs=await dbAll(env.DB,\'SELECT log_id,tool_name,status,latency_ms,created_at FROM action_execution_logs WHERE session_id=? ORDER BY created_at DESC LIMIT 20\',[args.session_id]);return{ok:true,session,recent_logs:logs};}',
    'async function handle_list_sessions(args,env){if(!env.DB)throw new Error(\'DB required\');const sessions=await dbAll(env.DB,\'SELECT * FROM mcp_sessions WHERE namespace=? ORDER BY created_at DESC LIMIT ?\',[NAMESPACE,args.limit||10]);return{ok:true,sessions,count:sessions.length};}',
  ].join('\n'):'';

  return [
    '// '+meta.project_name+' -- Generated by afo-mcp-factory v'+VERSION,
    '// Namespace: '+ns+' | Version: '+meta.version,
    '// '+meta.description,
    '',
    'const WORKER_NAME=\''+meta.project_name+'\';const WORKER_VERSION=\''+meta.version+'\';const NAMESPACE=\''+ns+'\';',
    'const PAYLOAD_THRESHOLD_BYTES=4096;',
    'const CORS={\'Access-Control-Allow-Origin\':\'*\',\'Access-Control-Allow-Methods\':\'GET,POST,OPTIONS\',\'Access-Control-Allow-Headers\':\'Content-Type,Authorization,Mcp-Session-Id\'};',
    '',
    'const TOOLS=[',toolDefsBlock,'];',
    '',
    'function rpc(id,r){return Response.json({jsonrpc:\'2.0\',id,result:r},{headers:CORS});}',
    'function rpcErr(id,c,m){return Response.json({jsonrpc:\'2.0\',id,error:{code:c,message:m}},{headers:CORS});}',
    'function toolOk(id,r){return rpc(id,{content:[{type:\'text\',text:JSON.stringify(r,null,2)}]});}',
    'function genId(p){return p+\'_\'+Date.now().toString(36)+\'_\'+Math.random().toString(36).slice(2,8);}',
    'function nowIso(){return new Date().toISOString();}',
    'function byteLen(s){return new TextEncoder().encode(s).length;}',
    '',
    'async function dbRun(db,sql,p){const s=db.prepare(sql);return p?s.bind(...p).run():s.run();}',
    'async function dbFirst(db,sql,p){const s=db.prepare(sql);return p?s.bind(...p).first():s.first();}',
    'async function dbAll(db,sql,p){const s=db.prepare(sql);const r=p?await s.bind(...p).all():await s.all();return r.results||[];}',
    'async function kvSet(kv,key,value,ttl){const o=ttl?{expirationTtl:ttl}:undefined;await kv.put(key,typeof value===\'string\'?value:JSON.stringify(value),o);}',
    'async function kvGet(kv,key){const v=await kv.get(key);if(v===null)return null;try{return JSON.parse(v);}catch{return v;}}',
    'async function r2Put(r2,key,payload){const b=typeof payload===\'string\'?payload:JSON.stringify(payload,null,2);await r2.put(key,b,{httpMetadata:{contentType:\'application/json\'}});return\'r2://\'+key;}',
    'async function r2Get(r2,key){const o=await r2.get(key);if(!o)return null;const t=await o.text();try{return JSON.parse(t);}catch{return t;}}',
    '',
    'async function ensureBaselineSchema(db){',
    '  await dbRun(db,\'CREATE TABLE IF NOT EXISTS mcp_sessions(session_id TEXT PRIMARY KEY,namespace TEXT NOT NULL,status TEXT NOT NULL DEFAULT \\\'active\\\',description TEXT,metadata TEXT,parent_id TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)\');',
    '  await dbRun(db,\'CREATE TABLE IF NOT EXISTS action_execution_logs(log_id TEXT PRIMARY KEY,session_id TEXT,namespace TEXT NOT NULL,tool_name TEXT NOT NULL,status TEXT NOT NULL,input_json TEXT,output_json TEXT,output_r2_uri TEXT,error_message TEXT,latency_ms INTEGER,input_tokens INTEGER,output_tokens INTEGER,created_at TEXT NOT NULL)\');',
    '  await dbRun(db,\'CREATE INDEX IF NOT EXISTS idx_ael_session ON action_execution_logs(session_id)\');',
    '  await dbRun(db,\'CREATE INDEX IF NOT EXISTS idx_ael_tool ON action_execution_logs(tool_name)\');',
    '  await dbRun(db,\'CREATE INDEX IF NOT EXISTS idx_sessions_ns ON mcp_sessions(namespace)\');',
    '}',
    '',
    'async function executeWithWrapper(env,ctx,toolName,args,sessionId,handlerFn){',
    '  const logId=genId(\'log\');const start=Date.now();const inputStr=JSON.stringify(args);const inputToks=Math.ceil(byteLen(inputStr)/4);',
    '  let status=\'success\',outputData=null,errorMsg=null;',
    '  try{outputData=await Promise.race([handlerFn(args,env),new Promise((_,r)=>setTimeout(()=>r(new Error(\'timeout\')),'+defaultTimeout+'))]);return outputData;}',
    '  catch(e){status=\'error\';errorMsg=e instanceof Error?e.message:String(e);throw e;}',
    '  finally{',
    '    const latency=Date.now()-start;const outputStr=outputData?JSON.stringify(outputData):\'\';const outputToks=Math.ceil(byteLen(outputStr)/4);',
    '    let outputJson=null,outputR2Uri=null;',
    '    if('+logPayloadDefault+'&&outputStr){if(byteLen(outputStr)>PAYLOAD_THRESHOLD_BYTES&&env.R2){outputR2Uri=await r2Put(env.R2,\'logs/\'+NAMESPACE+\'/\'+logId+\'.json\',outputData).catch(()=>null);}else{outputJson=outputStr.slice(0,8192);}}',
    '    if(env.DB){const w=dbRun(env.DB,\'INSERT INTO action_execution_logs VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)\',[logId,sessionId||null,NAMESPACE,toolName,status,'+logPayloadDefault+'?inputStr.slice(0,4096):null,outputJson,outputR2Uri,errorMsg,latency,inputToks,outputToks,nowIso()]).catch(function(e){console.error(\'log:\',e.message);});if(ctx)ctx.waitUntil(w);else await w;}',
    '    if(env.KV)kvSet(env.KV,NAMESPACE+\':last_execution\',{log_id:logId,tool:toolName,status,latency_ms:latency,at:nowIso()}).catch(function(){});',
    '  }',
    '}',
    '',
    statusFn,
    '',
    sessionFns,
    '',
    '// -- Tool Handlers (generated from blueprint) --',
    handlerFunctions,
    '',
    'const HANDLER_MAP=new Map([',
    fullHandlerMap,
    ']);',
    '',
    'async function handleMcpRequest(request,env,ctx){',
    '  let body;try{body=await request.json();}catch{return rpcErr(null,-32700,\'Parse error\');}',
    '  const{id,method,params}=body;',
    '  if(method===\'initialize\')return rpc(id,{protocolVersion:\'2024-11-05\',capabilities:{tools:{}},serverInfo:{name:WORKER_NAME,version:WORKER_VERSION}});',
    '  if(method===\'notifications/initialized\')return new Response(null,{status:204,headers:CORS});',
    '  if(method===\'ping\')return rpc(id,{});',
    '  if(method===\'tools/list\')return rpc(id,{tools:TOOLS});',
    '  if(method===\'tools/call\'){',
    '    const toolName=params&&params.name;const args=(params&&params.arguments)||{};',
    '    if(!toolName)return rpcErr(id,-32602,\'Missing params.name\');',
    '    const handler=HANDLER_MAP.get(toolName);if(!handler)return rpcErr(id,-32601,\'Unknown tool: \'+toolName);',
    '    if(env.DB)try{await ensureBaselineSchema(env.DB);}catch(e){console.error(\'schema:\',e);}',
    '    const sessionId=typeof args.session_id===\'string\'?args.session_id:null;',
    '    try{const r=await executeWithWrapper(env,ctx,toolName,args,sessionId,handler);return toolOk(id,r);}',
    '    catch(e){return rpcErr(id,-32603,\'Tool error: \'+(e instanceof Error?e.message:String(e)));}',
    '  }',
    '  return rpcErr(id,-32601,\'Method not found: \'+method);',
    '}',
    '',
    'export default{async fetch(request,env,ctx){',
    '  if(request.method===\'OPTIONS\')return new Response(null,{status:204,headers:CORS});',
    '  const url=new URL(request.url);',
    '  if(url.pathname===\'/health\')return Response.json({status:\'ok\',worker:WORKER_NAME,version:WORKER_VERSION},{headers:CORS});',
    '  if(url.pathname===\'/schema\')return Response.json({tools:TOOLS},{headers:CORS});',
    '  if(request.method!==\'POST\')return new Response(\'Not found\',{status:404,headers:CORS});',
    '  return handleMcpRequest(request,env,ctx);',
    '}};',
  ].join('\n');
}

function renderWranglerConfig(meta,infra,resolvedBindings){
  const lines=['{"name":"'+meta.project_name+'","main":"worker.js","compatibility_date":"2024-11-01","compatibility_flags":["nodejs_compat"],"observability":{"enabled":true}'];
  const extras=[];
  if(infra.d1_databases&&infra.d1_databases.length){const b=infra.d1_databases.map(function(d){const r=resolvedBindings.d1&&resolvedBindings.d1[d.binding];return'{"binding":"'+d.binding+'","database_name":"'+d.database_name+'","database_id":"'+(r?r.id:'UNRESOLVED')+'"}';}).join(',');extras.push('"d1_databases":['+b+']');}
  if(infra.kv_namespaces&&infra.kv_namespaces.length){const b=infra.kv_namespaces.map(function(k){const r=resolvedBindings.kv&&resolvedBindings.kv[k.binding];return'{"binding":"'+k.binding+'","id":"'+(r?r.id:'UNRESOLVED')+'"}';}).join(',');extras.push('"kv_namespaces":['+b+']');}
  if(infra.r2_buckets&&infra.r2_buckets.length){const b=infra.r2_buckets.map(function(r){return'{"binding":"'+r.binding+'","bucket_name":"'+r.bucket_name+'"}';}).join(',');extras.push('"r2_buckets":['+b+']');}
  if(infra.vectorize_indexes&&infra.vectorize_indexes.length){const b=infra.vectorize_indexes.map(function(v){return'{"binding":"'+v.binding+'","index_name":"'+v.index_name+'"}';}).join(',');extras.push('"vectorize":['+b+']');}
  if(infra.ai_binding)extras.push('"ai":{"binding":"AI"}');
  const base=lines.join('');
  if(extras.length)return base.slice(0,-1)+','+extras.join(',')+'}';
  return base+'}';
}

function renderManifest(meta,tools,opts){
  const allTools=[];if(opts.include_status_tool!==false)allTools.push(meta.namespace+'_status');if(opts.include_session_tools!==false)allTools.push('start_session','get_session','list_sessions');tools.forEach(function(t){allTools.push(t.name);});
  return JSON.stringify({name:meta.project_name,version:meta.version,description:meta.description,main:'worker.js',wrangler:'wrangler.jsonc',secrets:(meta.infrastructure&&meta.infrastructure.secrets)||[],tools:allTools},null,2);
}

async function handle_factory_status(args,env){
  let dbOk=false,genCount=0;
  try{if(env.DB){await ensureSchema(env.DB);const r=await dbFirst(env.DB,"SELECT COUNT(*) as n FROM factory_jobs");genCount=r?r.n:0;dbOk=true;}}catch{}
  return{status:'ok',worker:'afo-mcp-factory',version:VERSION,bindings:{DB:dbOk,CF_API_TOKEN:!!env.CF_API_TOKEN,GITHUB_TOKEN:!!env.GITHUB_TOKEN},total_generations:genCount,tools:TOOLS.map(function(t){return t.name;})};
}

async function handle_validate_blueprint(args,env){
  const bp=args.blueprint;const errors=validateBlueprint(bp);
  if(errors.length>0)return{ok:false,valid:false,errors};
  const meta=bp.metadata;const tools=bp.tools||[];const opts=bp.generation_options||{};
  return{ok:true,valid:true,plan:{project_name:meta.project_name,namespace:meta.namespace,version:meta.version,tools_count:tools.length,auto_injected_tools:[opts.include_status_tool!==false?meta.namespace+'_status':null,opts.include_session_tools!==false?'start_session':null,opts.include_session_tools!==false?'get_session':null,opts.include_session_tools!==false?'list_sessions':null].filter(Boolean),d1_databases:(bp.infrastructure&&bp.infrastructure.d1_databases||[]).map(function(d){return d.database_name;}),kv_namespaces:(bp.infrastructure&&bp.infrastructure.kv_namespaces||[]).map(function(k){return k.namespace_title;}),r2_buckets:(bp.infrastructure&&bp.infrastructure.r2_buckets||[]).map(function(r){return r.bucket_name;}),vectorize_indexes:(bp.infrastructure&&bp.infrastructure.vectorize_indexes||[]).map(function(v){return v.index_name;}),files_to_generate:['worker.js','wrangler.jsonc','mcp.manifest.json','schema.sql','README.md']}};
}

async function handle_generate_worker(args,env){
  const bp=args.blueprint;const dryRun=args.dry_run===true;
  const errors=validateBlueprint(bp);if(errors.length>0)return{ok:false,error:'Blueprint validation failed',errors};
  const meta=bp.metadata;const infra=bp.infrastructure||{};const opts=bp.generation_options||{};
  const owner=meta.owner||'nothinginfinity';const repo=meta.target_repo||'repo-copilot';const branch='main';
  const jobId=genId('job');const blueprintHash=slugHash(JSON.stringify(bp));const createdAt=nowIso();
  if(env.DB&&!dryRun){await ensureSchema(env.DB);await dbRun(env.DB,'INSERT INTO factory_jobs VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',[jobId,meta.project_name,meta.namespace,'running',blueprintHash,0,null,null,null,null,null,createdAt,createdAt]);}
  const infraCreated={d1:{},kv:{},r2:{},vectorize:{}};const resolvedBindings={d1:{},kv:{},r2:{},vectorize:{}};
  try{
    if(!dryRun&&env.CF_API_TOKEN){
      for(const d of(infra.d1_databases||[])){const r=await resolveD1(env,d.database_name,d.auto_create!==false);resolvedBindings.d1[d.binding]=r;infraCreated.d1[d.binding]=r;}
      for(const k of(infra.kv_namespaces||[])){const r=await resolveKV(env,k.namespace_title,k.auto_create!==false);resolvedBindings.kv[k.binding]=r;infraCreated.kv[k.binding]=r;}
      for(const r of(infra.r2_buckets||[])){const rv=await resolveR2(env,r.bucket_name,r.auto_create!==false);resolvedBindings.r2[r.binding]=rv;infraCreated.r2[r.binding]=rv;}
      for(const v of(infra.vectorize_indexes||[])){const rv=await resolveVectorize(env,v.index_name,v.auto_create||false,v.dimensions,v.metric);resolvedBindings.vectorize[v.binding]=rv;infraCreated.vectorize[v.binding]=rv;}
    }
    const workerSource=renderWorkerSource(bp,resolvedBindings);
    const wranglerConfig=renderWranglerConfig(meta,infra,resolvedBindings);
    const manifestJson=renderManifest(meta,bp.tools||[],opts);
    const schemaSql=['-- Schema for '+meta.project_name+' (namespace: '+meta.namespace+')','-- Generated by afo-mcp-factory v'+VERSION+' at '+createdAt,'CREATE TABLE IF NOT EXISTS mcp_sessions(session_id TEXT PRIMARY KEY,namespace TEXT NOT NULL,status TEXT NOT NULL DEFAULT \'active\',description TEXT,metadata TEXT,parent_id TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);','CREATE TABLE IF NOT EXISTS action_execution_logs(log_id TEXT PRIMARY KEY,session_id TEXT,namespace TEXT NOT NULL,tool_name TEXT NOT NULL,status TEXT NOT NULL,input_json TEXT,output_json TEXT,output_r2_uri TEXT,error_message TEXT,latency_ms INTEGER,input_tokens INTEGER,output_tokens INTEGER,created_at TEXT NOT NULL);','CREATE INDEX IF NOT EXISTS idx_ael_session ON action_execution_logs(session_id);','CREATE INDEX IF NOT EXISTS idx_ael_tool ON action_execution_logs(tool_name);','CREATE INDEX IF NOT EXISTS idx_sessions_ns ON mcp_sessions(namespace);'].join('\n');
    const readme=['# '+meta.project_name,'','> '+meta.description,'','**Generated by afo-mcp-factory v'+VERSION+'** on '+createdAt,'','## Tools','',(bp.tools||[]).map(function(t){return'- `'+t.name+'` — '+t.description;}).join('\n'),'','## Endpoint','','https://'+meta.project_name+'.'+(meta.workers_subdomain||'jaredtechfit.workers.dev')+'/mcp'].join('\n');
    const files={'worker.js':workerSource,'wrangler.jsonc':wranglerConfig,'mcp.manifest.json':manifestJson,'schema.sql':schemaSql,'README.md':readme};
    if(dryRun)return{ok:true,dry_run:true,job_id:jobId,project_name:meta.project_name,files:Object.keys(files).reduce(function(acc,k){acc[k]={bytes:files[k].length,preview:files[k].slice(0,400)+(files[k].length>400?'\n...[truncated]':'')};return acc;},{}),infra_plan:{d1:Object.keys(infraCreated.d1).length,kv:Object.keys(infraCreated.kv).length,r2:Object.keys(infraCreated.r2).length,vectorize:Object.keys(infraCreated.vectorize).length}};
    const commitMsg='feat: generate '+meta.project_name+' v'+meta.version+' [afo-mcp-factory v'+VERSION+']';
    const dirs=[];if(opts.commit_to_workers_dir!==false)dirs.push('workers/'+meta.project_name);if(opts.commit_to_apps_dir!==false)dirs.push('apps/'+meta.project_name);
    let lastCommitSha=null;const writtenPaths=[];
    for(const dir of dirs){for(const filename of Object.keys(files)){const path=dir+'/'+filename;const existingSha=env.GITHUB_TOKEN?await ghGetSha(env,owner,repo,path,branch):null;if(env.GITHUB_TOKEN){const sha=await ghPut(env,owner,repo,path,files[filename],commitMsg,branch,existingSha);if(sha)lastCommitSha=sha;writtenPaths.push(path);}}}
    const receipt={job_id:jobId,project_name:meta.project_name,namespace:meta.namespace,version:meta.version,blueprint_hash:blueprintHash,files_generated:Object.keys(files).length*dirs.length,infra_created:infraCreated,resolved_bindings:resolvedBindings,commit_sha:lastCommitSha,written_paths:writtenPaths,generated_at:createdAt,deploy_url:'https://'+meta.project_name+'.'+(meta.workers_subdomain||'jaredtechfit.workers.dev')+'/mcp'};
    if(env.DB)await dbRun(env.DB,'UPDATE factory_jobs SET status=?,files_generated=?,infra_created=?,commit_sha=?,deploy_url=?,receipt_json=?,updated_at=? WHERE job_id=?',['complete',receipt.files_generated,JSON.stringify(infraCreated),lastCommitSha,receipt.deploy_url,JSON.stringify(receipt),nowIso(),jobId]);
    return{ok:true,job_id:jobId,project_name:meta.project_name,commit_sha:lastCommitSha,deploy_url:receipt.deploy_url,files_generated:receipt.files_generated,written_paths:writtenPaths,infra_created:infraCreated,next_steps:['Deploy: afo-worker-transport-mcp → deploy_worker_from_github { owner: "'+owner+'", repo: "'+repo+'", worker_slug: "'+meta.project_name+'" }','Set required secrets in Cloudflare dashboard','Add connector: https://'+meta.project_name+'.'+(meta.workers_subdomain||'jaredtechfit.workers.dev')+'/mcp']};
  }catch(e){const msg=e instanceof Error?e.message:String(e);if(env.DB)await dbRun(env.DB,'UPDATE factory_jobs SET status=?,error_message=?,updated_at=? WHERE job_id=?',['failed',msg,nowIso(),jobId]).catch(function(){});return{ok:false,job_id:jobId,error:msg};}
}

async function handle_get_generation_receipt(args,env){if(!env.DB)throw new Error('DB binding required');await ensureSchema(env.DB);const job=await dbFirst(env.DB,'SELECT * FROM factory_jobs WHERE job_id = ?',[args.job_id]);if(!job)return{ok:false,error:'Job not found: '+args.job_id};return{ok:true,job,receipt:job.receipt_json?JSON.parse(job.receipt_json):null};}
async function handle_list_generations(args,env){if(!env.DB)throw new Error('DB binding required');await ensureSchema(env.DB);const jobs=await dbAll(env.DB,'SELECT job_id,project_name,namespace,status,files_generated,commit_sha,deploy_url,created_at FROM factory_jobs ORDER BY created_at DESC LIMIT ?',[args.limit||10]);return{ok:true,jobs,count:jobs.length};}

const HANDLER_MAP=new Map([['factory_status',handle_factory_status],['validate_blueprint',handle_validate_blueprint],['generate_worker',handle_generate_worker],['get_generation_receipt',handle_get_generation_receipt],['list_generations',handle_list_generations]]);

export default{async fetch(request,env,ctx){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
  const url=new URL(request.url);
  if(url.pathname==='/health')return Response.json({status:'ok',worker:'afo-mcp-factory',version:VERSION},{headers:CORS});
  if(url.pathname==='/schema')return Response.json({tools:TOOLS},{headers:CORS});
  if(request.method!=='POST')return new Response('Not found',{status:404,headers:CORS});
  let body;try{body=await request.json();}catch{return rpcErr(null,-32700,'Parse error');}
  const{id,method,params}=body;
  if(method==='initialize')return rpc(id,{protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'afo-mcp-factory',version:VERSION}});
  if(method==='notifications/initialized')return new Response(null,{status:204,headers:CORS});
  if(method==='ping')return rpc(id,{});
  if(method==='tools/list')return rpc(id,{tools:TOOLS});
  if(method==='tools/call'){
    const toolName=params&&params.name;const args=(params&&params.arguments)||{};
    if(!toolName)return rpcErr(id,-32602,'Missing params.name');
    const handler=HANDLER_MAP.get(toolName);if(!handler)return rpcErr(id,-32601,'Unknown tool: '+toolName);
    try{if(env.DB)try{await ensureSchema(env.DB);}catch{}return toolOk(id,await handler(args,env));}
    catch(e){return rpcErr(id,-32603,'Tool error: '+(e instanceof Error?e.message:String(e)));}
  }
  return rpcErr(id,-32601,'Method not found: '+method);
}};
