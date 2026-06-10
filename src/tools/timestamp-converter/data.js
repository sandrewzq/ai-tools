// 时间戳转换核心

const TZ_OPTIONS = [
  { id: "utc", label: "UTC (GMT+0)" },
  { id: "local", label: "本地时区" },
  { id: "Asia/Shanghai", label: "Asia/Shanghai (GMT+8)" },
  { id: "America/New_York", label: "America/New_York (GMT-5)" },
  { id: "America/Los_Angeles", label: "America/Los_Angeles (GMT-8)" },
  { id: "Europe/London", label: "Europe/London (GMT+0/+1)" },
  { id: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" },
  { id: "Europe/Berlin", label: "Europe/Berlin (GMT+1/+2)" },
];

export function getTimezoneOptions() {
  return TZ_OPTIONS;
}

export function nowTimestamp(unit = "s") {
  return unit === "ms" ? Date.now() : Math.floor(Date.now() / 1000);
}

export function timestampToDate(ts, tz = "local") {
  if (!ts && ts !== 0) return null;

  let num = Number(ts);
  if (isNaN(num)) return { error: "无效的时间戳" };

  // 判断是秒还是毫秒
  const asMs = num > 1e12 ? num : num * 1000;
  const date = new Date(asMs);

  if (isNaN(date.getTime())) return { error: "无效的时间戳" };

  const result = {
    unixSeconds: Math.floor(asMs / 1000),
    unixMs: asMs,
    utc: date.toISOString(),
    iso: new Intl.DateTimeFormat("sv-SE", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date).replace(" ", "T"),
    human: date.toLocaleString("zh-CN", { timeZoneName: "short" }),
    weekDay: date.toLocaleString("zh-CN", { weekday: "long" }),
    relative: getRelativeTime(asMs),
  };

  // 指定时区
  if (tz !== "local") {
    try {
      result.tzLocal = date.toLocaleString("zh-CN", {
        timeZone: tz,
        timeZoneName: "long",
      });
      result.tzShort = date.toLocaleString("zh-CN", {
        timeZone: tz,
        timeZoneName: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      result.tzLocal = "时区不支持";
    }
  }

  return result;
}

export function dateToTimestamp(dateStr, tz = "local") {
  if (!dateStr) return null;

  let date;
  if (tz === "local" || tz === "utc") {
    date = new Date(dateStr);
  } else {
    // 带时区的日期字符串
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return { error: "无效的日期格式" };

  return {
    unixSeconds: Math.floor(date.getTime() / 1000),
    unixMs: date.getTime(),
    readable: date.toLocaleString("zh-CN"),
  };
}

function getRelativeTime(ms) {
  const now = Date.now();
  const diff = now - ms;
  const abs = Math.abs(diff);
  const seconds = Math.floor(abs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return diff >= 0 ? `${seconds} 秒前` : `${seconds} 秒后`;
  if (minutes < 60) return diff >= 0 ? `${minutes} 分钟前` : `${minutes} 分钟后`;
  if (hours < 24) return diff >= 0 ? `${hours} 小时前` : `${hours} 小时后`;
  if (days < 30) return diff >= 0 ? `${days} 天前` : `${days} 天后`;
  return diff >= 0 ? `${Math.floor(days / 30)} 个月前` : `${Math.floor(days / 30)} 个月后`;
}
