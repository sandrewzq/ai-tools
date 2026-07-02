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

async function testColorPaletteKeepsOriginalFeatures() {
  const source = await fs.readFile(path.join(root, "src/tools/color-palette/Tool.tsx"), "utf8");
  assert.ok(source.includes("palette-mode-tabs"), "Color palette should keep auto/preset mode tabs");
  assert.ok(source.includes("palette-preview"), "Color palette should keep the UI preview panel");
  assert.ok(source.includes("palette-copy-grid"), "Color palette should keep CSS and guide outputs");

  const {
    buildGeneratedPalette,
    buildPaletteCss,
    buildPaletteGuide,
    buildPresetPalette,
    palettePresetConfig,
    paletteStyleConfig,
  } = await importModule("src/tools/color-palette/logic.ts");

  const presets = palettePresetConfig();
  assert.equal(Object.keys(presets).length, 17, "Color palette should keep all original presets");
  assert.equal(presets.sakura.name, "雾白深蓝");

  const generated = buildGeneratedPalette({ h: 217, s: 91, l: 60 }, paletteStyleConfig("tech"));
  assert.deepEqual(generated.map((color) => color.role), ["primary", "secondary", "accent", "background", "surface", "text", "muted"]);

  const preset = buildPresetPalette(presets.sakura);
  const css = buildPaletteCss(preset);
  const guide = buildPaletteGuide(presets.sakura.name, preset, true);
  assert.match(css, /--color-primary: #2563EB/);
  assert.match(guide, /精选方案：雾白深蓝/);
}

async function testPromptTemplatesKeepOriginalLibrary() {
  const source = await fs.readFile(path.join(root, "src/tools/prompt-templates/Tool.tsx"), "utf8");
  assert.ok(source.includes("prompt-card"), "Prompt templates should keep original expandable card UI");
  assert.ok(source.includes("fav-btn"), "Prompt templates should keep favorite controls");
  assert.ok(source.includes("prompt-toast"), "Prompt templates should keep copy feedback toast");

  const { CATEGORIES, TEMPLATES, filterTemplates } = await importModule("src/tools/prompt-templates/logic.ts");
  assert.equal(CATEGORIES.length, 7, "Prompt templates should keep all original categories");
  assert.ok(CATEGORIES.some((category) => category.key === "translate"), "Prompt templates should keep translate category");
  assert.ok(CATEGORIES.some((category) => category.key === "creative"), "Prompt templates should keep creative category");
  assert.equal(TEMPLATES.length, 25, "Prompt templates should keep the full original library");
  assert.ok(TEMPLATES.some((template) => template.id === "w02"), "Prompt templates should keep original writing templates");
  assert.ok(TEMPLATES.some((template) => template.id === "cr04"), "Prompt templates should keep original creative templates");
  assert.equal(filterTemplates("SQL", "coding").length, 1);
}

async function testTimestampConverterKeepsOriginalFeatures() {
  const source = await fs.readFile(path.join(root, "src/tools/timestamp-converter/Tool.tsx"), "utf8");
  assert.ok(source.includes("ts-current"), "Timestamp converter should keep the live current timestamp panel");
  assert.ok(source.includes("ts-grid"), "Timestamp converter should keep original result grid layout");
  assert.ok(source.includes("ts-copy"), "Timestamp converter should keep copy controls");
  assert.ok(source.includes("prompt-toast") || source.includes("ts-toast"), "Timestamp converter should keep copy feedback toast");

  const { dateToTimestamp, getTimezoneOptions, timestampToDate } = await importModule("src/tools/timestamp-converter/logic.ts");
  const options = getTimezoneOptions();
  assert.equal(options.length, 8, "Timestamp converter should keep all original timezone options");
  assert.ok(options.some((option) => option.id === "America/Los_Angeles"), "Timestamp converter should keep Los Angeles timezone");
  assert.ok(options.some((option) => option.id === "Asia/Tokyo"), "Timestamp converter should keep Tokyo timezone");

  const converted = timestampToDate(0, "Asia/Shanghai");
  assert.equal(converted.error, undefined);
  assert.equal(converted.unixSeconds, 0);
  assert.equal(converted.unixMs, 0);
  assert.equal(converted.utc, "1970-01-01T00:00:00.000Z");
  assert.equal(converted.iso, "1970-01-01T00:00:00");
  assert.equal(typeof converted.relative, "string");
  assert.equal(typeof converted.tzLocal, "string");
  assert.equal(typeof converted.tzShort, "string");

  assert.equal(timestampToDate("bad").error, "无效的时间戳");
  assert.equal(dateToTimestamp("bad").error, "无效的日期格式");
}

async function testJsonFormatterKeepsOriginalTreeView() {
  const source = await fs.readFile(path.join(root, "src/tools/json-formatter/Tool.tsx"), "utf8");
  assert.ok(source.includes("json-output"), "JSON formatter should keep syntax highlighted tree output");
  assert.ok(source.includes("json-stats-grid"), "JSON formatter should keep original stats grid");
  assert.ok(source.includes("copyIndent"), "JSON formatter should keep formatted JSON copy action");
  assert.ok(source.includes("empty-state"), "JSON formatter should keep original empty state");

  const { analyzeJson, renderJsonTree, validateJson } = await importModule("src/tools/json-formatter/logic.ts");
  const parsed = validateJson('{"name":"demo","items":[1,true,null]}').parsed;
  const html = renderJsonTree(parsed);
  assert.match(html, /json-line/);
  assert.match(html, /json-toggle/);
  assert.match(html, /json-key/);
  assert.match(html, /json-number/);
  assert.match(html, /json-boolean/);
  assert.match(html, /json-null/);

  const stats = analyzeJson(parsed);
  assert.equal(stats.type, "object");
  assert.equal(stats.keys, 2);
  assert.equal(stats.arrays, 1);
  assert.equal(stats.numbers, 1);
  assert.equal(stats.booleans, 1);
  assert.equal(stats.nulls, 1);
}

async function testCronParserKeepsOriginalNaturalLanguage() {
  const source = await fs.readFile(path.join(root, "src/tools/cron-parser/Tool.tsx"), "utf8");
  assert.ok(source.includes("cron-example-btn"), "Cron parser should keep original example buttons");
  assert.ok(source.includes("cron-summary-card"), "Cron parser should keep original summary card");
  assert.ok(source.includes("cron-fields-grid"), "Cron parser should keep original field grid");
  assert.ok(source.includes("cron-empty"), "Cron parser should keep original empty state");

  const { CRON_EXAMPLES, parseCron } = await importModule("src/tools/cron-parser/logic.ts");
  assert.equal(CRON_EXAMPLES.length, 4);
  assert.equal(parseCron("0 9 * * 1-5").summary, "每周一到周五 09:00 执行一次");
  assert.equal(parseCron("*/15 * * * *").summary, "每 15 分钟执行一次");
  assert.equal(parseCron("0 9 * * 0,6").fields[4].description, "周日、周六");
  assert.equal(parseCron("0 9 * * 7").error, "星期超出范围 0-6");
  assert.equal(parseCron("0 9 * *").error, "当前版本仅支持 5 段 Cron 表达式");
}

async function testCurlConverterKeepsOriginalParsingAndOutputs() {
  const source = await fs.readFile(path.join(root, "src/tools/curl-converter/Tool.tsx"), "utf8");
  assert.ok(source.includes("curl-input-row"), "cURL converter should keep original input row");
  assert.ok(source.includes("curl-summary"), "cURL converter should keep request summary");
  assert.ok(source.includes("curl-output-panel"), "cURL converter should keep separate output panels");
  assert.ok(source.includes("curl-toast"), "cURL converter should keep copy feedback toast");

  const { generateFetch, generateGo, generatePython, parseCurl } = await importModule("src/tools/curl-converter/logic.ts");
  const parsed = parseCurl('curl https://api.example.com/users --data-raw name=Alice -H Authorization:Bearer -u "demo:secret"');
  assert.equal(parsed.error, null);
  assert.equal(parsed.url, "https://api.example.com/users");
  assert.equal(parsed.headers.Authorization, "Bearer");
  assert.equal(parsed.headers["Content-Type"], "application/x-www-form-urlencoded");
  assert.equal(parsed.body, "name=Alice");
  assert.equal(parsed.auth, "demo:secret");
  assert.match(generateFetch(parsed), /body: "name=Alice"/);
  assert.match(generatePython(parsed), /requests\.get\("https:\/\/api\.example\.com\/users", data=data/);
  assert.match(generateGo(parsed), /package main/);
}

async function testTextChunkerKeepsOriginalCardsAndStats() {
  const source = await fs.readFile(path.join(root, "src/tools/text-chunker/Tool.tsx"), "utf8");
  assert.ok(source.includes("text-chunker-config"), "Text chunker should keep persisted configuration");
  assert.ok(source.includes("chunker-config-row"), "Text chunker should keep original config row");
  assert.ok(source.includes("chunk-card"), "Text chunker should keep chunk cards");
  assert.ok(source.includes("chunk-copy-btn"), "Text chunker should keep per-chunk copy");
  assert.ok(source.includes("chunk-stats"), "Text chunker should keep original stats cards");
  assert.ok(source.includes("chunker-toast"), "Text chunker should keep copy feedback toast");

  const { chunkText, estimateTokens } = await importModule("src/tools/text-chunker/logic.ts");
  assert.deepEqual(chunkText("abcdef", "char", 3, 1), ["abc", "cde", "ef"]);
  assert.deepEqual(chunkText("A\n\nB\n\nC", "paragraph", 10, 0), ["A\n\nB\n\nC"]);
  assert.ok(estimateTokens("你好 world") > 0);
}

async function testTokenCalculatorKeepsOriginalModelStats() {
  const source = await fs.readFile(path.join(root, "src/tools/token-calculator/Tool.tsx"), "utf8");
  assert.ok(source.includes("token-stats-grid"), "Token calculator should keep original stats cards");
  assert.ok(source.includes("token-detail-row"), "Token calculator should keep model detail rows");
  assert.ok(source.includes("empty-state"), "Token calculator should keep original empty state");
  assert.ok(source.includes("clearAll"), "Token calculator should keep clear action");

  const { MODELS, estimateTokens, getTextStats } = await importModule("src/tools/token-calculator/logic.ts");
  assert.equal(MODELS.length, 8, "Token calculator should keep original model list");
  assert.ok(MODELS.some((model) => model.id === "gpt-54"), "Token calculator should keep GPT-5.4 option");
  assert.ok(MODELS.some((model) => model.id === "claude-sonnet-46"), "Token calculator should keep Claude Sonnet 4.6 option");
  assert.equal(estimateTokens("你好 world"), 5);
  assert.deepEqual(getTextStats("你好 world"), { chars: 8, chineseChars: 2, englishWords: 1 });
}

async function testRegexTesterKeepsOriginalMatchDetails() {
  const source = await fs.readFile(path.join(root, "src/tools/regex-tester/Tool.tsx"), "utf8");
  assert.ok(source.includes("regex-stats"), "Regex tester should keep match stats");
  assert.ok(source.includes("regex-match-item"), "Regex tester should keep match detail list");
  assert.ok(source.includes("regex-groups"), "Regex tester should keep capture group display");
  assert.ok(source.includes("empty-state"), "Regex tester should keep original empty states");

  const { highlightMatches, testRegex } = await importModule("src/tools/regex-tester/logic.ts");
  const result = testRegex("(?<name>\\w+)=(\\d+)", "g", "a=1 b=2");
  assert.equal(result.error, null);
  assert.equal(result.count, 2);
  assert.deepEqual(result.groupNames, ["name"]);
  assert.deepEqual(result.matches[0].groups, ["a", "1"]);
  assert.match(highlightMatches("a=1 b=2", result.matches), /regex-match/);
}

async function testJwtDebuggerKeepsOriginalPanelsAndVerification() {
  const source = await fs.readFile(path.join(root, "src/tools/jwt-debugger/Tool.tsx"), "utf8");
  assert.ok(source.includes("jwt-code-panel"), "JWT debugger should keep decoded code panels");
  assert.ok(source.includes("jwt-sig"), "JWT debugger should keep signature panel");
  assert.ok(source.includes("jwt-verify-hint"), "JWT debugger should keep verification hint");
  assert.ok(source.includes("jwt-verify-ok"), "JWT debugger should keep verification success state");
  assert.ok(source.includes("jwt-verify-fail"), "JWT debugger should keep verification failure state");

  const { parseJwt, verifySignature } = await importModule("src/tools/jwt-debugger/logic.ts");
  const parsed = parseJwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwibmFtZSI6IkRlbW8ifQ.invalid");
  assert.equal(parsed.error, undefined);
  assert.equal(parsed.header.alg, "HS256");
  assert.equal(parsed.payload.name, "Demo");
  assert.equal(parseJwt("bad").error, "JWT 格式无效（应为 header.payload.signature 三段）");
  assert.deepEqual(await verifySignature(parsed.headerB64, parsed.payloadB64, parsed.signature, "", parsed.alg), {
    verified: false,
    reason: "未提供密钥",
  });
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
  await testColorPaletteKeepsOriginalFeatures();
  await testPromptTemplatesKeepOriginalLibrary();
  await testTimestampConverterKeepsOriginalFeatures();
  await testJsonFormatterKeepsOriginalTreeView();
  await testCronParserKeepsOriginalNaturalLanguage();
  await testCurlConverterKeepsOriginalParsingAndOutputs();
  await testTextChunkerKeepsOriginalCardsAndStats();
  await testTokenCalculatorKeepsOriginalModelStats();
  await testRegexTesterKeepsOriginalMatchDetails();
  await testJwtDebuggerKeepsOriginalPanelsAndVerification();
  console.log("tools-data tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
