export const CATEGORIES = [
  { key: "all", label: "全部" },
  { key: "writing", label: "写作" },
  { key: "coding", label: "编程" },
  { key: "analysis", label: "分析" },
  { key: "productivity", label: "效率" },
];

export const TEMPLATES = [
  {
    id: "writing-polish",
    category: "writing",
    title: "文章润色助手",
    tags: ["写作", "润色"],
    description: "优化文章表达、语法和结构。",
    prompt: "请润色以下内容，保持原意不变，修正语病并提升表达流畅度：\n\n{{text}}",
  },
  {
    id: "code-review",
    category: "coding",
    title: "代码审查助手",
    tags: ["编程", "审查"],
    description: "按严重程度指出代码问题和改进建议。",
    prompt: "请审查以下代码，优先指出 bug、风险、性能问题和缺失测试：\n\n```{{language}}\n{{code}}\n```",
  },
  {
    id: "summary",
    category: "analysis",
    title: "文本摘要提炼",
    tags: ["分析", "摘要"],
    description: "提取长文本的核心要点。",
    prompt: "请将以下内容提炼为 3-5 条核心要点，并保留关键数据：\n\n{{text}}",
  },
  {
    id: "meeting-notes",
    category: "productivity",
    title: "会议纪要整理",
    tags: ["效率", "会议"],
    description: "把会议记录整理为纪要和待办。",
    prompt: "请将以下会议记录整理为：讨论要点、决议、待办事项、负责人和截止时间。\n\n{{rawNotes}}",
  },
];

export function filterTemplates(query: string, category: string) {
  const normalized = query.trim().toLowerCase();
  return TEMPLATES.filter((template) => {
    const categoryMatch = category === "all" || template.category === category;
    const searchText = [template.title, template.description, template.prompt, ...template.tags].join(" ").toLowerCase();
    return categoryMatch && (!normalized || searchText.includes(normalized));
  });
}
