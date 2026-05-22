import { meta as colorPalette } from "../tools/color-palette/index.js";
import { meta as speedTest } from "../tools/speed-test/index.js";

export const tools = [speedTest, colorPalette];

export function getToolIds() {
  return tools.map((tool) => tool.id);
}

export function hasTool(id) {
  return tools.some((tool) => tool.id === id);
}
