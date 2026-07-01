import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");

async function importModule(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

async function testYamlFormatter() {
  const { formatYaml, yamlToJson, jsonToYaml } = await importModule("src/tools/yaml-formatter/logic.ts");
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
  const { formatXml, compactXml, xmlToJson } = await importModule("src/tools/xml-formatter/logic.ts");
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
  const { parseUrl, buildUrl } = await importModule("src/tools/url-parser/logic.ts");
  const parsed = parseUrl("https://user:secret@example.com:8443/path/to?a=1&a=2&empty=#top");
  assert.equal(parsed.error, null);
  assert.equal(parsed.parts.hostname, "example.com");
  assert.equal(parsed.query.length, 3);
  assert.deepEqual(parsed.queryJson.a, ["1", "2"]);
  assert.equal(parsed.parts.password, "•••••");

  const rebuilt = buildUrl(parsed.query);
  assert.match(rebuilt, /a=1&a=2&empty=/);
}

async function testCsvConverter() {
  const { parseCsv, csvToJson } = await importModule("src/tools/csv-converter/logic.ts");
  const input = 'name,role,note\nAlice,dev,"hello, world"\nBob,ops,"line"';
  const parsed = parseCsv(input, { delimiter: "auto", hasHeader: true });
  assert.equal(parsed.error, null);
  assert.equal(parsed.rows[0].note, "hello, world");
  assert.equal(parsed.headers[1], "role");

  const json = csvToJson(input, { delimiter: "auto", hasHeader: true });
  assert.equal(json.error, null);
  assert.equal(JSON.parse(json.output)[1].name, "Bob");
}

async function testGeneratedToolLogic() {
  const { generateBatch } = await importModule("src/tools/uuid-generator/logic.ts");
  const { convertColor } = await importModule("src/tools/color-converter/logic.ts");
  const { parseCron } = await importModule("src/tools/cron-parser/logic.ts");

  assert.equal(generateBatch(2, "v4", false, false).length, 2);
  assert.equal(convertColor("#ffffff").hex, "#FFFFFF");
  assert.equal(parseCron("*/5 * * * *").error, null);
}

async function testQrGeneratorUsesRealEncoder() {
  const source = await fs.readFile(path.join(root, "src/tools/qr-generator/logic.ts"), "utf8");
  assert.ok(source.includes("Reed-Solomon ECC"), "QR generator should keep the original ECC encoder");
  assert.ok(!source.includes("seededCell"), "QR generator should not use the temporary seeded matrix fallback");

  const { generateQR } = await importModule("src/tools/qr-generator/logic.ts");
  const result = generateQR("https://example.com");
  assert.equal(result.error, null);
  assert.equal(result.size, result.version * 4 + 17);
  assert.equal(result.matrix.length, result.size);
}

async function testSpeedBenchmarkKeepsMultiTargetSummary() {
  const source = await fs.readFile(path.join(root, "src/tools/speed-test/logic.ts"), "utf8");
  const providers = await fs.readFile(path.join(root, "src/tools/speed-test/providers.ts"), "utf8");
  assert.ok(source.includes("targets: SpeedTarget[]"), "Speed test should keep multi-target config");
  assert.ok(source.includes("warmupRounds"), "Speed test should keep warmup rounds");
  assert.ok(providers.includes("stream: true"), "Speed providers should keep streaming requests for TTFT");
  assert.ok(providers.includes("readSseStream"), "Speed providers should parse SSE streams");

  const { buildSummary, createTarget, defaultEndpointFor } = await importModule("src/tools/speed-test/logic.ts");
  assert.equal(defaultEndpointFor("anthropic"), "/messages");
  assert.equal(defaultEndpointFor("ollama"), "/api/generate");
  assert.equal(createTarget("openai").enabled, true);
  const summary = buildSummary([
    {
      targetName: "A",
      kind: "openai",
      round: 1,
      warmup: false,
      status: "ok",
      ttftMs: 100,
      totalLatencyMs: 500,
      outputDurationMs: 400,
      promptTokens: 10,
      completionTokens: 20,
      tokensPerSecond: 50,
      providerTokensPerSecond: null,
      tokenSource: "api",
      note: "",
    },
  ]);
  assert.equal(summary[0].targetName, "A");
  assert.equal(summary[0].okCount, 1);
  assert.equal(summary[0].avgTokensPerSecond, 50);
}

async function run() {
  await fs.access(path.join(root, "src/tools/yaml-formatter/logic.ts"));
  await testYamlFormatter();
  await testXmlFormatter();
  await testUrlParser();
  await testCsvConverter();
  await testGeneratedToolLogic();
  await testQrGeneratorUsesRealEncoder();
  await testSpeedBenchmarkKeepsMultiTargetSummary();
  console.log("tools-data tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
