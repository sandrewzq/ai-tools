# Token 计算器 — 设计文档

## 概述

为 AI 工具箱新增一个「Token 计算器」工具，帮助用户估算文本在不同模型下的 token 消耗。

## 布局

采用**纵向流式布局（方案 A）**：
- 顶部：大文本输入区（textarea）
- 中部：模型选择 + 清空按钮
- 下部：4 列统计卡片（Tokens / 字符数 / 中文字数 / 英文词数）
- 底部：编码器名称 + 预估价格

## Token 估算策略

采用**启发式估算法**（纯前端，零依赖）：

| 字符类型 | Token 系数 | 说明 |
|---|---|---|
| 中文字符 `[\u4e00-\u9fff]` | 1.5 | 每个汉字约 1.5 tokens |
| 英文单词 `[a-zA-Z]+(?:'[a-zA-Z]+)?` | 1.3 | 含缩写如 don't |
| 数字/标点/其他 | 0.5 | 标点和数字 token 化效率较高 |

> 模型差异通过调整系数体现（如 GPT-4o 使用 o200k_base 编码器对中文更友好）。

## 模型配置

预设以下模型及其价格（每 1K tokens）：

| 模型 | 编码器 | Input 价格 | Output 价格 |
|---|---|---|---|
| GPT-4o | o200k_base | $0.0050 | $0.0150 |
| GPT-4o-mini | o200k_base | $0.00015 | $0.00060 |
| GPT-4-turbo | cl100k_base | $0.0100 | $0.0300 |
| GPT-3.5-turbo | cl100k_base | $0.0015 | $0.0020 |
| Claude 3.5 Sonnet | — | $0.0030 | $0.0150 |
| Claude 3 Opus | — | $0.0150 | $0.0750 |

## 文件结构

```
src/tools/token-calculator/
├── index.js     # meta + init/destroy + 事件绑定 + 实时计算
├── data.js      # 模型配置 + 估算算法
└── render.js    # 渲染统计卡片 + 详情行
```

## 需要修改的现有文件

| 文件 | 改动 |
|---|---|
| `index.html` | 新增 token-calculator view HTML + 导航标签 + 首页卡片 |
| `styles.css` | 新增 token-calculator 专用样式 |
| `src/core/registry.js` | 注册新工具 meta |
| `src/shared/dom-cache.js` | 添加 DOM 节点引用 |
| `app.js` | 注册生命周期 |

## 交互行为

- **实时计算**：textarea 输入时防抖 300ms 自动重算
- **模型切换**：切换模型后立即重算
- **清空**：清空输入和统计
- **响应式**：4 列统计卡片在窄屏自动变为 2 列
