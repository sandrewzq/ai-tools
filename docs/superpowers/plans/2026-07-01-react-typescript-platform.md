# React TypeScript Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the AI tools site as a Vite, React, and TypeScript static app with all existing tools migrated and product-level search, categories, favorites, recent tools, and preferences.

**Architecture:** Vite owns development and static production builds. React renders the app shell, home workbench, routes, and tool pages from one typed registry. Each tool owns its React component and typed logic module, while shared browser utilities live under `src/shared`.

**Tech Stack:** Vite, React, TypeScript, Node test runner, CSS, GitHub Pages static deployment.

## Global Constraints

- Production deployment remains static and compatible with GitHub Pages.
- All current tools must remain available in the first React version.
- Do not add new tools during this migration.
- Do not keep a compatibility layer that mounts old DOM-based tools inside React.
- Local personalization data stays in `localStorage` under `ai-tools:*` keys.
- First-version preferences are theme preference and density preference only.
- Tool directories must not directly import from other tool directories.

---

## File Structure

- Create `package.json`: npm scripts for `dev`, `build`, `preview`, `test`, and `typecheck`.
- Create `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`: TypeScript and Vite configuration for a static GitHub Pages build.
- Modify `index.html`: replace static tool markup with a Vite root.
- Create `src/main.tsx`: React entry point.
- Create `src/app/App.tsx`: top-level routing, shell composition, and error boundary.
- Create `src/app/tool-types.ts`: typed contracts for categories, metadata, and tool definitions.
- Create `src/app/tool-registry.ts`: single source of truth for all 21 tools.
- Create `src/app/routes.ts`: route helpers derived from the registry.
- Create `src/components/*`: reusable shell, cards, layout, search, category filter, empty state, and error boundary components.
- Create `src/hooks/useFavorites.ts`, `src/hooks/useRecentTools.ts`, `src/hooks/usePreferences.ts`: local personalization state.
- Create or convert `src/shared/*.ts`: storage, clipboard, format, validation, URL, object, stats, color helpers.
- Replace each `src/tools/<tool>/{index.js,data.js,render.js}` with `meta.ts`, `logic.ts`, and `Tool.tsx` as applicable.
- Modify `.github/workflows/*.yml`: build the Vite app and upload `dist`.
- Replace tests with TypeScript-aware or JavaScript Node tests that import built source through tsx-compatible execution.

---

### Task 1: Tooling And Static Build Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Modify: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/vite-env.d.ts`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run preview`, `npm test`, and `npm run typecheck`.
- Produces: a React app mounted at `<div id="root"></div>`.
- Consumes: no earlier task output.

- [ ] **Step 1: Create the failing build expectation**

Run: `npm run build`

Expected: command fails because `package.json` does not exist.

- [ ] **Step 2: Add project scripts and dependencies**

Create `package.json` with this content:

```json
{
  "name": "ai-tools",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "node --test tests/*.test.mjs",
    "typecheck": "tsc -b --pretty false"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.11",
    "typescript": "^5.6.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {}
}
```

- [ ] **Step 3: Add TypeScript and Vite config**

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.app.json" }
  ]
}
```

Create `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "./",
});
```

- [ ] **Step 4: Replace the HTML shell**

Replace `index.html` with a Vite shell:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI 工具箱</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Add the minimal React entry**

Create `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "../styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `src/app/App.tsx`:

```tsx
export function App() {
  return <div className="app-shell">AI 工具箱</div>;
}
```

Create `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 6: Install dependencies and verify the shell**

Run: `npm install`

Expected: `package-lock.json` is created and dependencies install successfully.

Run: `npm run build`

Expected: Vite creates `dist/` and TypeScript passes.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html src/main.tsx src/app/App.tsx src/vite-env.d.ts
git commit -m "build: add Vite React TypeScript foundation"
```

---

### Task 2: Registry, Routes, Storage Hooks, And Tests

**Files:**
- Create: `src/app/tool-types.ts`
- Create: `src/app/tool-registry.ts`
- Create: `src/app/routes.ts`
- Create: `src/shared/storage.ts`
- Create: `src/hooks/useFavorites.ts`
- Create: `src/hooks/useRecentTools.ts`
- Create: `src/hooks/usePreferences.ts`
- Modify: `tests/integration-mapping.test.mjs`

