const FIELD_DEFS = [
  { key: "minute", label: "分钟", min: 0, max: 59 },
  { key: "hour", label: "小时", min: 0, max: 23 },
  { key: "day", label: "日期", min: 1, max: 31 },
  { key: "month", label: "月份", min: 1, max: 12 },
  { key: "weekday", label: "星期", min: 0, max: 6 },
];

function validateToken(token: string, field: (typeof FIELD_DEFS)[number]) {
  for (const part of token.split(",")) {
    if (part === "*") continue;
    const stepMatch = part.match(/^(\*|\d+-\d+|\d+)\/(\d+)$/);
    if (stepMatch) {
      if (Number(stepMatch[2]) < 1) return `${field.label}步进无效：${part}`;
      continue;
    }
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      if (start > end || start < field.min || end > field.max) return `${field.label}范围无效：${part}`;
      continue;
    }
    if (/^\d+$/.test(part)) {
      const value = Number(part);
      if (value < field.min || value > field.max) return `${field.label}超出范围 ${field.min}-${field.max}`;
      continue;
    }
    return `${field.label}格式无效：${part}`;
  }
  return null;
}

function describe(token: string, label: string) {
  if (token === "*") return `每${label}`;
  if (token.includes("/")) return `${label}按 ${token} 执行`;
  if (token.includes("-")) return `${label}${token.replace("-", " 到 ")}`;
  if (token.includes(",")) return `${label}${token.split(",").join("、")}`;
  return `${label}${token}`;
}

export function parseCron(expression: string) {
  const raw = expression.trim();
  if (!raw) return { error: "请输入 Cron 表达式" };
  const parts = raw.split(/\s+/);
  if (parts.length !== 5) return { error: "当前版本仅支持 5 段 Cron 表达式" };
  const fields = FIELD_DEFS.map((field, index) => ({ ...field, token: parts[index], description: describe(parts[index], field.label) }));
  for (const field of fields) {
    const error = validateToken(field.token, field);
    if (error) return { error };
  }
  const summary = fields.map((field) => field.description).join("，");
  return { error: null, expression: raw, fields, summary: `${summary} 执行` };
}

export const CRON_EXAMPLES = [
  { label: "工作日上午九点", value: "0 9 * * 1-5" },
  { label: "每小时整点", value: "0 * * * *" },
  { label: "每 15 分钟", value: "*/15 * * * *" },
  { label: "每月 1 号零点", value: "0 0 1 * *" },
];
