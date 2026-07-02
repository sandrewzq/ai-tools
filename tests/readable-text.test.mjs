import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const sourceFiles = [
  "src",
  "index.html",
  "tests/browser-smoke.mjs",
  "tests/visual-regression.mjs",
];

const allowedMojibakeFiles = new Set(["tests/app-source.test.mjs"]);

const mojibakePattern =
  /\uFFFD|\u951F|\u93BC|\u677B|\u6FB6|\u9428|\u7F02|\u9366|\u9286|\u921D|\u4E41|\u4E44|\u4E31|\u4E33|\u20AC|\u2469|\u93CD|\u6D93|\u9359|\u934F|\u93C8|\u9422|\u53D9|\u6D63|\u7039|\u93C3|\u95B0|\u95B2/;

const requiredReadableText = [
  ["src/app/tool-registry.ts", ["大模型测速", "配色生成器", "提示词模板", "文本分块", "时间戳转换器", "CSV 转换"]],
  ["src/components/AppShell.tsx", ["AI 工具箱", "静态工具集合"]],
  ["src/components/HomeWorkbench.tsx", ["全部", "工具导航", "收藏", "最近使用", "全部工具", "没有匹配的工具"]],
  ["src/components/SearchBox.tsx", ["搜索工具", "输入名称、分类或标签"]],
  ["src/components/ToolLayout.tsx", ["返回工具首页"]],
  ["src/components/ErrorBoundary.tsx", ["工具加载失败"]],
  ["src/shared/clipboard.ts", ["已复制", "复制失败，请手动复制"]],
];

for (const entry of requiredReadableText) {
  const [file, expectedTexts] = entry;
  const content = await fs.readFile(path.join(root, file), "utf8");
  for (const expectedText of expectedTexts) {
    assert.ok(content.includes(expectedText), `${file} should contain readable text: ${expectedText}`);
  }
}

for (const file of await listTextFiles(sourceFiles)) {
  const relative = path.relative(root, file).replace(/\\/g, "/");
  if (allowedMojibakeFiles.has(relative)) continue;

  const content = await fs.readFile(file, "utf8");
  assert.ok(!mojibakePattern.test(content), `${relative} should not contain mojibake text`);
}

console.log("readable text tests passed");

async function listTextFiles(entries) {
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files.filter((file) => /\.(tsx?|mjs|html)$/.test(file));
}

async function walk(dir) {
  const files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}
