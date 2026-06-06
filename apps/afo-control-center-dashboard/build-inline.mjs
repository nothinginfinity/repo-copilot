import { readFile, writeFile } from "node:fs/promises";

const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
const worker = await readFile(new URL("./worker.js", import.meta.url), "utf8");

const marker = "const FALLBACK_HTML = `";
const start = worker.indexOf(marker);

if (start === -1) {
  throw new Error("Could not find FALLBACK_HTML marker in worker.js");
}

const valueStart = start + marker.length;
const valueEnd = worker.indexOf("`;", valueStart);

if (valueEnd === -1) {
  throw new Error("Could not find FALLBACK_HTML template end in worker.js");
}

const escapedHtml = html
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

const output =
  worker.slice(0, valueStart) +
  escapedHtml +
  worker.slice(valueEnd);

await writeFile(new URL("./worker.generated.js", import.meta.url), output, "utf8");

console.log("Generated worker.generated.js with inlined index.html");
