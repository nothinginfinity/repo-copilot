const VERSION = "0.1.1";
const WORKER_NAME = "afo-transcript-capture-mcp";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,Mcp-Session-Id"
};

const TOOLS = [
  {
    name: "afo-transcript-capture_status",
    description: "Health check. Returns version, binding status, and tool list.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "probe_transcript_url",
    description: "Probe a YouTube URL for available public caption tracks without storing anything.",
    inputSchema: {
      type: "object",
      required: ["url"],
      properties: {
        url: { type: "string" },
        language: { type: "string", default: "en" }
      }
    }
  },
  {
    name: "capture_transcript",
    description: "Fetch a public YouTube caption track, normalize transcript text, store it in D1/KV, embed chunks with Workers AI, and upsert into Vectorize. Does not download audio or video.",
    inputSchema: {
      type: "object",
      required: ["url"],
      properties: {
        url: { type: "string" },
        language: { type: "string", default: "en" },
        title: { type: "string" },
        source_note: { type: "string" },
        force: { type: "boolean", default: false }
      }
    }
  },
  {
    name: "get_transcript",
    description: "Get a stored transcript by transcript_id. Can return text, segments, or metadata only.",
    inputSchema: {
      type: "object",
      required: ["transcript_id"],
      properties: {
        transcript_id: { type: "string" },
        include_text: { type: "boolean", default: true },
        include_segments: { type: "boolean", default: false }
      }
    }
  },
  {
    name: "list_transcripts",
    description: "List stored transcript records.",
    inputSchema: {
      type: "object",
      required: [],
      properties: {
        limit: { type: "number", default: 20 },
        video_id: { type: "string" },
        language: { type: "string" }
      }
    }
  },
  {
    name: "search_transcripts",
    description: "Semantic search across transcript chunks stored in Vectorize.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string" },
        top_k: { type: "number", default: 8 },
        video_id: { type: "string" }
      }
    }
  },
  {
    name: "summarize_transcript",
    description: "Return a simple extractive summary and key sections from stored transcript text.",
    inputSchema: {
      type: "object",
      required: ["transcript_id"],
      properties: {
        transcript_id: { type: "string" },
        max_chars: { type: "number", default: 4000 }
      }
    }
  }
];

function rpc(id, result) {
  return Response.json({ jsonrpc: "2.0", id, result }, { headers: CORS });
}

function errResp(id, code, message) {
  return Response.json({ jsonrpc: "2.0", id, error: { code, message } }, { headers: CORS });
}

function toolResp(id, payload) {
  return rpc(id, { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] });
}

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

async function dbRun(db, sql, params = []) {
  const stmt = db.prepare(sql);
  return params.length ? stmt.bind(...params).run() : stmt.run();
}

async function dbAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const result = params.length ? await stmt.bind(...params).all() : await stmt.all();
  return result.results || [];
}

async function kvSet(kv, key, value, options = {}) {
  await kv.put(key, typeof value === "string" ? value : JSON.stringify(value), options);
}

async function kvGet(kv, key) {
  const value = await kv.get(key);
  if (value === null) return null;
  try { return JSON.parse(value); } catch { return value; }
}

async function ensureSchema(db) {
  await dbRun(db, `CREATE TABLE IF NOT EXISTS mcp_sessions (
    session_id TEXT PRIMARY KEY,
    worker_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    parent_id TEXT,
    metadata TEXT,
    started_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    finished_at TEXT
  )`);
  await dbRun(db, `CREATE TABLE IF NOT EXISTS action_execution_logs (
    log_id TEXT PRIMARY KEY,
    session_id TEXT,
    worker_name TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    status TEXT NOT NULL,
    input_json TEXT,
    output_summary TEXT,
    payload_uri TEXT,
    error_message TEXT,
    duration_ms INTEGER,
    input_tokens INTEGER,
    output_tokens INTEGER,
    vector_id TEXT,
    created_at TEXT NOT NULL
  )`);
  await dbRun(db, `CREATE TABLE IF NOT EXISTS schema_migrations (
    migration_id TEXT PRIMARY KEY,
    worker_name TEXT NOT NULL,
    description TEXT,
    applied_at TEXT NOT NULL,
    checksum TEXT
  )`);
  await dbRun(db, `CREATE TABLE IF NOT EXISTS transcripts (
    transcript_id TEXT PRIMARY KEY,
    url TEXT,
    video_id TEXT,
    title TEXT,
    language TEXT,
    source_note TEXT,
    transcript_text TEXT,
    segments_json TEXT,
    chunk_count INTEGER,
    status TEXT,
    created_at TEXT,
    updated_at TEXT
  )`);
}

