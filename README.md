# AI 工具箱

这是一个可发布到 GitHub Pages 的纯静态 AI 工具集合。主页提供工具导航，当前已内置“大模型速度测试台”，后续可以继续扩展更多子工具。

## 快速开始

### GitHub Pages 发布

1. 把本项目推送到 GitHub 仓库。
2. 打开仓库 `Settings` → `Pages`。
3. `Build and deployment` 选择 `Deploy from a branch`。
4. Branch 选择 `main`，目录选择 `/root`。
5. 保存后访问 GitHub Pages 生成的页面地址。

GitHub Pages 是纯静态托管，页面会直接从浏览器请求你填写的 API 地址。目标接口需要允许浏览器跨域请求，否则会被 CORS 拦截。

### 本地预览

直接双击 `index.html` 可以打开页面；如果目标接口不允许跨域，可以使用本地代理模式：

```bash
node server.js
```

访问 http://localhost:8080

## 使用步骤

### 工具导航

- 访问首页后会先看到工具导航。
- 点击“大模型速度测试台”进入测速子工具。
- 页面使用 Hash 路由，例如 `#home` 和 `#speed-test`，适合 GitHub Pages 静态发布。

### 大模型速度测试台

1. **配置接口**
   - 选择 `OpenAI 兼容` 或 `Anthropic`
   - 填写 Base URL（如 `https://api.example.com/v1` 或 `https://api.anthropic.com/v1`）
   - 点击"获取模型列表"按钮
   - 从下拉框选择模型

2. **设置测试参数**
   - 填写测试提示词
   - 调整正式轮数

3. **开始测速**
   - 点击"开始测速"按钮
   - 查看实时结果和汇总数据

## 功能特性

- 工具首页统一导航，后续可以继续添加子工具
- Hash 路由切换工具，不依赖后端路由
- 支持多个 `OpenAI 兼容接口`
- 支持多个 `Anthropic` 模型
- **自动获取模型列表**，无需手动输入
- 统一提示词和参数配置
- 输出 `TTFT`、总耗时、`tokens/s`
- 导出本次测速 JSON

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.html` | 工具箱主页和子工具页面结构 |
| `app.js` | 导航切换和工具核心逻辑 |
| `styles.css` | 工具箱和子工具样式 |
| `server.js` | 可选的 Node.js 本地代理服务器 |

## 注意事项

### 1. GitHub Pages 与 CORS

GitHub Pages 只能托管静态文件，不能运行 Node.js 代理。页面会直接请求你填写的 API 地址，因此 API 服务必须允许跨域请求。

如果你遇到跨域错误，可以：
- 使用支持浏览器 CORS 的 API 网关
- 在本地运行 `node server.js` 使用本地代理
- 自行部署一个后端代理服务

### 2. API Key 安全

页面会直接把请求发到你填写的接口地址，API Key 只保存在浏览器内存中，不会被持久化存储。

### 3. Token 数来源

页面优先使用接口官方返回的 token 信息：
- OpenAI 兼容接口：`usage.prompt_tokens / usage.completion_tokens`
- Anthropic：`usage.input_tokens / usage.output_tokens`

如果接口没返回，就退化为页面内的粗略估算值。
