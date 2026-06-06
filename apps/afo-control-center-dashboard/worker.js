const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type,authorization"
};

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: JSON_HEADERS });
}

function html(body, status = 200) {
  return new Response(body, { status, headers: HTML_HEADERS });
}

function statusPayload(env) {
  return {
    worker: "afo-control-center-dashboard",
    version: "0.1.0-github-first-ui",
    status: "ok",
    ui_enabled: true,
    upstream_browser_url: env.AFO_BROWSER_URL || "https://browser.agentfeedoptimization.com",
    routes: [
      "/",
      "/api/status",
      "/api/workers",
      "/api/mcp-apps",
      "/api/tools",
      "/api/d1",
      "/api/endpoints",
      "/api/queue",
      "/api/audits",
      "/api/repairs",
      "/api/export"
    ]
  };
}

async function fetchUpstream(path, env, request) {
  const base = (env.AFO_BROWSER_URL || "https://browser.agentfeedoptimization.com").replace(/\/$/, "");
  const inputUrl = new URL(request.url);
  const target = base + path + inputUrl.search;
  const upstream = await fetch(target, { headers: { accept: "application/json" } });
  return new Response(await upstream.text(), { status: upstream.status, headers: JSON_HEADERS });
}

async function api(pathname, env, request) {
  if (pathname === "/api/status") return json(statusPayload(env));
  if (pathname === "/api/workers") return fetchUpstream("/api/workers", env, request);
  if (pathname === "/api/mcp-apps") return fetchUpstream("/api/mcp-apps", env, request);
  if (pathname === "/api/tools") return fetchUpstream("/api/tools", env, request);
  if (pathname === "/api/d1") return fetchUpstream("/api/d1", env, request);
  if (pathname === "/api/endpoints") return fetchUpstream("/api/endpoints", env, request);
  if (pathname === "/api/export") return fetchUpstream("/api/export", env, request);

  if (pathname === "/api/queue") return json({ status: "placeholder", count: 0, jobs: [] });
  if (pathname === "/api/audits") return json({ status: "placeholder", count: 0, audits: [] });
  if (pathname === "/api/repairs") return json({ status: "placeholder", count: 0, repairs: [] });

  return json({ error: "not_found", path: pathname }, 404);
}

const FALLBACK_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AFO Control Center</title>
<style>
body{margin:0;background:#070913;color:#f7f9ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.5;padding:32px}
main{max-width:880px;margin:auto;padding:32px;border:1px solid rgba(255,255,255,.14);border-radius:24px;background:rgba(255,255,255,.07)}
a{color:#72a7ff}code{background:rgba(255,255,255,.1);padding:2px 6px;border-radius:7px}
</style>
</head>
<body>
<main>
<h1>AFO Control Center</h1>
<p>The deployable Worker shell is live. The polished standalone dashboard is committed as <code>index.html</code>.</p>
<p>Next deployment step: inline <code>index.html</code> into this Worker or attach it as a static asset.</p>
<p><a href="/api/status">View JSON status</a></p>
</main>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }

    if (url.searchParams.get("format") === "json") return json(statusPayload(env));
    if (url.pathname.startsWith("/api/")) return api(url.pathname, env, request);
    if (url.pathname === "/health" || url.pathname === "/status") return json(statusPayload(env));

    return html(FALLBACK_HTML);
  }
};
