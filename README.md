# AI 工具箱

一个可部署到 GitHub Pages 的纯静态 AI/开发工具集合。项目已迁移为 Vite + React + TypeScript，所有工具都在浏览器本地运行，个性化数据保存在 `localStorage`。

## 本地开发

```bash
npm install
npm run dev
```

默认访问 Vite 输出的本地地址，例如 `http://127.0.0.1:5173/`。

## 构建与预览

```bash
npm run build
npm run preview
```

生产构建输出到 `dist/`，GitHub Pages workflow 会上传该目录。

## 测试

```bash
npm test
npm run typecheck
npm run build
npm run test:browser
npm run test:visual
```

更多发布、视觉基线和 CI 排查说明见 [维护手册](docs/maintenance.md)。

## 工具架构

- `src/app/tool-registry.ts` 是唯一工具注册入口。
- 每个工具位于 `src/tools/<tool-id>/`。
- 工具目录至少包含 `Tool.tsx`，复杂工具把纯逻辑放到 `logic.ts`。
- 共享能力放在 `src/shared/`，共享 UI 放在 `src/components/`。
- 工具之间不要直接互相引用。

## 已包含工具

- 大模型测速
- 配色生成器、颜色转换
- 提示词模板、文本分块、文本比对、Token 计算
- JSON、YAML、XML、CSV、URL 工具
- 正则测试、编码转换、时间戳转换、cURL 转代码
- 二维码、UUID、哈希、JWT、Cron 工具

## GitHub Pages

当前 workflow 使用 Node 24：

1. `npm ci`
2. `npm test`
3. `npm run typecheck`
4. `npm run build`
5. `npm run test:browser`
6. `npm run test:visual`
7. 上传 `dist/`
8. 部署到 GitHub Pages

如果仓库发布在子路径下，`vite.config.ts` 当前使用 `base: "./"`，构建产物可在静态子路径中解析资源。

## 本地代理

`server.js` 仍作为可选的本地 CORS 代理保留，主要用于大模型测速时调试不支持浏览器跨域的接口。线上 GitHub Pages 不运行该代理。