**Interfaces:**
- Produces: `ToolMeta`, `ToolDefinition`, `ToolCategory`, `tools`, `getToolByRoute(route)`, `getToolById(id)`.
- Produces: `useFavorites(toolIds)`, `useRecentTools(toolIds)`, `usePreferences()`.
- Consumes: React from Task 1.

- [ ] **Step 1: Write registry tests**

Replace `tests/integration-mapping.test.mjs` with:

```js
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registry = await fs.readFile(path.join(root, "src/app/tool-registry.ts"), "utf8");

const expectedIds = [
  "speed-test",
  "color-palette",
  "prompt-templates",
  "text-chunker",
  "text-differ",
  "token-calculator",
  "json-formatter",
  "regex-tester",
  "encoding-converter",
  "timestamp-converter",
  "curl-converter",
  "qr-generator",
  "uuid-generator",
  "hash-generator",
  "jwt-debugger",
  "cron-parser",
  "color-converter",
  "yaml-formatter",
  "xml-formatter",
  "url-parser",
  "csv-converter"
];

for (const id of expectedIds) {
  assert.ok(registry.includes(`id: "${id}"`), `${id} should be registered`);
  assert.ok(registry.includes(`./../tools/${id}/Tool`), `${id} should lazy-load a React tool`);
}

console.log("registry mapping tests passed");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: FAIL because `src/app/tool-registry.ts` does not exist.

- [ ] **Step 3: Add typed registry contracts**

Create `src/app/tool-types.ts`:

```ts
import type { ComponentType, LazyExoticComponent } from "react";

export type ToolCategory = "benchmark" | "text" | "data" | "encoding" | "security" | "time" | "design" | "network";

export type ToolMeta = {
  id: string;
  route: string;
  title: string;
  category: ToolCategory;
  description: string;
  tags: string[];
};

export type ToolDefinition = {
  meta: ToolMeta;
  Component: LazyExoticComponent<ComponentType>;
};
```

Create `src/app/tool-registry.ts`:

```ts
import { lazy } from "react";
import type { ToolDefinition } from "./tool-types";

