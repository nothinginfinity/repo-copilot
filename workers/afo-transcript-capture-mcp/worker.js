const VERSION="0.1.0";
const WORKER_NAME="afo-transcript-capture-mcp";
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization,Mcp-Session-Id'};
const TOOLS=[{
  "name": "afo-transcript-capture_status",
  "description": "Health check. Returns version, all binding statuses, and tool list.",
  "inputSchema": {
    "type": "object",
    "properties": {},
    "required": []
  }
},
{
  "name": "probe_transcript_url",
  "description": "Probe a YouTube URL for available public caption tracks without storing anything.",
  "inputSchema": {
    "type": "object",
    "required": [
      "url"
    ],
    "properties": {
      "url": {
        "type": "string"
      },
      "language": {
        "type": "string",
        "default": "en"
      }
    }
  }
},
{
  "name": "capture_transcript",
  "description": "Fetch a public YouTube caption track, normalize transcript text, store it in D1/KV, embed chunks with Workers AI, and upsert into Vectorize. Does not download audio or video.",
  "inputSchema": {
    "type": "object",
    "required": [
      "url"
    ],
    "properties": {
      "url": {
        "type": "string"
      },
      "language": {
        "type": "string",
        "default": "en"
      },
      "title": {
        "type": "string"
      },
      "source_note": {
        "type": "string"
      },
      "force": {
        "type": "boolean",
        "default": false
      }
    }
  }
},
{
  "name": "get_transcript",
  "description": "Get a stored transcript by transcript_id. Can return text, segments, or metadata only.",
  "inputSchema": {
    "type": "object",
    "required": [
      "transcript_id"
    ],
    "properties": {
      "transcript_id": {
        "type": "string"
      },
      "include_text": {
        "type": "boolean",
        "default": true
      },
      "include_segments": {
        "type": "boolean",
        "default": false
      }
    }
  }
},
{
  "name": "list_transcripts",
  "description": "List stored transcript records.",
  "inputSchema": {
    "type": "object",
    "required": [],
    "properties": {
      "limit": {
        "type": "number",
        "default": 20
      },
      "video_id": {
        "type": "string"
      },
      "language": {
        "type": "string"
      }
    }
  }
},
{
  "name": "search_transcripts",
  "description": "Semantic search across transcript chunks stored in Vectorize.",
  "inputSchema": {
    "type": "object",
    "required": [
      "query"
    ],
    "properties": {
      "query": {
        "type": "string"
      },
      "top_k": {
        "type": "number",
        "default": 8
      },
      "video_id": {
        "type": "string"
      }
    }
  }
},
{
  "name": "summarize_transcript",
  "description": "Return a simple extractive summary and key sections from stored transcript text. Uses text already stored in D1.",
  "inputSchema": {
    "type": "object",
    "required": [
      "transcript_id"
    ],
    "properties": {
      "transcript_id": {
        "type": "string"
      },
      "max_chars": {
        "type": "number",
        "default": 4000
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
  if(name==="afo_transcript_capture_status"){const res={status:"ok",worker:WORKER_NAME,version:VERSION,generated_at:"2026-06-14T13:27:30.873Z",bindings:{},tools:TOOLS.map(t=>t.name)};
  try{await ensureSchema(env.DB);res.bindings.DB=true;}catch{res.bindings.DB=false;}
  try{await env.KV.put("_ping","1",{expirationTtl:60});res.bindings.KV=true;}catch{res.bindings.KV=false;}
  res.bindings.VECTORIZE=!!env.VECTORIZE;res.bindings.AI=!!env.AI;
  return res;}
  await ensureSchema(env.DB);
  if (name === "probe_transcript_url") {
    const { url } = args;
    if (!url) throw new Error("probe_transcript_url: url required");
    const url=args.url; if(!url) throw new Error('url required'); function vid(u){try{const x=new URL(u); if(x.hostname.includes('youtu.be')) return x.pathname.slice(1).split('/')[0]; if(x.searchParams.get('v')) return x.searchParams.get('v'); const m=x.pathname.match(/\/shorts\/([^/?#]+)/); if(m) return m[1];}catch{} return null} function unesc(s){return (s||'').replace(/\\u0026/g,'&').replace(/&amp;/g,'&').replace(/\\\//g,'/')} const videoId=vid(url); if(!videoId) throw new Error('Could not parse YouTube video id'); const html=await (await fetch('https://www.youtube.com/watch?v='+videoId,{headers:{'User-Agent':'Mozilla/5.0'}})).text(); const m=html.match(/"captionTracks":(\[.*?\])\s*,\s*"audioTracks"/); if(!m) return {ok:true,video_id:videoId,has_transcript:false,tracks:[],note:'No public captionTracks found'}; let arr; try{arr=JSON.parse(unesc(m[1]));}catch(e){return {ok:false,video_id:videoId,error:'captionTracks parse failed: '+e.message}} return {ok:true,video_id:videoId,has_transcript:arr.length>0,tracks:arr.map(t=>({languageCode:t.languageCode,name:t.name&&t.name.simpleText,kind:t.kind||'manual',isTranslatable:!!t.isTranslatable}))};
  }

  if (name === "capture_transcript") {
    const { url } = args;
    if (!url) throw new Error("capture_transcript: url required");
    const url=args.url; if(!url) throw new Error('url required'); await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS transcripts (transcript_id TEXT PRIMARY KEY, url TEXT, video_id TEXT, title TEXT, language TEXT, source_note TEXT, transcript_text TEXT, segments_json TEXT, chunk_count INTEGER, status TEXT, created_at TEXT, updated_at TEXT)'); function vid(u){try{const x=new URL(u); if(x.hostname.includes('youtu.be')) return x.pathname.slice(1).split('/')[0]; if(x.searchParams.get('v')) return x.searchParams.get('v'); const m=x.pathname.match(/\/shorts\/([^/?#]+)/); if(m) return m[1];}catch{} return null} function unesc(s){return (s||'').replace(/\\u0026/g,'&').replace(/&amp;/g,'&').replace(/\\\//g,'/')} function strip(s){return (s||'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim()} const videoId=vid(url); if(!videoId) throw new Error('Could not parse YouTube video id'); const cacheKey='transcript:url:'+url; if(!args.force){const cached=await kvGet(env.KV,cacheKey); if(cached) return {ok:true,cached:true,...cached}} const html=await (await fetch('https://www.youtube.com/watch?v='+videoId,{headers:{'User-Agent':'Mozilla/5.0'}})).text(); let pageTitle=args.title||''; const tm=html.match(/<title>(.*?)<\/title>/i); if(!pageTitle&&tm) pageTitle=strip(tm[1]).replace(/ - YouTube$/,''); const m=html.match(/"captionTracks":(\[.*?\])\s*,\s*"audioTracks"/); if(!m) throw new Error('No public captionTracks found'); const tracks=JSON.parse(unesc(m[1])); const lang=args.language||'en'; const track=tracks.find(t=>t.languageCode===lang)||tracks.find(t=>(t.languageCode||'').startsWith(lang.split('-')[0]))||tracks[0]; if(!track) throw new Error('No caption track available'); const base=unesc(track.baseUrl); const xml=await (await fetch(base)).text(); const segs=[...xml.matchAll(/<text[^>]*start="([^"]+)"[^>]*(?:dur="([^"]+)")?[^>]*>([\s\S]*?)<\/text>/g)].map(x=>({start:Number(x[1]),dur:Number(x[2]||0),text:strip(x[3])})).filter(s=>s.text); const text=segs.map(s=>s.text).join(' ').replace(/\s+/g,' ').trim(); const id=genId('tx'); const now=nowIso(); const chunks=[]; for(let i=0;i<text.length;i+=1200){chunks.push(text.slice(i,i+1500)); if(i+1500>=text.length) break} await dbRun(env.DB,'INSERT INTO transcripts VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',[id,url,videoId,pageTitle,track.languageCode||lang,args.source_note||'',text,JSON.stringify(segs),chunks.length,'complete',now,now]); for(let i=0;i<chunks.length;i++){const er=await env.AI.run('@cf/baai/bge-base-en-v1.5',{text:[(pageTitle+' '+chunks[i]).slice(0,512)]}); const vector=er.data&&er.data[0]; if(vector) await env.VECTORIZE.upsert([{id:'tx_'+id+'_'+i,values:vector,metadata:{transcript_id:id,url,video_id:videoId,title:pageTitle,language:track.languageCode||lang,chunk:i,text:chunks[i].slice(0,900)}}])} const out={transcript_id:id,url,video_id:videoId,title:pageTitle,language:track.languageCode||lang,segments:segs.length,characters:text.length,chunk_count:chunks.length,status:'complete'}; await kvSet(env.KV,cacheKey,out); return {ok:true,...out};
  }

  if (name === "get_transcript") {
    const { transcript_id } = args;
    if (!transcript_id) throw new Error("get_transcript: transcript_id required");
    if(!args.transcript_id) throw new Error('transcript_id required'); await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS transcripts (transcript_id TEXT PRIMARY KEY, url TEXT, video_id TEXT, title TEXT, language TEXT, source_note TEXT, transcript_text TEXT, segments_json TEXT, chunk_count INTEGER, status TEXT, created_at TEXT, updated_at TEXT)'); const rows=await dbAll(env.DB,'SELECT * FROM transcripts WHERE transcript_id=? LIMIT 1',[args.transcript_id]); const r=rows[0]; if(!r) return {ok:true,found:false}; const out={ok:true,found:true,transcript_id:r.transcript_id,url:r.url,video_id:r.video_id,title:r.title,language:r.language,source_note:r.source_note,chunk_count:r.chunk_count,status:r.status,created_at:r.created_at,updated_at:r.updated_at}; if(args.include_text!==false) out.transcript_text=r.transcript_text; if(args.include_segments) out.segments=JSON.parse(r.segments_json||'[]'); return out;
  }

  if (name === "list_transcripts") {
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS transcripts (transcript_id TEXT PRIMARY KEY, url TEXT, video_id TEXT, title TEXT, language TEXT, source_note TEXT, transcript_text TEXT, segments_json TEXT, chunk_count INTEGER, status TEXT, created_at TEXT, updated_at TEXT)'); let sql='SELECT transcript_id,url,video_id,title,language,chunk_count,status,created_at,updated_at FROM transcripts'; const p=[]; const w=[]; if(args.video_id){w.push('video_id=?');p.push(args.video_id)} if(args.language){w.push('language=?');p.push(args.language)} if(w.length) sql+=' WHERE '+w.join(' AND '); sql+=' ORDER BY created_at DESC LIMIT ?'; p.push(args.limit||20); const rows=await dbAll(env.DB,sql,p); return {ok:true,count:rows.length,transcripts:rows};
  }

  if (name === "search_transcripts") {
    const { query } = args;
    if (!query) throw new Error("search_transcripts: query required");
    if(!args.query) throw new Error('query required'); const topK=Math.min(args.top_k||8,20); const er=await env.AI.run('@cf/baai/bge-base-en-v1.5',{text:[args.query.slice(0,512)]}); const vector=er.data&&er.data[0]; if(!vector) throw new Error('Embedding failed'); const res=await env.VECTORIZE.query(vector,{topK,returnMetadata:true}); let matches=res.matches||[]; if(args.video_id) matches=matches.filter(m=>m.metadata&&m.metadata.video_id===args.video_id); return {ok:true,query:args.query,count:matches.length,results:matches.map(m=>({score:m.score,transcript_id:m.metadata&&m.metadata.transcript_id,video_id:m.metadata&&m.metadata.video_id,title:m.metadata&&m.metadata.title,url:m.metadata&&m.metadata.url,language:m.metadata&&m.metadata.language,chunk:m.metadata&&m.metadata.chunk,text:m.metadata&&m.metadata.text,id:m.id}))};
  }

  if (name === "summarize_transcript") {
    const { transcript_id } = args;
    if (!transcript_id) throw new Error("summarize_transcript: transcript_id required");
    if(!args.transcript_id) throw new Error('transcript_id required'); const rows=await dbAll(env.DB,'SELECT * FROM transcripts WHERE transcript_id=? LIMIT 1',[args.transcript_id]); const r=rows[0]; if(!r) return {ok:true,found:false}; const text=(r.transcript_text||'').slice(0,args.max_chars||4000); const sentences=text.split(/(?<=[.!?])\s+/).filter(Boolean); return {ok:true,found:true,transcript_id:r.transcript_id,title:r.title,video_id:r.video_id,language:r.language,summary:sentences.slice(0,8).join(' '),key_excerpt:text.slice(0,1200),note:'v0.1 uses extractive summary; later version can add LLM summarization via Workers AI when model binding is configured for generation.'};
  }

  throw new Error("Unknown tool: "+name);}
export default{async fetch(request,env,ctx){if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});const url=new URL(request.url);if(url.pathname==="/health")return Response.json({status:"ok",worker:WORKER_NAME,version:VERSION},{headers:CORS});if(request.method!=="POST")return new Response("not found",{status:404,headers:CORS});let body;try{body=await request.json();}catch{return errResp(null,-32700,"Parse error");}const{id,method,params}=body;if(method==="initialize")return rpc(id,{protocolVersion:"2024-11-05",capabilities:{tools:{}},serverInfo:{name:WORKER_NAME,version:VERSION}});if(method==="notifications/initialized")return new Response(null,{status:204,headers:CORS});if(method==="ping")return rpc(id,{});if(method==="tools/list")return rpc(id,{tools:TOOLS});if(method==="tools/call"){try{return tool(id,await handle(params?.name,params?.arguments||{},env,ctx));}catch(e){return errResp(id,-32603,"Tool error: "+e.message);}}return errResp(id,-32601,"Method not found: "+method);}};