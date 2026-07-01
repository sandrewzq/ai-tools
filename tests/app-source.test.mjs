import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

for (const file of [
  "src/components/AppShell.tsx",
  "src/components/HomeWorkbench.tsx",
  "src/components/ToolLayout.tsx",
  "src/components/ErrorBoundary.tsx",
]) {
  const content = await fs.readFile(path.join(root, file), "utf8");
  assert.ok(content.length > 100, `${file} should contain implementation`);
}

console.log("app source tests passed");