export const tools: ToolDefinition[] = [
  { meta: { id: "speed-test", route: "speed-test", title: "大模型测速", category: "benchmark", description: "测试 OpenAI、Anthropic、Ollama 兼容接口的流式响应速度。", tags: ["LLM", "测速", "API"] }, Component: lazy(() => import("./../tools/speed-test/Tool")) },
  { meta: { id: "color-palette", route: "color-palette", title: "配色生成器", category: "design", description: "生成可用于界面的配色方案和 CSS 变量。", tags: ["颜色", "设计", "CSS"] }, Component: lazy(() => import("./../tools/color-palette/Tool")) },
  { meta: { id: "prompt-templates", route: "prompt-templates", title: "提示词模板", category: "text", description: "搜索、复制和收藏常用提示词模板。", tags: ["Prompt", "模板", "AI"] }, Component: lazy(() => import("./../tools/prompt-templates/Tool")) },
  { meta: { id: "text-chunker", route: "text-chunker", title: "文本分块", category: "text", description: "按字符、段落或估算 token 将长文本拆成块。", tags: ["文本", "分块", "Token"] }, Component: lazy(() => import("./../tools/text-chunker/Tool")) },
  { meta: { id: "text-differ", route: "text-differ", title: "文本比对", category: "text", description: "比较两段文本并标记新增、删除和未变化内容。", tags: ["Diff", "文本", "对比"] }, Component: lazy(() => import("./../tools/text-differ/Tool")) },
  { meta: { id: "token-calculator", route: "token-calculator", title: "Token 计算", category: "text", description: "估算文本 token、字符、词数和成本。", tags: ["Token", "成本", "文本"] }, Component: lazy(() => import("./../tools/token-calculator/Tool")) },
  { meta: { id: "json-formatter", route: "json-formatter", title: "JSON 格式化", category: "data", description: "格式化、压缩、校验并分析 JSON。", tags: ["JSON", "格式化", "校验"] }, Component: lazy(() => import("./../tools/json-formatter/Tool")) },
  { meta: { id: "regex-tester", route: "regex-tester", title: "正则测试", category: "text", description: "测试正则表达式并高亮匹配结果。", tags: ["正则", "Regex", "匹配"] }, Component: lazy(() => import("./../tools/regex-tester/Tool")) },
  { meta: { id: "encoding-converter", route: "encoding-converter", title: "编码转换", category: "encoding", description: "进行 Base64、URL、HTML 和 Unicode 编码转换。", tags: ["Base64", "URL", "HTML"] }, Component: lazy(() => import("./../tools/encoding-converter/Tool")) },
  { meta: { id: "timestamp-converter", route: "timestamp-converter", title: "时间戳转换", category: "time", description: "在时间戳、日期和时区之间转换。", tags: ["时间戳", "日期", "时区"] }, Component: lazy(() => import("./../tools/timestamp-converter/Tool")) },
  { meta: { id: "curl-converter", route: "curl-converter", title: "cURL 转代码", category: "network", description: "把 cURL 命令转换为 fetch、Python 和 Go 示例。", tags: ["cURL", "HTTP", "代码"] }, Component: lazy(() => import("./../tools/curl-converter/Tool")) },
  { meta: { id: "qr-generator", route: "qr-generator", title: "二维码生成", category: "encoding", description: "生成文本或链接二维码并下载图片。", tags: ["QR", "二维码", "图片"] }, Component: lazy(() => import("./../tools/qr-generator/Tool")) },
  { meta: { id: "uuid-generator", route: "uuid-generator", title: "UUID 生成", category: "data", description: "批量生成 UUID v4 或 v7。", tags: ["UUID", "ID", "生成"] }, Component: lazy(() => import("./../tools/uuid-generator/Tool")) },
  { meta: { id: "hash-generator", route: "hash-generator", title: "哈希生成", category: "security", description: "生成 MD5、SHA 系列哈希摘要。", tags: ["Hash", "MD5", "SHA"] }, Component: lazy(() => import("./../tools/hash-generator/Tool")) },
  { meta: { id: "jwt-debugger", route: "jwt-debugger", title: "JWT 调试", category: "security", description: "解析 JWT Header、Payload 并校验 HS256 签名。", tags: ["JWT", "Token", "安全"] }, Component: lazy(() => import("./../tools/jwt-debugger/Tool")) },
  { meta: { id: "cron-parser", route: "cron-parser", title: "Cron 解析", category: "time", description: "解析 Cron 表达式字段和含义。", tags: ["Cron", "定时", "表达式"] }, Component: lazy(() => import("./../tools/cron-parser/Tool")) },
  { meta: { id: "color-converter", route: "color-converter", title: "颜色转换", category: "design", description: "在 HEX、RGB、HSL 格式间转换颜色。", tags: ["颜色", "HEX", "RGB"] }, Component: lazy(() => import("./../tools/color-converter/Tool")) },
  { meta: { id: "yaml-formatter", route: "yaml-formatter", title: "YAML 格式化", category: "data", description: "格式化 YAML，并在 YAML 和 JSON 间转换。", tags: ["YAML", "JSON", "格式化"] }, Component: lazy(() => import("./../tools/yaml-formatter/Tool")) },
  { meta: { id: "xml-formatter", route: "xml-formatter", title: "XML 格式化", category: "data", description: "格式化、压缩 XML，并转换为 JSON 树。", tags: ["XML", "JSON", "格式化"] }, Component: lazy(() => import("./../tools/xml-formatter/Tool")) },
  { meta: { id: "url-parser", route: "url-parser", title: "URL 解析", category: "network", description: "拆解 URL 组成部分、查询参数和重建参数。", tags: ["URL", "Query", "网络"] }, Component: lazy(() => import("./../tools/url-parser/Tool")) },
  { meta: { id: "csv-converter", route: "csv-converter", title: "CSV 转换", category: "data", description: "解析 CSV，预览表格并转换为 JSON。", tags: ["CSV", "JSON", "表格"] }, Component: lazy(() => import("./../tools/csv-converter/Tool")) },
];

export const toolIds = tools.map((tool) => tool.meta.id);
```

Create `src/app/routes.ts`:

```ts
import { tools } from "./tool-registry";

export const HOME_ROUTE = "home";

