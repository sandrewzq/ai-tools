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
assert.ok(appShell.includes("AI 工具箱"), "App shell should render readable Chinese title");
assert.ok(appShell.includes("静态工具集合"), "App shell hero text should not be mojibake");

const textExpectations = [
  ["src/components/HomeWorkbench.tsx", ["全部", "工具导航", "收藏", "最近使用", "全部工具", "没有匹配的工具"]],
  ["src/components/SearchBox.tsx", ["搜索工具", "输入名称、分类或标签"]],
  ["src/components/ToolLayout.tsx", ["返回工具首页"]],
  ["src/components/ToolCard.tsx", ["取消收藏", "收藏", "★", "☆"]],
  ["src/components/ErrorBoundary.tsx", ["工具加载失败"]],
  ["src/shared/clipboard.ts", ["已复制", "复制失败，请手动复制"]],
  ["src/app/tool-registry.ts", ["大模型测速", "配色生成器", "提示词模板", "文本分块", "时间戳转换器", "CSV 转换"]],
];

const mojibakePattern = /�|鎼|杩|宸|澶|鐨|瑙|缂|鍦|銆|鈽|乁|丄|丱|丳|€|⑩/;
for (const [file, expectedTexts] of textExpectations) {
  const content = await fs.readFile(path.join(root, file), "utf8");
  for (const expected of expectedTexts) {
    assert.ok(content.includes(expected), `${file} should include readable text: ${expected}`);
  }
  assert.ok(!mojibakePattern.test(content), `${file} should not contain mojibake text`);
}

const styles = await fs.readFile(path.join(root, "styles.css"), "utf8");
assert.ok(styles.includes("--bg: #f3efe7"), "Styles should keep the original visual palette");
assert.ok(!styles.includes(".app-sidebar"), "Styles should not include the reverted sidebar shell");

console.log("app source tests passed");
