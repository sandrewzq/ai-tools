import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");

async function importModule(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

async function testYamlFormatter() {
  const { formatYaml, yamlToJson, jsonToYaml } = await importModule("src/tools/yaml-formatter/data.js");
  const input = "name: demo\nactive: true\nitems:\n  - api\n  - web\ncount: 2";
  const formatted = formatYaml(input);
  assert.equal(formatted.error, null);
  assert.match(formatted.output, /items:\n  - api\n  - web/);

  const json = yamlToJson(input);
  assert.equal(json.error, null);
  assert.equal(JSON.parse(json.output).items[1], "web");

  const yaml = jsonToYaml('{"name":"demo","tags":["ai","tool"],"nested":{"ok":true}}');
  assert.equal(yaml.error, null);
  assert.match(yaml.output, /nested:\n  ok: true/);
}

async function testXmlFormatter() {
  const { formatXml, compactXml, xmlToJson } = await importModule("src/tools/xml-formatter/data.js");
  const input = '<root><item id="1">A</item><item id="2">B</item></root>';
  const formatted = formatXml(input);
  assert.equal(formatted.error, null);
  assert.match(formatted.output, /\n  <item id="1">A<\/item>/);

  const compacted = compactXml(formatted.output);
  assert.equal(compacted.output, input);

  const json = xmlToJson(input);
  assert.equal(json.error, null);
  assert.equal(JSON.parse(json.output).name, "root");
}

async function testUrlParser() {
  const { parseUrl, buildUrl } = await importModule("src/tools/url-parser/data.js");
  const parsed = parseUrl("https://user:secret@example.com:8443/path/to?a=1&a=2&empty=#top");
  assert.equal(parsed.error, null);
  assert.equal(parsed.parts.hostname, "example.com");
  assert.equal(parsed.query.length, 3);
  assert.deepEqual(parsed.queryJson.a, ["1", "2"]);
  assert.equal(parsed.parts.password, "••••••");

  const rebuilt = buildUrl(parsed.query);
  assert.match(rebuilt, /a=1&a=2&empty=/);
}

async function testCsvConverter() {
  const { parseCsv, csvToJson } = await importModule("src/tools/csv-converter/data.js");
  const input = 'name,role,note\nAlice,dev,"hello, world"\nBob,ops,"line"';
  const parsed = parseCsv(input, { delimiter: "auto", hasHeader: true });
  assert.equal(parsed.error, null);
  assert.equal(parsed.rows[0].note, "hello, world");
  assert.equal(parsed.headers[1], "role");

  const json = csvToJson(input, { delimiter: "auto", hasHeader: true });
  assert.equal(json.error, null);
  assert.equal(JSON.parse(json.output)[1].name, "Bob");
}

async function run() {
  await fs.access(path.join(root, "src/tools/yaml-formatter/data.js"));
  await testYamlFormatter();
  await testXmlFormatter();
  await testUrlParser();
  await testCsvConverter();
  console.log("tools-data tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
