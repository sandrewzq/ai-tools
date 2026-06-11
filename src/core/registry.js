import { meta as colorConverter } from "../tools/color-converter/index.js";
import { meta as colorPalette } from "../tools/color-palette/index.js";
import { meta as cronParser } from "../tools/cron-parser/index.js";
import { meta as csvConverter } from "../tools/csv-converter/index.js";
import { meta as jsonFormatter } from "../tools/json-formatter/index.js";
import { meta as regexTester } from "../tools/regex-tester/index.js";
import { meta as encodingConverter } from "../tools/encoding-converter/index.js";
import { meta as timestampConverter } from "../tools/timestamp-converter/index.js";
import { meta as promptTemplates } from "../tools/prompt-templates/index.js";
import { meta as speedTest } from "../tools/speed-test/index.js";
import { meta as textChunker } from "../tools/text-chunker/index.js";
import { meta as textDiffer } from "../tools/text-differ/index.js";
import { meta as tokenCalculator } from "../tools/token-calculator/index.js";
import { meta as urlParser } from "../tools/url-parser/index.js";
import { meta as xmlFormatter } from "../tools/xml-formatter/index.js";
import { meta as yamlFormatter } from "../tools/yaml-formatter/index.js";

export const tools = [speedTest, colorPalette, promptTemplates, textChunker, textDiffer, tokenCalculator, jsonFormatter, regexTester, encodingConverter, timestampConverter, cronParser, colorConverter, yamlFormatter, xmlFormatter, urlParser, csvConverter];

export function getToolIds() {
  return tools.map((tool) => tool.id);
}

export function hasTool(id) {
  return tools.some((tool) => tool.id === id);
}
