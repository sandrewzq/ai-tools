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

const appShell = await fs.readFile(path.join(root, "src/components/AppShell.tsx"), "utf8");
assert.ok(appShell.includes("page-shell"), "App shell should keep the original page-shell layout");
assert.ok(appShell.includes("tool-tabs"), "App shell should keep the original top tool tabs");
assert.ok(!appShell.includes("app-sidebar"), "App shell should not replace the original layout with a sidebar");

const styles = await fs.readFile(path.join(root, "styles.css"), "utf8");
assert.ok(styles.includes("--bg: #f3efe7"), "Styles should keep the original visual palette");
assert.ok(!styles.includes(".app-sidebar"), "Styles should not include the reverted sidebar shell");

console.log("app source tests passed");
