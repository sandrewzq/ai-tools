# AI 工具箱：渐进式重构设计

**日期**: 2026-06-03
**目标**: 将 `app.js`（1689 行）拆分为职责清晰的模块

## 背景

当前项目存在以下问题：
- `app.js` 同时包含路由、配色工具、测速工具、DOM 查询、事件绑定，职责不清
- 两个工具的逻辑互相穿插，新增工具困难
- DOM 查询集中在入口处，难以维护
- 没有统一的状态管理

## 目标

1. **架构解耦**：按工具拆分，每个工具独立管理自己的状态、渲染、事件
2. **性能优化**：减少 DOM 操作、事件委托、缓存计算结果
3. **代码质量**：消除重复逻辑、统一命名规范
4. **用户体验**：保持零依赖、GitHub Pages 直接可用

## 约束

- 纯静态网站，零 npm 依赖
- 继续使用原生 ES Modules
- GitHub Pages 直接可用，无需构建步骤

## 新目录结构

```
src/
├── core/
│   ├── registry.js          # 工具注册表（已有）
│   ├── router.js            # Hash 路由逻辑
│   └── app-state.js         # 极简全局状态（当前视图）
├── shared/
│   ├── dom-cache.js         # DOM 元素缓存（按视图分组）
│   ├── color.js             # 已有
│   ├── format.js            # 已有
│   └── ...                  # 其他已有
├── tools/
│   ├── color-palette/
│   │   ├── index.js         # init/destroy + 事件绑定
│   │   ├── palette-data.js  # 预设 + 生成逻辑
│   │   └── render.js         # DOM 渲染
│   └── speed-test/
│       ├── index.js          # init/destroy + 事件绑定
│       ├── benchmark.js       # 核心测速逻辑
│       ├── providers.js       # 三个 provider 函数
│       └── model-fetcher.js  # 获取模型列表
└── app.js                   # 精简入口
```

## 模块职责

### core/router.js
- 监听 `hashchange`
- 根据 `registry` 映射到对应工具
- 切换视图时调用旧工具的 `destroy()` 和新工具的 `init()`

### core/app-state.js
- 仅存储 `currentView`
- 后续如有真实共享需求再扩展

### core/dom-cache.js
- 页面加载时一次性查询所有 DOM 元素
- 按视图分组（home、speedTest、colorPalette）
- 工具只导入自己需要的 DOM 组

### tools/*/index.js
- 暴露 `init()` 和 `destroy()` 方法
- 绑定事件监听器
- 工具内部状态自治

### tools/speed-test/providers.js
- 包含 `runOpenAiBenchmark`、`runAnthropicBenchmark`、`runOllamaBenchmark`
- 提取公共流处理逻辑为 `readStream()` 通用函数
- 返回统一格式的 `BenchmarkResult`

## 性能优化

| 优化项 | 实现方式 |
|--------|----------|
| DOM 批量操作 | 配色色板渲染使用 `DocumentFragment` |
| 事件委托 | 色板复制按钮、测速卡片删除使用委托 |
| 配色缓存 | 相同参数直接返回缓存结果 |
| DOM 查询缓存 | 一次性查询后不复用 |

## 实施顺序

1. 创建 `docs/superpowers/specs/` 目录并提交设计文档
2. 提取 `palette-data.js` — 纯数据迁移，风险最低
3. 拆分配色工具 — 验证工具生命周期模式
4. 拆分测速工具 — 核心逻辑，最复杂
5. 提取 `router.js` 和 `app-state.js`
6. 精简 `app.js` — 收尾
7. 自检并提交

## 关键设计决策

| 问题 | 决策 |
|------|------|
| Provider 分文件还是合并？ | 合并为 `providers.js`，减少碎片 |
| `events.js` 是否独立？ | 合并到 `index.js`，保持简洁 |
| `render.js` 和 `benchmark.js` 是否合并？ | 合并为 `benchmark.js`，渲染和逻辑耦合紧密 |
| 是否引入 TypeScript？ | 否，保持零依赖 |
| 是否引入构建工具？ | 否，保持纯静态 |

## 预期成果

- `app.js` 从 1689 行缩减到 ~100 行
- 每个工具独立自治，新增工具只需在 `src/tools/` 下创建目录
- 代码可读性和可维护性显著提升
- 保持 GitHub Pages 零配置部署