export function normalizeRoute(route: string | null | undefined) {
  const value = (route || HOME_ROUTE).replace(/^#/, "");
  return tools.some((tool) => tool.meta.route === value) ? value : HOME_ROUTE;
}

export function getToolByRoute(route: string) {
  return tools.find((tool) => tool.meta.route === route) ?? null;
}

export function getToolById(id: string) {
  return tools.find((tool) => tool.meta.id === id) ?? null;
}
```

- [ ] **Step 4: Add local storage utilities and hooks**

Create `src/shared/storage.ts`:

```ts
export function readJson<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
  return true;
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
```

Create `src/hooks/useFavorites.ts`:

```ts
import { useEffect, useMemo, useState } from "react";
import { isStringArray, readJson, writeJson } from "../shared/storage";

const KEY = "ai-tools:favorites";

export function useFavorites(validIds: string[]) {
  const validSet = useMemo(() => new Set(validIds), [validIds]);
  const [favorites, setFavorites] = useState<string[]>(() => readJson(KEY, [], isStringArray).filter((id) => validSet.has(id)));

  useEffect(() => {
    writeJson(KEY, favorites);
  }, [favorites]);

  function toggleFavorite(id: string) {
    if (!validSet.has(id)) return;
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]);
  }

  return { favorites, toggleFavorite, isFavorite: (id: string) => favorites.includes(id) };
}
```

Create `src/hooks/useRecentTools.ts`:

```ts
import { useEffect, useMemo, useState } from "react";
import { isStringArray, readJson, writeJson } from "../shared/storage";

const KEY = "ai-tools:recent";
const LIMIT = 8;

export function useRecentTools(validIds: string[]) {
  const validSet = useMemo(() => new Set(validIds), [validIds]);
  const [recentTools, setRecentTools] = useState<string[]>(() => readJson(KEY, [], isStringArray).filter((id) => validSet.has(id)));

  useEffect(() => {
    writeJson(KEY, recentTools);
  }, [recentTools]);

  function markRecent(id: string) {
    if (!validSet.has(id)) return;
    setRecentTools((current) => [id, ...current.filter((item) => item !== id)].slice(0, LIMIT));
  }

  return { recentTools, markRecent };
}
```

Create `src/hooks/usePreferences.ts`:

```ts
import { useEffect, useState } from "react";
import { readJson, writeJson } from "../shared/storage";

export type Preferences = {
  theme: "light" | "dark";
  density: "comfortable" | "compact";
};

const KEY = "ai-tools:preferences";
const DEFAULTS: Preferences = { theme: "light", density: "comfortable" };

function isPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (record.theme === "light" || record.theme === "dark") && (record.density === "comfortable" || record.density === "compact");
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => readJson(KEY, DEFAULTS, isPreferences));

  useEffect(() => {
    writeJson(KEY, preferences);
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.density = preferences.density;
  }, [preferences]);

  return { preferences, setPreferences };
}
```

- [ ] **Step 5: Run verification**

Run: `npm test`

Expected: `registry mapping tests passed`.

Run: `npm run typecheck`

Expected: TypeScript passes after tool component stubs are added in Task 3. Before Task 3, import errors for missing `Tool.tsx` files are expected.

- [ ] **Step 6: Commit**

```bash
git add src/app/tool-types.ts src/app/tool-registry.ts src/app/routes.ts src/shared/storage.ts src/hooks/useFavorites.ts src/hooks/useRecentTools.ts src/hooks/usePreferences.ts tests/integration-mapping.test.mjs
git commit -m "feat: add typed tool registry and local state hooks"
```

---

### Task 3: App Shell, Home Workbench, And Shared Components

**Files:**
- Modify: `src/app/App.tsx`
- Create: `src/components/AppShell.tsx`
- Create: `src/components/ErrorBoundary.tsx`
- Create: `src/components/HomeWorkbench.tsx`
- Create: `src/components/SearchBox.tsx`
- Create: `src/components/ToolCard.tsx`
- Create: `src/components/ToolLayout.tsx`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `tools`, `normalizeRoute`, `getToolByRoute`, favorites, recent tools, and preferences from Task 2.
- Produces: `ToolLayout` used by every tool component.

- [ ] **Step 1: Add component-level smoke test**

Create `tests/app-source.test.mjs`:

```js
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

for (const file of [
  "src/components/AppShell.tsx",
  "src/components/HomeWorkbench.tsx",
  "src/components/ToolLayout.tsx",
  "src/components/ErrorBoundary.tsx"
]) {
  const content = await fs.readFile(path.join(root, file), "utf8");
  assert.ok(content.length > 100, `${file} should contain implementation`);
}

console.log("app source tests passed");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: FAIL because shared components do not exist.

- [ ] **Step 3: Implement shared shell components**

