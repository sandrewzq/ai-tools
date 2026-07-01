import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registryPath = path.join(root, "src/app/tool-registry.ts");
const registry = await fs.readFile(registryPath, "utf8");

const expectedIds = [
  "speed-test",
  "color-palette",
  "prompt-templates",
  "text-chunker",
  "text-differ",
  "token-calculator",
  "json-formatter",
  "regex-tester",
  "encoding-converter",
  "timestamp-converter",
  "curl-converter",
  "qr-generator",
  "uuid-generator",
  "hash-generator",
  "jwt-debugger",
  "cron-parser",
  "color-converter",
  "yaml-formatter",
  "xml-formatter",
  "url-parser",
  "csv-converter",
];

for (const id of expectedIds) {
  assert.ok(registry.includes(`id: "${id}"`), `${id} should be registered`);
  assert.ok(registry.includes(`./../tools/${id}/Tool`), `${id} should lazy-load a React tool`);
}

console.log("registry mapping tests passed");
