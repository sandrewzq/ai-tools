import { meta as colorPalette } from "../tools/color-palette/index.js";
import { meta as jsonFormatter } from "../tools/json-formatter/index.js";
import { meta as promptTemplates } from "../tools/prompt-templates/index.js";
import { meta as speedTest } from "../tools/speed-test/index.js";
import { meta as textChunker } from "../tools/text-chunker/index.js";
import { meta as textDiffer } from "../tools/text-differ/index.js";
import { meta as tokenCalculator } from "../tools/token-calculator/index.js";

export const tools = [speedTest, colorPalette, promptTemplates, textChunker, textDiffer, tokenCalculator, jsonFormatter];

export function getToolIds() {
  return tools.map((tool) => tool.id);
}

export function hasTool(id) {
  return tools.some((tool) => tool.id === id);
}
