const VERSION="0.3.1";
const WORKER_NAME="afo-youtube-transcript-resilient-mcp";
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization,Mcp-Session-Id'};
const TOOLS=[{
  "name": "youtube_resilient_status",
  "description": "Health check and capability report for the resilient YouTube transcript MCP.",
  "inputSchema": {
    "type": "object",
    "properties": {},
    "required": []
  }
},
{
  "name": "probe_youtube_sources",
  "description": "Probe a YouTube URL for video_id, oEmbed title, and visible public captionTracks without storing anything.",
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
  "name": "capture_youtube_transcript_resilient",
  "description": "Capture transcript from visible public YouTube caption tracks/timedtext, store text and segments in D1/KV, and return transcript_id.",
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
      "force": {
        "type": "boolean",
        "default": false
      },
      "source_note": {
        "type": "string"
      }
    }
  }
},
{
  "name": "submit_browser_caption_payload",
  "description": "Import transcript payload exported by a browser or external capture worker. Accepts plain_text, JSON3, VTT, or segment JSON.",
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
      "payload_format": {
        "type": "string",
        "enum": [
          "plain_text",
          "json3",
          "vtt",
          "segments_json"
        ],
        "default": "plain_text"
      },
      "text": {
        "type": "string"
      },
      "payload": {
        "type": "string"
      },
      "segments": {
        "type": "array",
        "items": {
          "type": "object"
        }
      },
      "source_note": {
        "type": "string"
      }
    }
  }
},
{
  "name": "import_transcript_text",
  "description": "Manually import known transcript text for a YouTube video, store it in D1/KV, and make it retrievable/searchable.",
  "inputSchema": {
    "type": "object",
    "required": [
      "url",
      "text"
    ],
    "properties": {
      "url": {
        "type": "string"
      },
      "text": {
        "type": "string"
      },
      "language": {
        "type": "string",
        "default": "en"
      },
      "title": {
        "type": "string"
      },
      "source_method": {
        "type": "string",
        "default": "manual_import"
      },
      "source_note": {
        "type": "string"
      }
    }
  }
},
{
  "name": "create_audio_transcription_job",
  "description": "Create a D1 job record for an external user-authorized audio transcription worker. This MCP does not download YouTube audio.",
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
      "audio_source_note": {
        "type": "string"
      }
    }
  }
},
{
  "name": "submit_transcription_result",
  "description": "Submit completed text from an external transcription job, store it in D1/KV, and mark the job complete.",
  "inputSchema": {
    "type": "object",
    "required": [
      "job_id",
      "text"
    ],
    "properties": {
      "job_id": {
        "type": "string"
      },
      "text": {
        "type": "string"
      },
      "segments": {
        "type": "array",
        "items": {
          "type": "object"
        }
      },
      "title": {
        "type": "string"
      },
      "source_method": {
        "type": "string",
        "default": "external_transcription"
      },
      "webhook_secret": {
        "type": "string"
      }
    }
  }
},
{
  "name": "get_youtube_transcript_resilient",
  "description": "Retrieve a stored resilient transcript by transcript_id.",
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
  "name": "list_youtube_transcripts_resilient",
  "description": "List stored resilient transcript records, optionally filtered by video_id or language.",
  "inputSchema": {
    "type": "object",
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
    },
    "required": []
  }
},
{
  "name": "search_youtube_transcripts_resilient",
  "description": "Keyword search stored transcript text and return snippets.",
  "inputSchema": {
    "type": "object",
    "required": [
      "query"
    ],
    "properties": {
      "query": {
        "type": "string"
      },
      "video_id": {
        "type": "string"
      },
      "top_k": {
        "type": "number",
        "default": 8
      }
    }
  }
},
{
  "name": "summarize_youtube_transcript_resilient",
  "description": "Summarize a stored transcript with Workers AI if available, otherwise return an extractive preview.",
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
        "default": 5000
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
  await ensureSchema(env.DB);
  if (name === "youtube_resilient_status") {
    return { ok:true, worker:'afo-youtube-transcript-resilient-mcp', version:'0.3.1', capabilities:['public_caption_capture','browser_payload_import','manual_import','external_transcription_job_handoff','d1_kv_storage','get','list','search','summary'], note:'No protected media download. Audio fallback is a job handoff for user-authorized external transcription.' };
  }

  if (name === "probe_youtube_sources") {
    const { url } = args;
    if (!url) throw new Error("probe_youtube_sources: url required");
    function vid(u){try{const x=new URL(u);if(x.hostname.includes('youtu.be'))return x.pathname.split('/').filter(Boolean)[0]||null;return x.searchParams.get('v')}catch(e){const m=String(u).match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{6,})/);return m?m[1]:null}} function tracks(html){const m=html.match(/\"captionTracks\":(\[.*?\])\s*,\s*\"audioTracks\"/);if(!m)return[];try{return JSON.parse(m[1].replace(/\\u0026/g,'&'))}catch(e){return[]}} const video_id=vid(args.url); if(!video_id) return {ok:false,error:'Could not extract YouTube video_id'}; const watch='https://www.youtube.com/watch?v='+video_id; let title=null; try{const o=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(watch)); if(o.ok){const j=await o.json(); title=j.title||null}}catch(e){} let caption_tracks=[]; let status=null; try{const r=await fetch(watch,{headers:{'user-agent':'Mozilla/5.0 AFO transcript probe','accept-language':(args.language||'en')+',en;q=0.8'}}); status=r.status; const html=await r.text(); caption_tracks=tracks(html).map(t=>({languageCode:t.languageCode||null,kind:t.kind||null,name:t.name?(t.name.simpleText||null):null,hasBaseUrl:!!t.baseUrl,isTranslatable:!!t.isTranslatable}))}catch(e){return {ok:true,video_id,title,watch_status:status,has_public_caption_tracks:false,caption_track_count:0,error:String(e.message||e)}} return {ok:true,video_id,title,watch_status:status,has_public_caption_tracks:caption_tracks.length>0,caption_track_count:caption_tracks.length,caption_tracks};
  }

  if (name === "capture_youtube_transcript_resilient") {
    const { url } = args;
    if (!url) throw new Error("capture_youtube_transcript_resilient: url required");
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS youtube_transcripts_resilient (id TEXT PRIMARY KEY, video_id TEXT, url TEXT, title TEXT, language TEXT, source_method TEXT, text_kv_key TEXT, segments_kv_key TEXT, char_count INTEGER, chunk_count INTEGER, status TEXT, error TEXT, created_at TEXT, updated_at TEXT)'); function vid(u){try{const x=new URL(u);if(x.hostname.includes('youtu.be'))return x.pathname.split('/').filter(Boolean)[0]||null;return x.searchParams.get('v')}catch(e){const m=String(u).match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{6,})/);return m?m[1]:null}} function tracks(html){const m=html.match(/\"captionTracks\":(\[.*?\])\s*,\s*\"audioTracks\"/);if(!m)return[];try{return JSON.parse(m[1].replace(/\\u0026/g,'&'))}catch(e){return[]}} function pick(a,lang){return a.find(t=>t.languageCode===lang)||a.find(t=>String(t.languageCode||'').startsWith(String(lang).split('-')[0]))||a.find(t=>t.kind==='asr')||a[0]} function addfmt(b,f){const u=new URL(b);u.searchParams.set('fmt',f);return u.toString()} function json3(j){const seg=[],parts=[];for(const ev of (j.events||[])){if(!ev.segs)continue;const text=ev.segs.map(s=>s.utf8||'').join('').replace(/\s+/g,' ').trim();if(!text)continue;seg.push({start_ms:ev.tStartMs||0,dur_ms:ev.dDurationMs||0,text});parts.push(text)}return {text:parts.join(' ').replace(/\s+/g,' ').trim(),segments:seg}} function vtt(s){const seg=[],parts=[];for(const b of String(s).split(/\n\s*\n/)){if(!b.includes('-->'))continue;const lines=b.split(/\r?\n/).filter(Boolean);const i=lines.findIndex(l=>l.includes('-->'));const text=lines.slice(i+1).join(' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();if(text){seg.push({text});parts.push(text)}}return {text:parts.join(' ').replace(/\s+/g,' ').trim(),segments:seg}} async function save(rec){const id='ytr_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);const textKey='youtube/resilient/'+id+'/text.txt';const segKey='youtube/resilient/'+id+'/segments.json';const chunks=Math.max(1,Math.ceil(rec.text.length/1200));await kvSet(env.KV,textKey,rec.text);await kvSet(env.KV,segKey,rec.segments||[]);await dbRun(env.DB,'INSERT INTO youtube_transcripts_resilient VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,rec.video_id,rec.url,rec.title,rec.language,rec.source_method,textKey,segKey,rec.text.length,chunks,'ready',null,nowIso(),nowIso()]);return {id,chunk_count:chunks}} const video_id=vid(args.url); if(!video_id)return{ok:false,error:'Could not extract YouTube video_id'}; const lang=args.language||'en'; if(!args.force){const ex=await dbFirst(env.DB,'SELECT id,source_method FROM youtube_transcripts_resilient WHERE video_id=? AND language=? AND status=? ORDER BY created_at DESC LIMIT 1',[video_id,lang,'ready']); if(ex)return{ok:true,cached:true,transcript_id:ex.id,video_id,source_method:ex.source_method}} const watch='https://www.youtube.com/watch?v='+video_id; const r=await fetch(watch,{headers:{'user-agent':'Mozilla/5.0 AFO transcript capture','accept-language':lang+',en;q=0.8'}}); const html=await r.text(); const ts=tracks(html); if(!ts.length)return{ok:false,video_id,error:'No visible public captionTracks found',fallback_tools:['submit_browser_caption_payload','import_transcript_text','create_audio_transcription_job']}; const tr=pick(ts,lang); let parsed=null,method='caption_json3'; try{const jr=await fetch(addfmt(tr.baseUrl,'json3')); if(jr.ok)parsed=json3(await jr.json())}catch(e){} if(!parsed||!parsed.text){try{const vr=await fetch(addfmt(tr.baseUrl,'vtt')); if(vr.ok){parsed=vtt(await vr.text());method='caption_vtt'}}catch(e){}} if(!parsed||!parsed.text)return{ok:false,video_id,error:'Caption track found but parsed empty',fallback_tools:['submit_browser_caption_payload','import_transcript_text','create_audio_transcription_job']}; const saved=await save({video_id,url:watch,title:args.title||null,language:lang,source_method:method,text:parsed.text,segments:parsed.segments}); return{ok:true,transcript_id:saved.id,video_id,language:lang,source_method:method,char_count:parsed.text.length,chunk_count:saved.chunk_count};
  }

  if (name === "submit_browser_caption_payload") {
    const { url } = args;
    if (!url) throw new Error("submit_browser_caption_payload: url required");
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS youtube_transcripts_resilient (id TEXT PRIMARY KEY, video_id TEXT, url TEXT, title TEXT, language TEXT, source_method TEXT, text_kv_key TEXT, segments_kv_key TEXT, char_count INTEGER, chunk_count INTEGER, status TEXT, error TEXT, created_at TEXT, updated_at TEXT)'); function vid(u){try{const x=new URL(u);if(x.hostname.includes('youtu.be'))return x.pathname.split('/').filter(Boolean)[0]||null;return x.searchParams.get('v')}catch(e){const m=String(u).match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{6,})/);return m?m[1]:null}} function parseVtt(s){const parts=[];for(const b of String(s).split(/\n\s*\n/)){if(!b.includes('-->'))continue;const lines=b.split(/\r?\n/).filter(Boolean);const i=lines.findIndex(l=>l.includes('-->'));const text=lines.slice(i+1).join(' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();if(text)parts.push(text)}return parts.join(' ')} function parseJson3(j){const parts=[];for(const ev of (j.events||[])){if(ev.segs){const t=ev.segs.map(s=>s.utf8||'').join('').replace(/\s+/g,' ').trim();if(t)parts.push(t)}}return parts.join(' ')} const video_id=vid(args.url); if(!video_id)return{ok:false,error:'Could not extract YouTube video_id'}; let text=String(args.text||'').trim(); let segments=Array.isArray(args.segments)?args.segments:[]; const fmt=args.payload_format||'plain_text'; if(!text&&args.payload){if(fmt==='vtt')text=parseVtt(args.payload);else if(fmt==='json3')text=parseJson3(JSON.parse(args.payload));else if(fmt==='segments_json'){segments=JSON.parse(args.payload);text=(Array.isArray(segments)?segments:[]).map(s=>s.text||'').join(' ').trim()}else text=String(args.payload).trim()} if(!text||text.length<5)return{ok:false,error:'No usable transcript text supplied'}; const id='ytr_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8); const textKey='youtube/resilient/'+id+'/text.txt'; const segKey='youtube/resilient/'+id+'/segments.json'; const chunks=Math.max(1,Math.ceil(text.length/1200)); await kvSet(env.KV,textKey,text); await kvSet(env.KV,segKey,segments); await dbRun(env.DB,'INSERT INTO youtube_transcripts_resilient VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,video_id,'https://www.youtube.com/watch?v='+video_id,args.title||null,args.language||'en','browser_payload',textKey,segKey,text.length,chunks,'ready',null,nowIso(),nowIso()]); return{ok:true,transcript_id:id,video_id,source_method:'browser_payload',char_count:text.length,chunk_count:chunks};
  }

  if (name === "import_transcript_text") {
    const { url, text } = args;
    if (!url) throw new Error("import_transcript_text: url required");
    if (!text) throw new Error("import_transcript_text: text required");
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS youtube_transcripts_resilient (id TEXT PRIMARY KEY, video_id TEXT, url TEXT, title TEXT, language TEXT, source_method TEXT, text_kv_key TEXT, segments_kv_key TEXT, char_count INTEGER, chunk_count INTEGER, status TEXT, error TEXT, created_at TEXT, updated_at TEXT)'); function vid(u){try{const x=new URL(u);if(x.hostname.includes('youtu.be'))return x.pathname.split('/').filter(Boolean)[0]||null;return x.searchParams.get('v')}catch(e){const m=String(u).match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{6,})/);return m?m[1]:null}} const video_id=vid(args.url); if(!video_id)return{ok:false,error:'Could not extract YouTube video_id'}; const text=String(args.text||'').trim(); if(text.length<5)return{ok:false,error:'Transcript text too short'}; const id='ytr_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8); const textKey='youtube/resilient/'+id+'/text.txt'; const segKey='youtube/resilient/'+id+'/segments.json'; const chunks=Math.max(1,Math.ceil(text.length/1200)); await kvSet(env.KV,textKey,text); await kvSet(env.KV,segKey,[]); await dbRun(env.DB,'INSERT INTO youtube_transcripts_resilient VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,video_id,'https://www.youtube.com/watch?v='+video_id,args.title||null,args.language||'en',args.source_method||'manual_import',textKey,segKey,text.length,chunks,'ready',null,nowIso(),nowIso()]); return{ok:true,transcript_id:id,video_id,char_count:text.length,chunk_count:chunks};
  }

  if (name === "create_audio_transcription_job") {
    const { url } = args;
    if (!url) throw new Error("create_audio_transcription_job: url required");
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS transcript_jobs_resilient (job_id TEXT PRIMARY KEY, video_id TEXT, url TEXT, language TEXT, title TEXT, status TEXT, note TEXT, result_transcript_id TEXT, error TEXT, created_at TEXT, updated_at TEXT)'); function vid(u){try{const x=new URL(u);if(x.hostname.includes('youtu.be'))return x.pathname.split('/').filter(Boolean)[0]||null;return x.searchParams.get('v')}catch(e){const m=String(u).match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{6,})/);return m?m[1]:null}} const video_id=vid(args.url)||null; const job_id='ytjob_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8); await dbRun(env.DB,'INSERT INTO transcript_jobs_resilient VALUES (?,?,?,?,?,?,?,?,?,?,?)',[job_id,video_id,args.url,args.language||'en',args.title||null,'queued',args.audio_source_note||'external transcription required',null,null,nowIso(),nowIso()]); return{ok:true,job_id,video_id,status:'queued',next_tool:'submit_transcription_result',note:'Use an external authorized transcription worker, then submit the resulting text with job_id.'};
  }

  if (name === "submit_transcription_result") {
    const { job_id, text } = args;
    if (!job_id) throw new Error("submit_transcription_result: job_id required");
    if (!text) throw new Error("submit_transcription_result: text required");
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS youtube_transcripts_resilient (id TEXT PRIMARY KEY, video_id TEXT, url TEXT, title TEXT, language TEXT, source_method TEXT, text_kv_key TEXT, segments_kv_key TEXT, char_count INTEGER, chunk_count INTEGER, status TEXT, error TEXT, created_at TEXT, updated_at TEXT)'); await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS transcript_jobs_resilient (job_id TEXT PRIMARY KEY, video_id TEXT, url TEXT, language TEXT, title TEXT, status TEXT, note TEXT, result_transcript_id TEXT, error TEXT, created_at TEXT, updated_at TEXT)'); if(env.TRANSCRIPTION_WEBHOOK_SECRET&&args.webhook_secret!==env.TRANSCRIPTION_WEBHOOK_SECRET)return{ok:false,error:'Invalid webhook_secret'}; const job=await dbFirst(env.DB,'SELECT * FROM transcript_jobs_resilient WHERE job_id=?',[args.job_id]); if(!job)return{ok:false,error:'Job not found'}; const text=String(args.text||'').trim(); if(text.length<5)return{ok:false,error:'Transcript text too short'}; const id='ytr_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8); const textKey='youtube/resilient/'+id+'/text.txt'; const segKey='youtube/resilient/'+id+'/segments.json'; const segments=Array.isArray(args.segments)?args.segments:[]; const chunks=Math.max(1,Math.ceil(text.length/1200)); await kvSet(env.KV,textKey,text); await kvSet(env.KV,segKey,segments); await dbRun(env.DB,'INSERT INTO youtube_transcripts_resilient VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,job.video_id,job.url,args.title||job.title,job.language,args.source_method||'external_transcription',textKey,segKey,text.length,chunks,'ready',null,nowIso(),nowIso()]); await dbRun(env.DB,'UPDATE transcript_jobs_resilient SET status=?, result_transcript_id=?, updated_at=? WHERE job_id=?',['complete',id,nowIso(),args.job_id]); return{ok:true,job_id:args.job_id,transcript_id:id,char_count:text.length,chunk_count:chunks};
  }

  if (name === "get_youtube_transcript_resilient") {
    const { transcript_id } = args;
    if (!transcript_id) throw new Error("get_youtube_transcript_resilient: transcript_id required");
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS youtube_transcripts_resilient (id TEXT PRIMARY KEY, video_id TEXT, url TEXT, title TEXT, language TEXT, source_method TEXT, text_kv_key TEXT, segments_kv_key TEXT, char_count INTEGER, chunk_count INTEGER, status TEXT, error TEXT, created_at TEXT, updated_at TEXT)'); const row=await dbFirst(env.DB,'SELECT * FROM youtube_transcripts_resilient WHERE id=?',[args.transcript_id]); if(!row)return{ok:false,error:'Transcript not found'}; const out={ok:true,transcript:row}; if(args.include_text!==false)out.text=await kvGet(env.KV,row.text_kv_key); if(args.include_segments&&row.segments_kv_key)out.segments=await kvGet(env.KV,row.segments_kv_key); return out;
  }

  if (name === "list_youtube_transcripts_resilient") {
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS youtube_transcripts_resilient (id TEXT PRIMARY KEY, video_id TEXT, url TEXT, title TEXT, language TEXT, source_method TEXT, text_kv_key TEXT, segments_kv_key TEXT, char_count INTEGER, chunk_count INTEGER, status TEXT, error TEXT, created_at TEXT, updated_at TEXT)'); const limit=Math.min(args.limit||20,100); let sql='SELECT id,video_id,url,title,language,source_method,char_count,chunk_count,status,created_at,updated_at FROM youtube_transcripts_resilient WHERE 1=1'; const p=[]; if(args.video_id){sql+=' AND video_id=?';p.push(args.video_id)} if(args.language){sql+=' AND language=?';p.push(args.language)} sql+=' ORDER BY created_at DESC LIMIT ?';p.push(limit); const rows=await dbAll(env.DB,sql,p); return{ok:true,count:rows.length,transcripts:rows};
  }

  if (name === "search_youtube_transcripts_resilient") {
    const { query } = args;
    if (!query) throw new Error("search_youtube_transcripts_resilient: query required");
    await dbRun(env.DB,'CREATE TABLE IF NOT EXISTS youtube_transcripts_resilient (id TEXT PRIMARY KEY, video_id TEXT, url TEXT, title TEXT, language TEXT, source_method TEXT, text_kv_key TEXT, segments_kv_key TEXT, char_count INTEGER, chunk_count INTEGER, status TEXT, error TEXT, created_at TEXT, updated_at TEXT)'); const q=String(args.query||'').toLowerCase(); const rows=await dbAll(env.DB,'SELECT * FROM youtube_transcripts_resilient ORDER BY created_at DESC LIMIT 200'); const hits=[]; for(const row of rows){if(args.video_id&&row.video_id!==args.video_id)continue; const text=await kvGet(env.KV,row.text_kv_key); const s=String(text||''); const i=s.toLowerCase().indexOf(q); if(i>=0){hits.push({transcript_id:row.id,video_id:row.video_id,title:row.title,source_method:row.source_method,snippet:s.slice(Math.max(0,i-200),Math.min(s.length,i+500))}); if(hits.length>=Math.min(args.top_k||8,25))break}} return{ok:true,query:args.query,count:hits.length,hits};
  }

  if (name === "summarize_youtube_transcript_resilient") {
    const { transcript_id } = args;
    if (!transcript_id) throw new Error("summarize_youtube_transcript_resilient: transcript_id required");
    const row=await dbFirst(env.DB,'SELECT * FROM youtube_transcripts_resilient WHERE id=?',[args.transcript_id]); if(!row)return{ok:false,error:'Transcript not found'}; const text=String(await kvGet(env.KV,row.text_kv_key)||''); const sample=text.slice(0,Math.min(args.max_chars||5000,12000)); if(env.AI){try{const r=await env.AI.run('@cf/meta/llama-3.1-8b-instruct',{messages:[{role:'system',content:'Summarize this transcript into concise bullets and key takeaways.'},{role:'user',content:sample}]}); return{ok:true,transcript_id:row.id,title:row.title,summary:r.response||r.text||String(r)}}catch(e){}} return{ok:true,transcript_id:row.id,title:row.title,summary:sample.slice(0,1200)+(text.length>1200?'...':'')};
  }

  throw new Error("Unknown tool: "+name);}
export default{async fetch(request,env,ctx){if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});const url=new URL(request.url);if(url.pathname==="/health")return Response.json({status:"ok",worker:WORKER_NAME,version:VERSION},{headers:CORS});if(request.method!=="POST")return new Response("not found",{status:404,headers:CORS});let body;try{body=await request.json();}catch{return errResp(null,-32700,"Parse error");}const{id,method,params}=body;if(method==="initialize")return rpc(id,{protocolVersion:"2024-11-05",capabilities:{tools:{}},serverInfo:{name:WORKER_NAME,version:VERSION}});if(method==="notifications/initialized")return new Response(null,{status:204,headers:CORS});if(method==="ping")return rpc(id,{});if(method==="tools/list")return rpc(id,{tools:TOOLS});if(method==="tools/call"){try{return tool(id,await handle(params?.name,params?.arguments||{},env,ctx));}catch(e){return errResp(id,-32603,"Tool error: "+e.message);}}return errResp(id,-32601,"Method not found: "+method);}};