Create `src/components/ErrorBoundary.tsx`:

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Tool render failed", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return <div className="error-panel">工具加载失败：{this.state.error.message}</div>;
    }
    return this.props.children;
  }
}
```

Create `src/components/ToolLayout.tsx`:

```tsx
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function ToolLayout({ title, description, actions, children }: Props) {
  return (
    <section className="tool-layout">
      <header className="tool-layout-header">
        <div>
          <p className="tool-kicker">工具</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {actions ? <div className="tool-actions">{actions}</div> : null}
      </header>
      <div className="tool-layout-body">{children}</div>
    </section>
  );
}
```

Create `src/components/SearchBox.tsx`:

```tsx
type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBox({ value, onChange }: Props) {
  return (
    <label className="search-box">
      <span>搜索工具</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="输入名称、分类或标签" />
    </label>
  );
}
```

Create `src/components/ToolCard.tsx`:

```tsx
import type { ToolDefinition } from "../app/tool-types";

type Props = {
  tool: ToolDefinition;
  favorite: boolean;
  onOpen: (route: string) => void;
  onToggleFavorite: (id: string) => void;
};

export function ToolCard({ tool, favorite, onOpen, onToggleFavorite }: Props) {
  return (
    <article className="tool-card">
      <button className="tool-card-main" type="button" onClick={() => onOpen(tool.meta.route)}>
        <span className="tool-card-category">{tool.meta.category}</span>
        <h3>{tool.meta.title}</h3>
        <p>{tool.meta.description}</p>
      </button>
      <button className="icon-btn" type="button" aria-label={favorite ? "取消收藏" : "收藏"} onClick={() => onToggleFavorite(tool.meta.id)}>
        {favorite ? "★" : "☆"}
      </button>
    </article>
  );
}
```

Create `src/components/HomeWorkbench.tsx` and `src/components/AppShell.tsx` using the registry and hooks. `HomeWorkbench` must filter by lowercase text across title, description, category, and tags. `AppShell` must render navigation buttons for home and all tools.

- [ ] **Step 4: Wire hash routing in App**

Modify `src/app/App.tsx` so it reads `window.location.hash`, normalizes it, renders `HomeWorkbench` for `home`, and lazy-renders the selected tool inside `Suspense` and `ErrorBoundary`.

- [ ] **Step 5: Add responsive styling**

Modify `styles.css` to define app shell, sidebar/top navigation, workbench grids, cards, controls, tool layout, compact density rules, dark theme rules, and error panel styles. Preserve useful existing utility classes only when they remain used.

- [ ] **Step 6: Verify**

Run: `npm test`

Expected: `app source tests passed` and `registry mapping tests passed`.

Run: `npm run build`

Expected: build may still fail until every tool has a `Tool.tsx` export. If it fails only on missing tool modules, proceed to Task 4.

- [ ] **Step 7: Commit**

```bash
git add src/app/App.tsx src/components tests/app-source.test.mjs styles.css
git commit -m "feat: add React app shell and tool workbench"
```

---

### Task 4: Shared Logic Conversion And Parity Tests

**Files:**
- Convert: `src/shared/color.js` to `src/shared/color.ts`
- Convert: `src/shared/format.js` to `src/shared/format.ts`
- Convert: `src/shared/object.js` to `src/shared/object.ts`
- Convert: `src/shared/stats.js` to `src/shared/stats.ts`
- Convert: `src/shared/url.js` to `src/shared/url.ts`
- Convert: `src/shared/validation.js` to `src/shared/validation.ts`
- Create: `src/shared/clipboard.ts`
- Modify: `tests/tools-data.test.mjs`

**Interfaces:**
- Produces typed shared helpers used by tool logic.
- Consumes no tool UI.

- [ ] **Step 1: Expand logic tests for shared expectations**

Keep the existing YAML, XML, URL, and CSV assertions. Add assertions that import `.ts` files after conversion through compiled build output only if Node cannot import TypeScript directly. During implementation, prefer testing logic through `npm run build` and then importing `dist/assets` only for bundle smoke; keep direct pure logic tests in `.mjs` for converted `.js` files until a test runner is introduced.

- [ ] **Step 2: Convert shared helpers to TypeScript**

For each shared helper, preserve exported function names and add explicit parameter and return types. Example target for `src/shared/format.ts`:

```ts
export function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value);
}