function decodeText(value) {
  return (value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function unescapeYouTube(value) {
  return (value || "")
    .replace(/\\u0026/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/\\\//g, "/");
}

function getYouTubeVideoId(inputUrl) {
  try {
    const parsed = new URL(inputUrl);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1).split("/")[0];
    if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
    const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?#]+)/);
    if (shortsMatch) return shortsMatch[1];
  } catch {}
  return null;
}

async function fetchYouTubeWatchPage(videoId) {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  return response.text();
}

function parseCaptionTracks(html) {
  const match = html.match(/"captionTracks":(\[.*?\])\s*,\s*"audioTracks"/);
  if (!match) return [];
  return JSON.parse(unescapeYouTube(match[1]));
}

function parsePageTitle(html) {
  const match = html.match(/<title>(.*?)<\/title>/i);
  return match ? decodeText(match[1]).replace(/ - YouTube$/, "") : "";
}

function chooseTrack(tracks, preferredLanguage) {
  const lang = preferredLanguage || "en";
  return tracks.find((track) => track.languageCode === lang)
    || tracks.find((track) => (track.languageCode || "").startsWith(lang.split("-")[0]))
    || tracks[0];
}

function parseTranscriptXml(xml) {
  return [...xml.matchAll(/<text[^>]*start="([^"]+)"[^>]*(?:dur="([^"]+)")?[^>]*>([\s\S]*?)<\/text>/g)]
    .map((match) => ({
      start: Number(match[1]),
      dur: Number(match[2] || 0),
      text: decodeText(match[3])
    }))
    .filter((segment) => segment.text);
}

function chunkText(text, step = 1200, size = 1500) {
  const chunks = [];
  for (let index = 0; index < text.length; index += step) {
    chunks.push(text.slice(index, index + size));
    if (index + size >= text.length) break;
  }
  return chunks;
}

async function embedText(ai, text) {
  if (!ai) return null;
  const result = await ai.run("@cf/baai/bge-base-en-v1.5", { text: [text.slice(0, 512)] });
  return result.data && result.data[0] ? result.data[0] : null;
}

async function probeTranscriptUrl(args) {
  const inputUrl = args.url;
  if (!inputUrl) throw new Error("url required");
  const videoId = getYouTubeVideoId(inputUrl);
  if (!videoId) throw new Error("Could not parse YouTube video id");

  const html = await fetchYouTubeWatchPage(videoId);
  const tracks = parseCaptionTracks(html);

  return {
    ok: true,
    video_id: videoId,
    has_transcript: tracks.length > 0,
    tracks: tracks.map((track) => ({
      languageCode: track.languageCode,
      name: track.name && track.name.simpleText,
      kind: track.kind || "manual",
      isTranslatable: !!track.isTranslatable
    })),
    note: tracks.length ? undefined : "No public captionTracks found"
  };
}

async function captureTranscript(args, env) {
  const inputUrl = args.url;
  if (!inputUrl) throw new Error("url required");
  await ensureSchema(env.DB);

  const videoId = getYouTubeVideoId(inputUrl);
  if (!videoId) throw new Error("Could not parse YouTube video id");

  const cacheKey = `transcript:url:${inputUrl}`;
  if (!args.force) {
    const cached = await kvGet(env.KV, cacheKey);
    if (cached) return { ok: true, cached: true, ...cached };
  }

  const html = await fetchYouTubeWatchPage(videoId);
  const tracks = parseCaptionTracks(html);
  if (!tracks.length) throw new Error("No public captionTracks found");

  const track = chooseTrack(tracks, args.language || "en");
  if (!track) throw new Error("No caption track available");

  const captionUrl = unescapeYouTube(track.baseUrl);
  const xml = await (await fetch(captionUrl)).text();
  const segments = parseTranscriptXml(xml);
  const transcriptText = segments.map((segment) => segment.text).join(" ").replace(/\s+/g, " ").trim();
  const title = args.title || parsePageTitle(html);
  const transcriptId = genId("tx");
  const timestamp = nowIso();
  const chunks = chunkText(transcriptText);

  await dbRun(env.DB, "INSERT INTO transcripts VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [
    transcriptId,
    inputUrl,
    videoId,
    title,
    track.languageCode || args.language || "en",
    args.source_note || "",
    transcriptText,
    JSON.stringify(segments),
    chunks.length,
    "complete",
    timestamp,
    timestamp
  ]);

  for (let index = 0; index < chunks.length; index++) {
    const vector = await embedText(env.AI, `${title} ${chunks[index]}`);
    if (vector) {
      await env.VECTORIZE.upsert([{
        id: `tx_${transcriptId}_${index}`,
        values: vector,
        metadata: {
          transcript_id: transcriptId,
          url: inputUrl,
          video_id: videoId,
          title,
          language: track.languageCode || args.language || "en",
          chunk: index,
          text: chunks[index].slice(0, 900),
          source_type: "transcript"
        }
      }]);
    }
  }

  const output = {
    transcript_id: transcriptId,
    url: inputUrl,
    video_id: videoId,
    title,
    language: track.languageCode || args.language || "en",
    segments: segments.length,
    characters: transcriptText.length,
    chunk_count: chunks.length,
    status: "complete"
  };
  await kvSet(env.KV, cacheKey, output);
  return { ok: true, ...output };
}

