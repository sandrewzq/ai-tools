// @ts-nocheck
export const CATEGORIES = [
  { key: "all", label: "全部" },
  { key: "writing", label: "写作" },
  { key: "coding", label: "编程" },
  { key: "translate", label: "翻译" },
  { key: "analysis", label: "分析" },
  { key: "creative", label: "创意" },
  { key: "productivity", label: "效率" },
];

export const TEMPLATES = [
  // ===== 写作 (5) =====
  {
    id: "w01",
    category: "writing",
    title: "文章润色助手",
    tags: ["写作", "润色", "编辑"],
    prompt:
      "你是一位资深中文编辑。请帮我润色以下文章，要求：\n1. 修正语法和错别字\n2. 优化句式使其更流畅\n3. 保持原意不变\n4. 必要时调整段落结构\n\n文章内容：\n{{text}}",
    description: "润色和优化文章，修正语法错误，提升表达质量。",
  },
  {
    id: "w02",
    category: "writing",
    title: "小红书种草文案",
    tags: ["写作", "小红书", "营销"],
    prompt:
      "你是一位小红书爆款文案写手。请根据以下产品信息，写一篇小红书风格的种草笔记：\n\n产品：{{product}}\n核心卖点：{{features}}\n\n要求：\n- 语气活泼、亲切、有分享感\n- 使用 emoji 增强表现力\n- 包含 3-5 个相关话题标签\n- 200-500 字\n- 真实接地气，避免过于广告化",
    description: "根据产品信息生成小红书风格的种草文案，含热门标签。",
  },
  {
    id: "w03",
    category: "writing",
    title: "邮件撰写助手",
    tags: ["写作", "邮件", "商务"],
    prompt:
      "你是一位专业商务助理。请帮我写一封邮件：\n\n收件人：{{recipient}}\n场景：{{context}}\n语气：{{tone}}（正式/半正式/友好）\n\n要求：\n- 主题行清晰明了\n- 开头问候得体\n- 正文简洁高效\n- 结尾礼貌专业",
    description: "根据收件人和场景生成专业商务邮件。",
  },
  {
    id: "w04",
    category: "writing",
    title: "周报/日报生成器",
    tags: ["写作", "职场", "汇报"],
    prompt:
      "你是一位高效的工作汇报助手。请根据我提供的工作要点，生成一份结构清晰的{{type}}（周报/日报）：\n\n工作内容：\n{{items}}\n\n要求：\n1. 按优先级排列\n2. 已完成 / 进行中 / 计划中 三段式结构\n3. 量化成果，避免模糊描述\n4. 语言简洁专业",
    description: "将工作要点转换为结构清晰的周报或日报。",
  },
  {
    id: "w05",
    category: "writing",
    title: "演讲稿撰写",
    tags: ["写作", "演讲", "表达"],
    prompt:
      "你是一位专业演讲稿撰写人。请帮我写一篇演讲稿：\n\n主题：{{topic}}\n场合：{{occasion}}\n时长：{{duration}}分钟\n受众：{{audience}}\n\n要求：\n- 开场有吸引力，快速抓住注意力\n- 主体 3 个核心要点，每点有案例支撑\n- 结尾有力，留下深刻印象\n- 语言口语化，便于朗读",
    description: "根据主题和场合生成结构完整的演讲稿。",
  },

  // ===== 编程 (4) =====
  {
    id: "c01",
    category: "coding",
    title: "代码注释生成",
    tags: ["编程", "注释", "文档"],
    prompt:
      "你是一位资深软件工程师。请为以下代码添加清晰的中文注释：\n\n```{{language}}\n{{code}}\n```\n\n要求：\n- 解释核心逻辑和算法思路\n- 标注关键变量和函数的用途\n- 复杂的部分添加行内注释\n- 保持注释简洁，不重复代码本身表达的内容",
    description: "为代码添加清晰的中文注释，解释核心逻辑。",
  },
  {
    id: "c02",
    category: "coding",
    title: "代码审查助手",
    tags: ["编程", "审查", "质量"],
    prompt:
      "你是一位资深代码审查专家。请审查以下代码，给出改进建议：\n\n```{{language}}\n{{code}}\n```\n\n审查维度：\n- 潜在的 bug 和边界条件\n- 性能优化机会\n- 可读性和可维护性\n- 安全性问题\n- 最佳实践建议\n\n请按优先级排列，严重问题在前。",
    description: "审查代码质量，从多个维度给出改进建议。",
  },
  {
    id: "c03",
    category: "coding",
    title: "正则表达式生成",
    tags: ["编程", "正则", "工具"],
    prompt:
      "你是一位正则表达式专家。请根据以下需求生成匹配正则：\n\n需求：{{requirement}}\n测试用例（应匹配）：\n{{positiveExamples}}\n\n测试用例（不应匹配）：\n{{negativeExamples}}\n\n语言：{{language}}（JavaScript/Python/Java 等）\n\n请输出正则表达式 + 逐段解释。",
    description: "根据需求和测试用例生成精准的正则表达式及解释。",
  },
  {
    id: "c04",
    category: "coding",
    title: "SQL 查询优化",
    tags: ["编程", "SQL", "数据库"],
    prompt:
      "你是一位数据库优化专家。请分析并优化以下 SQL 查询：\n\n数据库：{{dbType}}（MySQL/PostgreSQL 等）\n表结构：\n{{schema}}\n\n原查询：\n```sql\n{{query}}\n```\n\n请提供：\n1. 优化后的 SQL\n2. 建议创建的索引\n3. 优化思路说明\n4. 预估性能提升",
    description: "分析和优化 SQL 查询，提供索引建议和性能评估。",
  },

  // ===== 翻译 (3) =====
  {
    id: "t01",
    category: "translate",
    title: "精准中英互译",
    tags: ["翻译", "中英", "通用"],
    prompt:
      "你是一位专业翻译。请将以下文本从{{sourceLang}}翻译成{{targetLang}}：\n\n{{text}}\n\n要求：\n- 准确传达原意，避免增删信息\n- 符合目标语言的表达习惯\n- 专业术语保持准确\n- 如遇文化差异表达，提供翻译说明",
    description: "高质量中英双向翻译，准确传达原意和语境。",
  },
  {
    id: "t02",
    category: "translate",
    title: "技术文档翻译",
    tags: ["翻译", "技术", "文档"],
    prompt:
      "你是一位技术文档翻译专家。请将以下技术内容从{{sourceLang}}翻译成{{targetLang}}：\n\n{{text}}\n\n要求：\n- 技术术语保持准确或行业通用译法\n- 代码和 API 名称保持原文\n- 句式简洁，便于技术理解\n- 如有歧义处添加译者注",
    description: "技术文档专业翻译，保持术语准确和代码原样。",
  },
  {
    id: "t03",
    category: "translate",
    title: "多语言本地化",
    tags: ["翻译", "本地化", "产品"],
    prompt:
      "你是一位产品本地化专家。请将以下 UI/产品文案从{{sourceLang}}本地化到{{targetLang}}：\n\n{{texts}}\n\n要求：\n- 符合目标市场的文化和用语习惯\n- 保持 UI 简洁性（注意字符长度限制）\n- 按钮和标签用词统一\n- 如有本地化建议请标注",
    description: "产品 UI 文案本地化，适配目标市场文化和用语。",
  },

  // ===== 分析 (4) =====
  {
    id: "a01",
    category: "analysis",
    title: "文本摘要提炼",
    tags: ["分析", "摘要", "阅读"],
    prompt:
      "你是一位信息提炼专家。请对以下文本进行摘要：\n\n{{text}}\n\n要求：\n- 提取 3-5 个核心要点\n- 每条要点 1-2 句话\n- 保留关键数据和人名\n- 用 {{format}} 格式输出（列表/段落）",
    description: "从长文本中提炼核心要点，快速把握关键信息。",
  },
  {
    id: "a02",
    category: "analysis",
    title: "数据分析报告",
    tags: ["分析", "数据", "报告"],
    prompt:
      "你是一位数据分析师。请根据以下数据生成分析报告：\n\n数据：\n{{data}}\n\n背景：{{context}}\n\n请包含：\n1. 数据概览和关键指标\n2. 趋势和异常分析\n3. 对比和关联发现\n4. 行动建议（3-5 条）\n5. 需要进一步关注的问题",
    description: "根据数据生成结构化的分析报告和行动建议。",
  },
  {
    id: "a03",
    category: "analysis",
    title: "竞品对比分析",
    tags: ["分析", "竞品", "商业"],
    prompt:
      "你是一位产品战略分析师。请帮我做竞品对比分析：\n\n我方产品：{{ourProduct}}\n竞品列表：\n{{competitors}}\n\n分析维度：\n- 核心功能对比\n- 定价策略\n- 用户体验差异\n- 市场定位\n- 优劣势总结\n\n请用表格 + 文字总结形式输出。",
    description: "多维度竞品对比分析，含功能、定价、定位等维度。",
  },
  {
    id: "a04",
    category: "analysis",
    title: "用户反馈归类",
    tags: ["分析", "用户", "反馈"],
    prompt:
      "你是一位用户研究员。请对以下用户反馈进行分类和分析：\n\n反馈列表：\n{{feedback}}\n\n要求：\n1. 按类别归类（Bug / 功能需求 / 体验优化 / 赞扬）\n2. 统计各分类数量和占比\n3. 提取高频关键词\n4. 列出最紧急的 3 个问题\n5. 给出改进优先级建议",
    description: "对用户反馈进行分类、统计和优先级排序。",
  },

  // ===== 创意 (4) =====
  {
    id: "cr01",
    category: "creative",
    title: "头脑风暴助手",
    tags: ["创意", "头脑风暴", "思维"],
    prompt:
      "你是一位创新思维教练。请围绕以下主题展开头脑风暴：\n\n主题：{{topic}}\n目标：{{goal}}\n约束条件：{{constraints}}\n\n请从以下角度各给出 3-5 个想法：\n1. 颠覆式创新（大胆、激进）\n2. 跨行业借鉴\n3. 减法思维（去掉什么会更好）\n4. 组合创新（A+B=C）\n\n不评判想法好坏，鼓励发散思维。",
    description: "围绕主题展开多角度头脑风暴，激发创新想法。",
  },
  {
    id: "cr02",
    category: "creative",
    title: "品牌命名生成",
    tags: ["创意", "品牌", "命名"],
    prompt:
      "你是一位品牌命名顾问。请为以下项目生成品牌名称：\n\n行业：{{industry}}\n定位：{{positioning}}\n关键词：{{keywords}}\n风格偏好：{{style}}（现代/复古/国际化/中式等）\n\n要求：\n- 提供 10 个候选名称\n- 每个名称附简短解释（寓意、联想）\n- 标注是否容易发音和记忆\n- 区分中英文候选",
    description: "根据行业和风格生成品牌命名方案，附寓意解释。",
  },
  {
    id: "cr03",
    category: "creative",
    title: "故事大纲生成",
    tags: ["创意", "故事", "写作"],
    prompt:
      "你是一位故事编剧。请根据以下设定生成一个故事大纲：\n\n类型：{{genre}}（科幻/悬疑/爱情/奇幻等）\n核心冲突：{{conflict}}\n世界观/背景：{{setting}}\n\n请包含：\n1. 一句话梗概（Logline）\n2. 主要角色（主角/反派/盟友）\n3. 三幕结构大纲\n4. 关键转折点\n5. 结尾走向",
    description: "根据设定生成完整故事大纲，包括角色和情节结构。",
  },
  {
    id: "cr04",
    category: "creative",
    title: "短视频脚本",
    tags: ["创意", "短视频", "脚本"],
    prompt:
      "你是一位短视频内容策划。请为以下主题创作一个短视频脚本：\n\n主题：{{topic}}\n平台：{{platform}}（抖音/B站/小红书等）\n时长：{{duration}}秒\n\n请包含：\n- 分镜脚本（画面 + 旁白/台词 + 时长）\n- 开头前 3 秒的钩子\n- 结尾的互动引导\n- 建议的 BGM 风格和字幕提示",
    description: "为短视频创作分镜脚本，含钩子和互动引导。",
  },

  // ===== 效率 (5) =====
  {
    id: "p01",
    category: "productivity",
    title: "会议纪要整理",
    tags: ["效率", "会议", "记录"],
    prompt:
      "你是一位高效的会议记录员。请将以下会议内容整理成纪要：\n\n{{rawNotes}}\n\n格式要求：\n- 会议主题和时间\n- 参会人员\n- 讨论要点（按议题分类）\n- 决议事项\n- 待办事项（含负责人和截止日期）\n- 下次会议安排",
    description: "将零散会议记录整理为结构清晰的正式纪要。",
  },
  {
    id: "p02",
    category: "productivity",
    title: "OKR 目标设定",
    tags: ["效率", "OKR", "管理"],
    prompt:
      "你是一位 OKR 教练。请帮我制定 OKR：\n\n团队/个人：{{entity}}\n周期：{{period}}\n重点方向：{{focus}}\n\n要求：\n- Objective：鼓舞人心、有方向感（1-2 个）\n- Key Results：可量化、有挑战（每个 O 对应 3-5 个 KR）\n- 确保 KR 是可衡量的结果而非任务\n- 给出评分标准建议",
    description: "制定鼓舞人心的 OKR，确保目标可量化和可挑战。",
  },
  {
    id: "p03",
    category: "productivity",
    title: "学习计划生成",
    tags: ["效率", "学习", "规划"],
    prompt:
      "你是一位学习规划师。请帮我制定学习计划：\n\n学习目标：{{goal}}\n当前水平：{{currentLevel}}\n可用时间：{{timePerWeek}}\n偏好方式：{{style}}（视频/阅读/实践等）\n\n请输出：\n1. 分阶段里程碑（每月）\n2. 每周学习安排\n3. 推荐学习资源\n4. 检验学习成果的方式\n5. 常见坑和避坑建议",
    description: "制定个性化的分阶段学习计划，含资源推荐和检验方式。",
  },
  {
    id: "p04",
    category: "productivity",
    title: "决策分析框架",
    tags: ["效率", "决策", "思维"],
    prompt:
      "你是一位决策顾问。请帮我分析以下决策：\n\n背景：{{context}}\n选项 A：{{optionA}}\n选项 B：{{optionB}}\n（如有更多选项请补充）\n\n请用以下框架分析：\n1. 各选项的利弊分析\n2. 关键成功因素和风险\n3. 机会成本\n4. 推荐方案及理由\n5. 如果不确定，给出需要补充的信息",
    description: "用结构化框架辅助决策分析，评估利弊和风险。",
  },
  {
    id: "p05",
    category: "productivity",
    title: "知识卡片生成",
    tags: ["效率", "知识", "学习"],
    prompt:
      "你是一位知识管理专家。请将以下知识点整理成知识卡片：\n\n主题：{{topic}}\n原始内容：\n{{content}}\n\n每张知识卡片包含：\n- 核心概念（一句话）\n- 详细解释（2-3 句）\n- 一个类比帮助理解\n- 一个实际应用场景\n- 相关概念链接",
    description: "将知识点整理成结构化卡片，便于记忆和复习。",
  },
];

export function filterTemplates(query, category) {
  let filtered = category === "all" ? [...TEMPLATES] : TEMPLATES.filter((template) => template.category === category);
  if (!query || !query.trim()) return filtered;
  const q = query.trim().toLowerCase();
  return filtered.filter(
    (template) =>
      template.title.toLowerCase().includes(q) ||
      template.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      template.prompt.toLowerCase().includes(q),
  );
}
