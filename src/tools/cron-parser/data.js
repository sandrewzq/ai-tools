const FIELD_DEFS = [
  { key: "minute", label: "分钟", min: 0, max: 59 },
  { key: "hour", label: "小时", min: 0, max: 23 },
  { key: "day", label: "日期", min: 1, max: 31 },
  { key: "month", label: "月份", min: 1, max: 12 },
  { key: "weekday", label: "星期", min: 0, max: 6 },
];

const WEEKDAY_LABELS = {
  0: "周日",
  1: "周一",
  2: "周二",
  3: "周三",
  4: "周四",
  5: "周五",
  6: "周六",
};

function isWildcard(token) {
  return token === "*";
}

function isNumberToken(token) {
  return /^\d+$/.test(token);
}

function isRangeToken(token) {
  return /^\d+-\d+$/.test(token);
}

function isStepToken(token) {
  return /^(\*|\d+-\d+|\d+)\/\d+$/.test(token);
}

function validateSingleToken(token, field) {
  const parts = token.split(",");
  for (const part of parts) {
    if (isWildcard(part)) continue;

    if (isNumberToken(part)) {
      const value = Number(part);
      if (value < field.min || value > field.max) {
        return `${field.label}超出范围 ${field.min}-${field.max}`;
      }
      continue;
    }

    if (isRangeToken(part)) {
      const [start, end] = part.split("-").map(Number);
      if (start > end || start < field.min || end > field.max) {
        return `${field.label}范围无效：${part}`;
      }
      continue;
    }

    if (isStepToken(part)) {
      const [base, stepRaw] = part.split("/");
      const step = Number(stepRaw);
      if (step < 1) return `${field.label}步进无效：${part}`;

      if (base !== "*" && isRangeToken(base)) {
        const [start, end] = base.split("-").map(Number);
        if (start > end || start < field.min || end > field.max) {
          return `${field.label}步进范围无效：${part}`;
        }
      }

      if (base !== "*" && isNumberToken(base)) {
        const value = Number(base);
        if (value < field.min || value > field.max) {
          return `${field.label}步进起点无效：${part}`;
        }
      }
      continue;
    }

    return `${field.label}格式无效：${part}`;
  }

  return null;
}

function weekdayText(token) {
  if (token === "1-5") return "周一到周五";
  if (token === "0,6" || token === "6,0") return "周末";
  if (isNumberToken(token) && WEEKDAY_LABELS[token]) return WEEKDAY_LABELS[token];
  if (isRangeToken(token)) {
    const [start, end] = token.split("-");
    if (WEEKDAY_LABELS[start] && WEEKDAY_LABELS[end]) {
      return `${WEEKDAY_LABELS[start]}到${WEEKDAY_LABELS[end]}`;
    }
  }
  return token;
}

function describeField(token, field) {
  if (token === "*") {
    if (field.key === "minute") return "每分钟";
    if (field.key === "hour") return "每小时";
    if (field.key === "day") return "每天";
    if (field.key === "month") return "每月";
    if (field.key === "weekday") return "每天";
  }

  if (isNumberToken(token)) {
    if (field.key === "weekday") return weekdayText(token);
    return `${field.label}${token}`;
  }

  if (isRangeToken(token)) {
    if (field.key === "weekday") return weekdayText(token);
    const [start, end] = token.split("-");
    return `${field.label}${start}到${end}`;
  }

  if (isStepToken(token)) {
    const [base, step] = token.split("/");
    if (base === "*") {
      if (field.key === "minute") return `每隔 ${step} 分钟`;
      if (field.key === "hour") return `每隔 ${step} 小时`;
      return `每隔 ${step} ${field.label}`;
    }
    return `${describeField(base, field)}，每隔 ${step} ${field.label}`;
  }

  if (token.includes(",")) {
    if (field.key === "weekday") {
      return token
        .split(",")
        .map((part) => weekdayText(part))
        .join("、");
    }
    return `${field.label}${token.split(",").join("、")}`;
  }

  return token;
}

function buildSummary(fields) {
  const minute = fields[0].token;
  const hour = fields[1].token;
  const day = fields[2].token;
  const month = fields[3].token;
  const weekday = fields[4].token;

  if (isNumberToken(minute) && isNumberToken(hour) && day === "*" && month === "*" && weekday === "*") {
    return `每天 ${hour.padStart(2, "0")}:${minute.padStart(2, "0")} 执行一次`;
  }

  if (isNumberToken(minute) && isNumberToken(hour) && day === "*" && month === "*" && weekday === "1-5") {
    return `每周一到周五 ${hour.padStart(2, "0")}:${minute.padStart(2, "0")} 执行一次`;
  }

  if (minute === "*/15" && hour === "*" && day === "*" && month === "*" && weekday === "*") {
    return "每 15 分钟执行一次";
  }

  return `${fields.map((field) => field.description).join("，")} 执行`;
}

export function parseCron(expression) {
  const raw = expression.trim();
  if (!raw) {
    return { error: "请输入 Cron 表达式" };
  }

  const parts = raw.split(/\s+/);
  if (parts.length !== 5) {
    return { error: "当前版本仅支持 5 段 Cron 表达式" };
  }

  const fields = FIELD_DEFS.map((field, index) => {
    const token = parts[index];
    return {
      ...field,
      token,
      description: describeField(token, field),
    };
  });

  for (const field of fields) {
    const error = validateSingleToken(field.token, field);
    if (error) return { error };
  }

  return {
    expression: raw,
    fields,
    summary: buildSummary(fields),
  };
}

export const CRON_EXAMPLES = [
  { label: "工作日上午九点", value: "0 9 * * 1-5" },
  { label: "每小时整点", value: "0 * * * *" },
  { label: "每 15 分钟", value: "*/15 * * * *" },
  { label: "每月 1 号零点", value: "0 0 1 * *" },
];
