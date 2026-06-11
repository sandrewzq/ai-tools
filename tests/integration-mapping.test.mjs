import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const html = await fs.readFile(path.join(root, "index.html"), "utf8");
const router = await fs.readFile(path.join(root, "src/core/router.js"), "utf8");
const domCache = await fs.readFile(path.join(root, "src/shared/dom-cache.js"), "utf8");

const tools = [
  ["yaml-formatter", "yamlFormatterView", "yamlFormatter", "src/tools/yaml-formatter/index.js"],
  ["xml-formatter", "xmlFormatterView", "xmlFormatter", "src/tools/xml-formatter/index.js"],
  ["url-parser", "urlParserView", "urlParser", "src/tools/url-parser/index.js"],
  ["csv-converter", "csvConverterView", "csvConverter", "src/tools/csv-converter/index.js"],
];

for (const [id, view, namespace, modulePath] of tools) {
  assert.ok(html.includes(`data-view-link="${id}"`), `${id} should have a navigation or card link`);
  assert.ok(html.includes(`id="${view}"`), `${id} should have a view container`);
  assert.ok(router.includes(`"${id}": () => import`), `${id} should have a dynamic importer`);
  assert.ok(router.includes(`"${id}": "${view}"`), `${id} should have a viewMap entry`);
  assert.ok(domCache.includes(`export const ${namespace}`), `${id} should have a DOM cache namespace`);
  await import(pathToFileURL(path.join(root, modulePath)).href);
}

console.log("integration mapping tests passed");
