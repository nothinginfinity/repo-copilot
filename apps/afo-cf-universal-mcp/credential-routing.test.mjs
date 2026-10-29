import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { test } from "node:test";
const source = readFileSync(new URL("./worker.js", import.meta.url), "utf8");
const calls = [];
const context = { Response, URLSearchParams, fetch: async (url, options) => {
  calls.push(options.headers.Authorization);
  return new Response(JSON.stringify({ success: true, result: [] }));
} };
runInNewContext(source.replace("export default {", "globalThis.worker = {"), context);
const bindings = { CF_ACCOUNT_ID: "a", CF_API_TOKEN: "general",
  "FLRS-Email-Routing": "read", "FLRS-Email-Routing-Zone-Edit": "edit" };
async function invoke(method, path, env = bindings) {
  calls.length = 0;
  const request = new Request("https://example.test", { method:"POST",
    body:JSON.stringify({id:1,method:"tools/call",params:{name:"call_endpoint",arguments:{method,path}}}) });
  const result = await context.worker.fetch(request, env);
  return result.json();
}
test("GET routing rules selects read credential", async () => {
  await invoke("GET", "/zones/0c29fb4ead378390a43818a4b0a80857/email/routing/rules");
  assert.deepEqual(calls, ["Bearer read"]);
});
test("POST routing rules selects edit credential", async () => {
  await invoke("POST", "/zones/0c29fb4ead378390a43818a4b0a80857/email/routing/rules");
  assert.deepEqual(calls, ["Bearer edit"]);
});
test("unrelated endpoints retain existing credential", async () => {
  await invoke("GET", "/zones/z/dns_records");
  assert.deepEqual(calls, ["Bearer general"]);
});
test("missing routing secret fails closed", async () => {
  const result = await invoke("GET", "/zones/0c29fb4ead378390a43818a4b0a80857/email/routing/rules",
    {CF_ACCOUNT_ID:"a", CF_API_TOKEN:"general"});
  assert.equal(calls.length, 0);
  assert.match(result.error.message, /credential binding unavailable/);
});

test("other zone Email Routing retains existing credential", async () => {
  await invoke("GET", "/zones/otherzone/email/routing/rules");
  assert.deepEqual(calls, ["Bearer general"]);
});
