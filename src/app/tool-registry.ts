import { lazy } from "react";
import type { ToolDefinition } from "./tool-types";

export const tools: ToolDefinition[] = [
  {
    meta: {
      id: "speed-test",
      route: "speed-test",
      title: "大模型测速",
      category: "benchmark",
      description: "测试 OpenAI、Anthropic、Ollama 兼容接口的流式响应速度。",
      tags: ["LLM", "测速", "API"],
    },
    Component: lazy(() => import("./../tools/speed-test/Tool")),
  },
  {
    meta: {
      id: "color-palette",
      route: "color-palette",
      title: "配色生成器",
      category: "design",
      description: "生成可用于界面的配色方案和 CSS 变量。",
      tags: ["颜色", "设计", "CSS"],
    },
    Component: lazy(() => import("./../tools/color-palette/Tool")),
  },
  {
    meta: {
      id: "prompt-templates",
      route: "prompt-templates",
      title: "提示词模板",
      category: "text",
      description: "搜索、复制和收藏常用提示词模板。",
      tags: ["Prompt", "模板", "AI"],
    },
    Component: lazy(() => import("./../tools/prompt-templates/Tool")),
  },
  {
    meta: {
      id: "text-chunker",
      route: "text-chunker",
      title: "文本分块",
      category: "text",
      description: "按字符、段落或预估 token 将长文本拆成块。",
      tags: ["文本", "分块", "Token"],
    },
    Component: lazy(() => import("./../tools/text-chunker/Tool")),
  },
  {
    meta: {
      id: "text-differ",
      route: "text-differ",
      title: "文本对比",
      category: "text",
      description: "比较两段文本并标记新增、删除和未变化内容。",
      tags: ["Diff", "文本", "对比"],
    },
    Component: lazy(() => import("./../tools/text-differ/Tool")),
  },
  {
    meta: {
      id: "token-calculator",
      route: "token-calculator",
      title: "Token 计算",
      category: "text",
      description: "估算文本 token、字符、词数和模型成本。",
      tags: ["Token", "成本", "文本"],
    },
    Component: lazy(() => import("./../tools/token-calculator/Tool")),
  },
  {
    meta: {
      id: "json-formatter",
      route: "json-formatter",
      title: "JSON 格式化",
      category: "data",
      description: "格式化、压缩、校验并分析 JSON。",
      tags: ["JSON", "格式化", "校验"],
    },
    Component: lazy(() => import("./../tools/json-formatter/Tool")),
  },
  {
    meta: {
      id: "regex-tester",
      route: "regex-tester",
      title: "正则测试",
      category: "text",
      description: "测试正则表达式并高亮匹配结果。",
      tags: ["正则", "Regex", "匹配"],
    },
    Component: lazy(() => import("./../tools/regex-tester/Tool")),
  },
  {
    meta: {
      id: "encoding-converter",
      route: "encoding-converter",
      title: "编码转换",
      category: "encoding",
      description: "进行 Base64、URL、HTML 和 Unicode 编码转换。",
      tags: ["Base64", "URL", "HTML"],
    },
    Component: lazy(() => import("./../tools/encoding-converter/Tool")),
  },
  {
    meta: {
      id: "timestamp-converter",
      route: "timestamp-converter",
      title: "时间戳转换器",
      category: "time",
      description: "在时间戳、日期和时区之间转换。",
      tags: ["时间戳", "日期", "时区"],
    },
    Component: lazy(() => import("./../tools/timestamp-converter/Tool")),
  },
  {
    meta: {
      id: "curl-converter",
      route: "curl-converter",
      title: "cURL 转代码",
      category: "network",
      description: "把 cURL 命令转换为 fetch、Python 和 Go 示例。",
      tags: ["cURL", "HTTP", "代码"],
    },
    Component: lazy(() => import("./../tools/curl-converter/Tool")),
  },
  {
    meta: {
      id: "qr-generator",
      route: "qr-generator",
      title: "二维码生成",
      category: "encoding",
      description: "生成文本或链接二维码并下载图片。",
      tags: ["QR", "二维码", "图片"],
    },
    Component: lazy(() => import("./../tools/qr-generator/Tool")),
  },
  {
    meta: {
      id: "uuid-generator",
      route: "uuid-generator",
      title: "UUID 生成",
      category: "data",
      description: "批量生成 UUID v4 或 v7。",
      tags: ["UUID", "ID", "生成"],
    },
    Component: lazy(() => import("./../tools/uuid-generator/Tool")),
  },
  {
    meta: {
      id: "hash-generator",
      route: "hash-generator",
      title: "哈希生成",
      category: "security",
      description: "生成 MD5、SHA 系列哈希摘要。",
      tags: ["Hash", "MD5", "SHA"],
    },
    Component: lazy(() => import("./../tools/hash-generator/Tool")),
  },
  {
    meta: {
      id: "jwt-debugger",
      route: "jwt-debugger",
      title: "JWT 调试",
      category: "security",
      description: "解析 JWT Header、Payload 并校验 HS256 签名。",
      tags: ["JWT", "Token", "安全"],
    },
    Component: lazy(() => import("./../tools/jwt-debugger/Tool")),
  },
  {
    meta: {
      id: "cron-parser",
      route: "cron-parser",
      title: "Cron 解析",
      category: "time",
      description: "解析 Cron 表达式字段和含义。",
      tags: ["Cron", "定时", "表达式"],
    },
    Component: lazy(() => import("./../tools/cron-parser/Tool")),
  },
  {
    meta: {
      id: "color-converter",
      route: "color-converter",
      title: "颜色转换",
      category: "design",
      description: "在 HEX、RGB、HSL 格式间转换颜色。",
      tags: ["颜色", "HEX", "RGB"],
    },
    Component: lazy(() => import("./../tools/color-converter/Tool")),
  },
  {
    meta: {
      id: "yaml-formatter",
      route: "yaml-formatter",
      title: "YAML 格式化",
      category: "data",
      description: "格式化 YAML，并在 YAML 和 JSON 间转换。",
      tags: ["YAML", "JSON", "格式化"],
    },
    Component: lazy(() => import("./../tools/yaml-formatter/Tool")),
  },
  {
    meta: {
      id: "xml-formatter",
      route: "xml-formatter",
      title: "XML 格式化",
      category: "data",
      description: "格式化、压缩 XML，并转换为 JSON 树。",
      tags: ["XML", "JSON", "格式化"],
    },
    Component: lazy(() => import("./../tools/xml-formatter/Tool")),
  },
  {
    meta: {
      id: "url-parser",
      route: "url-parser",
      title: "URL 解析",
      category: "network",
      description: "拆解 URL 组成部分、查询参数和重建参数。",
      tags: ["URL", "Query", "网络"],
    },
    Component: lazy(() => import("./../tools/url-parser/Tool")),
  },
  {
    meta: {
      id: "csv-converter",
      route: "csv-converter",
      title: "CSV 转换",
      category: "data",
      description: "解析 CSV，预览表格并转换为 JSON。",
      tags: ["CSV", "JSON", "表格"],
    },
    Component: lazy(() => import("./../tools/csv-converter/Tool")),
  },
];

export const toolIds = tools.map((tool) => tool.meta.id);