async function getTranscript(args, env) {
  const transcriptId = args.transcript_id;
  if (!transcriptId) throw new Error("transcript_id required");
  await ensureSchema(env.DB);
  const rows = await dbAll(env.DB, "SELECT * FROM transcripts WHERE transcript_id=? LIMIT 1", [transcriptId]);
  const record = rows[0];
  if (!record) return { ok: true, found: false };

  const output = {
    ok: true,
    found: true,
    transcript_id: record.transcript_id,
    url: record.url,
    video_id: record.video_id,
    title: record.title,
    language: record.language,
    source_note: record.source_note,
    chunk_count: record.chunk_count,
    status: record.status,
    created_at: record.created_at,
    updated_at: record.updated_at
  };
  if (args.include_text !== false) output.transcript_text = record.transcript_text;
  if (args.include_segments) output.segments = JSON.parse(record.segments_json || "[]");
  return output;
}

async function listTranscripts(args, env) {
  await ensureSchema(env.DB);
  let sql = "SELECT transcript_id,url,video_id,title,language,chunk_count,status,created_at,updated_at FROM transcripts";
  const params = [];
  const where = [];
  if (args.video_id) { where.push("video_id=?"); params.push(args.video_id); }
  if (args.language) { where.push("language=?"); params.push(args.language); }
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
  sql += " ORDER BY created_at DESC LIMIT ?";
  params.push(args.limit || 20);
  const rows = await dbAll(env.DB, sql, params);
  return { ok: true, count: rows.length, transcripts: rows };
}

