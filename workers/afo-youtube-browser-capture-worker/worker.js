import puppeteer from "@cloudflare/puppeteer";

const VERSION = "0.1.0";
const WORKER_NAME = "afo-youtube-browser-capture-worker";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};

function json(data, status = 200) {
  return Response.json(data, { status, headers: CORS });
}

function videoId(input) {
  try {
    const u = new URL(input);
    if (u.hostname.includes("youtu.be")) return u.pathname.split("/").filter(Boolean)[0] || null;
    if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/").filter(Boolean)[1] || null;
    return u.searchParams.get("v");
  } catch {
    const m = String(input).match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : null;
  }
}

function parseJson3(j) {
  const segments = [];
  const parts = [];
  for (const ev of j.events || []) {
    if (!ev.segs) continue;
    const text = ev.segs.map(s => s.utf8 || "").join("").replace(/\s+/g, " ").trim();
    if (!text) continue;
    segments.push({ start_ms: ev.tStartMs || 0, dur_ms: ev.dDurationMs || 0, text });
    parts.push(text);
  }
  return { text: parts.join(" ").replace(/\s+/g, " ").trim(), segments };
}

function parseVtt(v) {
  const segments = [];
  const parts = [];
  for (const block of String(v).split(/\n\s*\n/)) {
    if (!block.includes("-->")) continue;
    const lines = block.split(/\r?\n/).filter(Boolean);
    const i = lines.findIndex(line => line.includes("-->"));
    const text = lines.slice(i + 1).join(" ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!text) continue;
    segments.push({ text });
    parts.push(text);
  }
  return { text: parts.join(" ").replace(/\s+/g, " ").trim(), segments };
}

function parseXml(x) {
  const text = String(x)
    .replace(/<text[^>]*>/g, "\n")
    .replace(/<\/text>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return { text, segments: text ? [{ text }] : [] };
}

async function timedTextFromTrack(baseUrl) {
  const formats = ["json3", "vtt", "srv3", "ttml"];
  for (const fmt of formats) {
    try {
      const u = new URL(baseUrl);
      u.searchParams.set("fmt", fmt);
      const r = await fetch(u.toString());
      if (!r.ok) continue;
      if (fmt === "json3") {
        const parsed = parseJson3(await r.json());
        if (parsed.text) return { ...parsed, method: "browser_json3" };
      } else if (fmt === "vtt") {
        const parsed = parseVtt(await r.text());
        if (parsed.text) return { ...parsed, method: "browser_vtt" };
      } else {
        const parsed = parseXml(await r.text());
        if (parsed.text) return { ...parsed, method: `browser_${fmt}` };
      }
    } catch {}
  }
  return null;
}

async function captureWithBrowser(env, args) {
  const id = videoId(args.url);
  if (!id) return { ok: false, error: "Could not extract video_id" };

  const language = args.language || "en";
  const watchUrl = `https://www.youtube.com/watch?v=${id}`;
  let browser;

  try {
    browser = await puppeteer.launch(env.BROWSER);
    const page = await browser.newPage();
    await page.setViewport({ width: 1365, height: 900 });
    await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122 Safari/537.36");
    await page.goto(watchUrl, { waitUntil: "networkidle2", timeout: 45000 });
    await page.waitForTimeout(3500);

    const data = await page.evaluate(() => {
      const player = window.ytInitialPlayerResponse || null;
      const details = player && player.videoDetails ? player.videoDetails : {};
      const tracks = (((player || {}).captions || {}).playerCaptionsTracklistRenderer || {}).captionTracks || [];
      return {
        title: details.title || document.title || null,
        tracks: tracks.map(t => ({ baseUrl: t.baseUrl, languageCode: t.languageCode, kind: t.kind || null, name: t.name && (t.name.simpleText || (t.name.runs || []).map(r => r.text).join("")) }))
      };
    });

    const selected = data.tracks.find(t => t.languageCode === language)
      || data.tracks.find(t => String(t.languageCode || "").startsWith(String(language).split("-")[0]))
      || data.tracks.find(t => t.kind === "asr")
      || data.tracks[0];

    if (selected && selected.baseUrl) {
      const parsed = await timedTextFromTrack(selected.baseUrl);
      if (parsed && parsed.text) {
        return { ok: true, video_id: id, url: watchUrl, title: data.title, language, source_method: parsed.method, text: parsed.text, segments: parsed.segments, char_count: parsed.text.length };
      }
    }

    return { ok: false, video_id: id, title: data.title, error: "Browser opened page but no usable caption text was found", track_count: data.tracks.length };
  } catch (error) {
    return { ok: false, video_id: id, error: String(error.message || error) };
  } finally {
    try { if (browser) await browser.close(); } catch {}
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, worker: WORKER_NAME, version: VERSION, browser_binding: Boolean(env.BROWSER) });
    if (request.method !== "POST") return json({ ok: false, error: "POST required" }, 405);
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: "Invalid JSON" }, 400); }
    if (url.pathname === "/capture") return json(await captureWithBrowser(env, body || {}));
    return json({ ok: false, error: "Unknown path" }, 404);
  }
};