export function escapeHtml(value: unknown) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
```

Create `src/shared/clipboard.ts`:

```ts
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true, message: "已复制" };
  } catch {
    return { ok: false, message: "复制失败，请手动复制" };
  }
}
```

- [ ] **Step 3: Update imports**

Update every new TypeScript module import to extensionless paths such as `../../shared/format`.

- [ ] **Step 4: Verify**

Run: `npm run typecheck`

Expected: no TypeScript errors from shared helpers.

Run: `npm test`

Expected: current source tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/shared tests/tools-data.test.mjs
git commit -m "refactor: convert shared helpers to TypeScript"
```

---

### Task 5: Migrate Data And Text Tools

**Files:**
- Convert each listed tool to `meta.ts`, `logic.ts`, `Tool.tsx`:
  - `src/tools/json-formatter/*`
  - `src/tools/yaml-formatter/*`
  - `src/tools/xml-formatter/*`
  - `src/tools/csv-converter/*`
  - `src/tools/url-parser/*`
  - `src/tools/text-chunker/*`
  - `src/tools/text-differ/*`
  - `src/tools/token-calculator/*`
  - `src/tools/regex-tester/*`
  - `src/tools/prompt-templates/*`

**Interfaces:**
- Consumes: `ToolLayout`, `copyText`, typed shared helpers.
- Produces: React default exports at `src/tools/<id>/Tool.tsx`.

- [ ] **Step 1: Preserve and convert pure logic**

Move parser and converter functions from each `data.js` or equivalent into `logic.ts`. Keep exported names stable where tests already use them: `formatYaml`, `yamlToJson`, `jsonToYaml`, `formatXml`, `compactXml`, `xmlToJson`, `parseUrl`, `buildUrl`, `parseCsv`, `csvToJson`.

- [ ] **Step 2: Build React tool components**

Each `Tool.tsx` must:

```tsx
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";

export default function Tool() {
  return (
    <ToolLayout title="工具标题" description="工具描述">
      <div className="tool-panel">工具控件和输出</div>
    </ToolLayout>
  );
}
```

Replace `"工具标题"` and `"工具描述"` with the tool's registry title and description. Use controlled React state instead of querying DOM.

- [ ] **Step 3: Keep feature parity for each tool**

Implement these exact interactions:

- JSON: format, compress, validate, copy formatted output, show structural stats.
- YAML: format, compact, YAML to JSON, JSON to YAML, copy output, show stats.
- XML: format, compact, XML to JSON, copy output, show stats.
- CSV: delimiter selection, header toggle, JSON output, table preview, copy JSON.
- URL: parse example URL, show parts, query rows, query JSON, rebuilt query URL, copy JSON or rebuilt URL.
- Text chunker: split mode, chunk size, overlap, chunk list, copy all.
- Text differ: compare, swap, reset, stats, highlighted diff.
- Token calculator: model selector, estimated tokens, characters, words, estimated cost.
- Regex tester: pattern, flags, text, matches, highlighted result, persisted input.
- Prompt templates: category filter, search, favorites, copy template text.

- [ ] **Step 4: Update tests**

Update `tests/tools-data.test.mjs` imports to match converted logic paths where direct Node import remains possible. If TypeScript direct import is unavailable, add equivalent `.mjs` tests for the built behavior after `npm run build`.

- [ ] **Step 5: Verify**

Run: `npm test`

Expected: parser and registry tests pass.

Run: `npm run typecheck`

Expected: no errors from migrated data and text tools.

- [ ] **Step 6: Commit**

```bash
git add src/tools/json-formatter src/tools/yaml-formatter src/tools/xml-formatter src/tools/csv-converter src/tools/url-parser src/tools/text-chunker src/tools/text-differ src/tools/token-calculator src/tools/regex-tester src/tools/prompt-templates tests/tools-data.test.mjs
git commit -m "refactor: migrate data and text tools to React"
```

---

### Task 6: Migrate Generator, Encoding, Time, Design, And Security Tools

**Files:**
- Convert each listed tool to `meta.ts`, `logic.ts`, `Tool.tsx`:
  - `src/tools/encoding-converter/*`
  - `src/tools/timestamp-converter/*`
  - `src/tools/curl-converter/*`
  - `src/tools/qr-generator/*`
  - `src/tools/uuid-generator/*`
  - `src/tools/hash-generator/*`
  - `src/tools/jwt-debugger/*`
  - `src/tools/cron-parser/*`
  - `src/tools/color-converter/*`
  - `src/tools/color-palette/*`

