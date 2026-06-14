const VERSION="0.3.0";
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
  "description": "Probe a YouTube URL for video id, metadata, and visible public caption/timedtext hints without storing anything.",
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
  "description": "Attempt to capture transcript from public YouTube caption tracks/timedtext and store transcript text plus segments in D1/KV.",
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
  "description": "Store a transcript extracted by a browser/session worker when server-side public captionTracks are hidden. Accepts plain text, JSON3, VTT, or segment JSON.",
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
  "name": "create_audio_transcription_job",
  "description": "Create a transcript job for an external worker to transcribe user-authorized audio and callback with transcript text. This tool does not download YouTube audio.",
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
      },
      "callback_hint": {
        "type": "string"
      }
    }
  }
},
{
  "name": "submit_transcription_result",
  "description": "Accept a completed transcript result from an external transcription worker and store/index it.",
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
      "url": {
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
      "language": {
        "type": "string",
        "default": "en"
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
  "name": "import_transcript_text",
  "description": "Manually import known transcript text for a YouTube video, store it in D1/KV, and index chunks.",
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
  "description": "Search stored transcript records by keyword and/or semantic vector index.",
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
      },
      "mode": {
        "type": "string",
        "enum": [
          "keyword",
          "semantic",
          "hybrid"
        ],
        "default": "hybrid"
      }
    }
  }
},
{
  "name": "summarize_youtube_transcript_resilient",
  "description": "Create an AI or extractive summary of a stored transcript.",
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
async function handle(name,args,env,ctx){
  await ensureSchema(env.DB);
  if (name === "youtube_resilient_status") {
    throw new Error("youtube_resilient_status: handler type undefined not yet implemented");
  }

  if (name === "probe_youtube_sources") {
    const { url } = args;
    if (!url) throw new Error("probe_youtube_sources: url required");
    throw new Error("probe_youtube_sources: handler type undefined not yet implemented");
  }

  if (name === "capture_youtube_transcript_resilient") {
    const { url } = args;
    if (!url) throw new Error("capture_youtube_transcript_resilient: url required");
    throw new Error("capture_youtube_transcript_resilient: handler type undefined not yet implemented");
  }

  if (name === "submit_browser_caption_payload") {
    const { url } = args;
    if (!url) throw new Error("submit_browser_caption_payload: url required");
    throw new Error("submit_browser_caption_payload: handler type undefined not yet implemented");
  }

  if (name === "create_audio_transcription_job") {
    const { url } = args;
    if (!url) throw new Error("create_audio_transcription_job: url required");
    throw new Error("create_audio_transcription_job: handler type undefined not yet implemented");
  }

  if (name === "submit_transcription_result") {
    const { job_id, text } = args;
    if (!job_id) throw new Error("submit_transcription_result: job_id required");
    if (!text) throw new Error("submit_transcription_result: text required");
    throw new Error("submit_transcription_result: handler type undefined not yet implemented");
  }

  if (name === "import_transcript_text") {
    const { url, text } = args;
    if (!url) throw new Error("import_transcript_text: url required");
    if (!text) throw new Error("import_transcript_text: text required");
    throw new Error("import_transcript_text: handler type undefined not yet implemented");
  }

  if (name === "get_youtube_transcript_resilient") {
    const { transcript_id } = args;
    if (!transcript_id) throw new Error("get_youtube_transcript_resilient: transcript_id required");
    throw new Error("get_youtube_transcript_resilient: handler type undefined not yet implemented");
  }

  if (name === "list_youtube_transcripts_resilient") {
    throw new Error("list_youtube_transcripts_resilient: handler type undefined not yet implemented");
  }

  if (name === "search_youtube_transcripts_resilient") {
    const { query } = args;
    if (!query) throw new Error("search_youtube_transcripts_resilient: query required");
    throw new Error("search_youtube_transcripts_resilient: handler type undefined not yet implemented");
  }

  if (name === "summarize_youtube_transcript_resilient") {
    const { transcript_id } = args;
    if (!transcript_id) throw new Error("summarize_youtube_transcript_resilient: transcript_id required");
    throw new Error("summarize_youtube_transcript_resilient: handler type undefined not yet implemented");
  }

  throw new Error("Unknown tool: "+name);}
export default{async fetch(request,env,ctx){if(request.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});const url=new URL(request.url);if(url.pathname==="/health")return Response.json({status:"ok",worker:WORKER_NAME,version:VERSION},{headers:CORS});if(request.method!=="POST")return new Response("not found",{status:404,headers:CORS});let body;try{body=await request.json();}catch{return errResp(null,-32700,"Parse error");}const{id,method,params}=body;if(method==="initialize")return rpc(id,{protocolVersion:"2024-11-05",capabilities:{tools:{}},serverInfo:{name:WORKER_NAME,version:VERSION}});if(method==="notifications/initialized")return new Response(null,{status:204,headers:CORS});if(method==="ping")return rpc(id,{});if(method==="tools/list")return rpc(id,{tools:TOOLS});if(method==="tools/call"){try{return tool(id,await handle(params?.name,params?.arguments||{},env,ctx));}catch(e){return errResp(id,-32603,"Tool error: "+e.message);}}return errResp(id,-32601,"Method not found: "+method);}};