async function searchTranscripts(args, env) {
  const searchQuery = args.query;
  if (!searchQuery) throw new Error("query required");
  const topK = Math.min(args.top_k || 8, 20);
  const vector = await embedText(env.AI, searchQuery);
  if (!vector) throw new Error("Embedding failed");
  const result = await env.VECTORIZE.query(vector, { topK, returnMetadata: true });
  let matches = result.matches || [];
  if (args.video_id) matches = matches.filter((match) => match.metadata && match.metadata.video_id === args.video_id);
  matches = matches.filter((match) => match.metadata && match.metadata.source_type === "transcript");
  return {
    ok: true,
    query: searchQuery,
    count: matches.length,
    results: matches.map((match) => ({
      score: match.score,
      transcript_id: match.metadata && match.metadata.transcript_id,
      video_id: match.metadata && match.metadata.video_id,
      title: match.metadata && match.metadata.title,
      url: match.metadata && match.metadata.url,
      language: match.metadata && match.metadata.language,
      chunk: match.metadata && match.metadata.chunk,
      text: match.metadata && match.metadata.text,
      id: match.id
    }))
  };
}

async function summarizeTranscript(args, env) {
  const transcriptId = args.transcript_id;
  if (!transcriptId) throw new Error("transcript_id required");
  await ensureSchema(env.DB);
  const rows = await dbAll(env.DB, "SELECT * FROM transcripts WHERE transcript_id=? LIMIT 1", [transcriptId]);
  const record = rows[0];
  if (!record) return { ok: true, found: false };
  const text = (record.transcript_text || "").slice(0, args.max_chars || 4000);
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return {
    ok: true,
    found: true,
    transcript_id: record.transcript_id,
    title: record.title,
    video_id: record.video_id,
    language: record.language,
    summary: sentences.slice(0, 8).join(" "),
    key_excerpt: text.slice(0, 1200),
    note: "v0.1.1 uses extractive summary; later versions can add generative Workers AI summarization."
  };
}

async function status(env) {
  const result = {
    status: "ok",
    worker: WORKER_NAME,
    version: VERSION,
    generated_at: nowIso(),
    bindings: {},
    tools: TOOLS.map((tool) => tool.name)
  };
  try { await ensureSchema(env.DB); result.bindings.DB = true; } catch { result.bindings.DB = false; }
  try { await env.KV.put("_ping", "1", { expirationTtl: 60 }); result.bindings.KV = true; } catch { result.bindings.KV = false; }
  result.bindings.VECTORIZE = !!env.VECTORIZE;
  result.bindings.AI = !!env.AI;
  return result;
}

async function handle(toolName, args, env) {
  if (toolName === "afo-transcript-capture_status" || toolName === "afo_transcript_capture_status") return status(env);
  if (toolName === "probe_transcript_url") return probeTranscriptUrl(args || {});
  if (toolName === "capture_transcript") return captureTranscript(args || {}, env);
  if (toolName === "get_transcript") return getTranscript(args || {}, env);
  if (toolName === "list_transcripts") return listTranscripts(args || {}, env);
  if (toolName === "search_transcripts") return searchTranscripts(args || {}, env);
  if (toolName === "summarize_transcript") return summarizeTranscript(args || {}, env);
  throw new Error(`Unknown tool: ${toolName}`);
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const requestUrl = new URL(request.url);
    if (requestUrl.pathname === "/health") {
      return Response.json({ status: "ok", worker: WORKER_NAME, version: VERSION }, { headers: CORS });
    }
    if (request.method !== "POST") return new Response("not found", { status: 404, headers: CORS });

    let body;
    try { body = await request.json(); } catch { return errResp(null, -32700, "Parse error"); }
    const { id, method, params } = body;

    if (method === "initialize") {
      return rpc(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: WORKER_NAME, version: VERSION }
      });
    }
    if (method === "notifications/initialized") return new Response(null, { status: 204, headers: CORS });
    if (method === "ping") return rpc(id, {});
    if (method === "tools/list") return rpc(id, { tools: TOOLS });
    if (method === "tools/call") {
      try {
        const result = await handle(params && params.name, (params && params.arguments) || {}, env);
        return toolResp(id, result);
      } catch (error) {
        return errResp(id, -32603, `Tool error: ${error.message}`);
      }
    }
    return errResp(id, -32601, `Method not found: ${method}`);
  }
};