**Interfaces:**
- Consumes: shared layout, clipboard, color, validation, format, object, and storage helpers.
- Produces: React default exports for all remaining tool modules.

- [ ] **Step 1: Preserve and type pure logic**

Convert existing logic into `logic.ts`. Keep existing algorithm behavior for QR generation, UUID generation, hashing, JWT decode/verify, cron parsing, color conversion, and palette generation.

- [ ] **Step 2: Build controlled React UIs**

Each tool must use React state for input, output, errors, and copy status. No `document.querySelector`, no `addEventListener`, and no shared `dom-cache` imports are allowed.

- [ ] **Step 3: Keep feature parity for each tool**

Implement these exact interactions:

- Encoding: Base64 encode/decode, URL encode/decode, HTML encode/decode, Unicode escape/unescape, copy output.
- Timestamp: current timestamp, timestamp to date, date to timestamp, timezone selector, copy results.
- cURL: parse cURL, generate fetch, Python, Go, copy each output.
- QR: generate QR canvas or SVG-equivalent rendering, show size/version, download PNG.
- UUID: v4/v7, count, no-hyphen toggle, uppercase toggle, copy all.
- Hash: algorithm selection, text input, digest output, copy digest.
- JWT: decode header/payload, show signature, verify HS256 with secret.
- Cron: examples, parse fields, summary, validation error.
- Color converter: input color, preview, HEX/RGB/HSL outputs, copy values.
- Color palette: auto and preset modes, base color, swatches, CSS variables, guide, preview, copy CSS and JSON.

- [ ] **Step 4: Add targeted tests for high-risk logic**

Add assertions to `tests/tools-data.test.mjs` for:

```js
assert.equal(generateBatch(2, "v4", false, false).length, 2);
assert.equal(convertColor("#ffffff").hex, "#ffffff");
assert.equal(parseCron("*/5 * * * *").error, null);
```

Use the actual converted export names when writing the imports.

- [ ] **Step 5: Verify**

Run: `npm test`

Expected: all logic and registry tests pass.

Run: `npm run typecheck`

Expected: no errors from remaining tools.

- [ ] **Step 6: Commit**

```bash
git add src/tools/encoding-converter src/tools/timestamp-converter src/tools/curl-converter src/tools/qr-generator src/tools/uuid-generator src/tools/hash-generator src/tools/jwt-debugger src/tools/cron-parser src/tools/color-converter src/tools/color-palette tests/tools-data.test.mjs
git commit -m "refactor: migrate remaining tools to React"
```

---

### Task 7: Migrate Speed Test Tool

**Files:**
- Convert: `src/tools/speed-test/providers.js` to `src/tools/speed-test/providers.ts`
- Convert: `src/tools/speed-test/model-fetcher.js` to `src/tools/speed-test/model-fetcher.ts`
- Convert: `src/tools/speed-test/benchmark.js` to `src/tools/speed-test/benchmark.ts`
- Replace: `src/tools/speed-test/index.js` with `src/tools/speed-test/Tool.tsx`
- Keep or modify: `server.js`

**Interfaces:**
- Consumes: shared URL, validation, object, format, and stats helpers.
- Produces: `SpeedTestTool` default React export through `Tool.tsx`.

- [ ] **Step 1: Convert benchmark providers**

Preserve exported functions:

```ts
export async function runOpenAiBenchmark(target: BenchmarkTarget, config: BenchmarkConfig, signal: AbortSignal): Promise<BenchmarkProviderResult>
export async function runAnthropicBenchmark(target: BenchmarkTarget, config: BenchmarkConfig, signal: AbortSignal): Promise<BenchmarkProviderResult>
export async function runOllamaBenchmark(target: BenchmarkTarget, config: BenchmarkConfig, signal: AbortSignal): Promise<BenchmarkProviderResult>
```

Define `BenchmarkTarget`, `BenchmarkConfig`, and `BenchmarkProviderResult` in `benchmark.ts` or a local `types.ts`.

- [ ] **Step 2: Build React target management**

The tool component must support:

- Add OpenAI-compatible target.
- Add Anthropic target.
- Add Ollama target.
- Fetch model list for each target.
- Edit Base URL, API key, model, extra headers, and extra body.
- Remove targets.

