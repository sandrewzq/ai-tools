# 维护手册

这份文档用于后续安全修改项目，重点是避免再次破坏已有工具的样式、交互和发布流程。

## 本地开发

```bash
npm install
npm run dev
```

开发服务默认监听 `127.0.0.1`，按 Vite 输出的地址访问。

## 发布前检查

本地提交前建议按这个顺序跑：

```bash
npm test
npm run typecheck
npm run build
npm run test:browser
npm run test:visual
```

各命令含义：

- `npm test`：源码级测试，覆盖工具注册、共享逻辑、可读中文文案和浏览器测试 helper。
- `npm run typecheck`：TypeScript 项目检查。
- `npm run build`：生产构建，输出到 `dist/`。
- `npm run test:browser`：启动 `vite preview`，用 Playwright 打开所有工具路由，检查控制台错误、乱码、移动端横向溢出和关键 legacy selector。
- `npm run test:visual`：启动 `vite preview`，对首页、配色生成器、JSON 格式化器、时间戳转换器做视觉/布局合同检查。

`npm run build` 目前会有一个 Vite 分包提示：`src/shared/object.ts` 同时被动态和静态导入。只要命令退出码是 0，这个提示不阻塞发布。

## GitHub Pages 发布

发布由 `.github/workflows/pages.yml` 完成，推送到 `main` 后自动执行：

1. `npm ci`
2. `npm test`
3. `npm run typecheck`
4. `npm run build`
5. `npx playwright install --with-deps chromium`
6. `npm run test:browser`
7. `npm run test:visual`
8. 上传 `dist/` 并部署到 GitHub Pages

线上地址：

```text
https://sandrewzq.github.io/ai-tools/
```

如果 Actions 里出现 “Node.js 20 is deprecated” 注解，先看失败步骤。当前项目 workflow 已使用 Node 24；这个注解可能来自 GitHub 官方 action 自身的运行时兼容提示，不等于项目 Node 版本回退。

## 视觉基线

视觉基线文件是：

```text
tests/visual-baselines.json
```

只有在你确认当前 UI 变化是有意的，并且已经人工检查过页面后，才更新基线：

```bash
$env:UPDATE_VISUAL_BASELINES="1"
npm run test:visual
Remove-Item Env:UPDATE_VISUAL_BASELINES
npm run test:visual
```

在 macOS/Linux shell 中：

```bash
UPDATE_VISUAL_BASELINES=1 npm run test:visual
npm run test:visual
```

更新基线后必须检查 diff。正常情况下，只有 `tests/visual-baselines.json` 会变化；如果还改到了业务文件，要确认这些业务变化是本次目标的一部分。

## 浏览器测试 helper

浏览器测试共用：

```text
tests/helpers/browser.mjs
```

主要导出：

- `withPreview(callback)`：找空闲端口，启动 `vite preview`，回调结束后关闭预览服务。
- `launchBrowser(options)`：启动 Playwright Chromium。默认在 Windows 本机可回退到系统 Chrome；视觉测试会关闭这个回退以保持基线稳定。
- `collectConsoleErrors(page, errors)`：收集浏览器 console error 和 page error。

新增浏览器测试时优先复用这些 helper，不要再复制一套 preview/server 管理逻辑。

## 修改工具时的约束

这个项目已经迁移到 React + TypeScript，但要保留原有工具体验。修改时遵守：

- 不要为了“顺手优化”改动全局配色、布局、按钮样式或工具结构。
- 不要删除现有 className，浏览器 smoke 和视觉测试依赖这些 legacy selector 防回归。
- 工具之间不要直接互相引用；共享能力放在 `src/shared/`，通用 UI 放在 `src/components/`。
- 新工具注册入口是 `src/app/tool-registry.ts`。
- 每个工具放在 `src/tools/<tool-id>/`，复杂逻辑放到同目录 `logic.ts`。

## CI 失败排查

按失败步骤判断：

- `Run source tests` 失败：先看 `tests/*.test.mjs` 的断言，多数是注册、文案或 helper 合同问题。
- `Typecheck` 失败：先修类型，不要用 `any` 掩盖跨模块契约。
- `Build` 失败：确认 Vite/TypeScript 错误，不要只看最后一行。
- `Run browser smoke tests` 失败：通常是路由加载失败、控制台错误、移动端横向溢出或 legacy selector 丢失。
- `Run visual regression tests` 失败：先判断是否是有意 UI 变化。有意变化才更新基线；无意变化应修回样式或结构。

## 发布后检查

每次发布后至少确认：

```bash
gh run list --repo sandrewzq/ai-tools --branch main --limit 3
```

并访问线上首页：

```text
https://sandrewzq.github.io/ai-tools/
```

重点人工检查：

- 首页工具导航是否正常。
- 配色生成器是否仍保留模式切换、预览和复制区域。
- JSON、时间戳、Prompt、测速等核心工具是否能打开并完成主要操作。