- [ ] **Step 3: Build React benchmark lifecycle**

The tool component must support:

- Prompt, system prompt, rounds, warmup rounds, max tokens, and temperature.
- Start benchmark.
- Stop benchmark through `AbortController`.
- Live status and log output.
- Summary and detail tables.
- Export latest result JSON.

- [ ] **Step 4: Preserve local proxy behavior**

Keep `server.js` available for local proxy mode. Update `README.md` later in Task 9 to explain that Vite serves the app and `server.js` remains optional for CORS proxy needs.

- [ ] **Step 5: Verify**

Run: `npm run typecheck`

Expected: no speed-test type errors.

Run: `npm run build`

Expected: production build succeeds if all tools have been migrated.

- [ ] **Step 6: Commit**

```bash
git add src/tools/speed-test server.js
git commit -m "refactor: migrate speed test tool to React"
```

---

### Task 8: Remove Legacy Wiring And Update Deployment

**Files:**
- Delete: `app.js`
- Delete: `src/core/app-state.js`
- Delete: `src/core/router.js`
- Delete: `src/core/registry.js`
- Delete: `src/shared/dom-cache.js`
- Modify: `.github/workflows/*.yml`
- Modify: `README.md`
- Modify: `src/tools/README.md`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: working Vite app from earlier tasks.
- Produces: deployment workflow that builds and uploads `dist`.

- [ ] **Step 1: Verify no legacy imports remain**

Run: `rg -n "dom-cache|initRouter|data-view-link|tool-view|src/core|app-state" .`

Expected: matches only in deleted files or old documentation before this task.

- [ ] **Step 2: Delete legacy wiring files**

Remove old router, app state, registry, DOM cache, and root `app.js`.

- [ ] **Step 3: Update GitHub Pages workflow**

Modify the deploy workflow so it runs:

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm
- name: Install dependencies
  run: npm ci
- name: Build
  run: npm run build
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: dist
```

- [ ] **Step 4: Update docs**

Update `README.md` to describe:

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- GitHub Pages deploys `dist`
- `server.js` is optional and only useful for local proxy mode

Update `src/tools/README.md` so new tools use `meta.ts`, `logic.ts`, and `Tool.tsx`.

- [ ] **Step 5: Update ignore rules**

Add these entries to `.gitignore`:

```gitignore
node_modules/
dist/
```

- [ ] **Step 6: Verify**

Run: `rg -n "dom-cache|initRouter|data-view-link|tool-view|src/core|app-state" .`

Expected: no matches except historical docs under `docs/superpowers`.

Run: `npm run build`

Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove legacy static wiring and update deployment"
```

---

### Task 9: Final Verification And Browser Smoke Test

**Files:**
- Modify only files needed to fix verification failures.

**Interfaces:**
- Consumes: complete React app.
- Produces: verified migration.

- [ ] **Step 1: Run automated checks**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: all commands pass.

- [ ] **Step 2: Start local preview**

Run: `npm run dev`

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 3: Browser smoke test**

Open the local URL and verify:

- Home page renders.
- Search filters tools by `json`.
- Category filter narrows visible cards.
- Favorite toggle persists after refresh.
- Opening two tools updates recent tools.
- JSON formatter formats `{"a":1}`.
- URL parser parses `https://example.com?a=1`.
- UUID generator creates at least one UUID.
- Speed test page loads without starting a benchmark.
- Dark theme and compact density preferences apply.

- [ ] **Step 4: Fix any regressions**

For each failed smoke check, edit only the relevant component or logic module, then rerun:

```bash
npm test
npm run typecheck
npm run build
```

Expected: all commands pass before committing.

- [ ] **Step 5: Commit final fixes**

```bash
git add -A
git commit -m "fix: complete React platform migration verification"
```

If no files changed during final verification, do not create an empty commit.

---

## Self-Review

- Spec coverage: The plan covers Vite, React, TypeScript, static GitHub Pages output, all current tools, registry-driven routing, search, categories, favorites, recent tools, preferences, local storage, error handling, tests, and deployment.
- Scope: The plan does not add new tools, does not introduce a backend, and does not preserve old DOM mounting.
- Type consistency: Registry types, route helpers, storage hooks, and tool exports use stable names across tasks.
- Placeholder scan: The plan avoids open-ended placeholder items. Tool parity is listed explicitly for every existing tool.
