export const TZ_OPTIONS = [
  { id: "local", label: "本地时区" },
  { id: "UTC", label: "UTC" },
  { id: "Asia/Shanghai", label: "Asia/Shanghai" },
  { id: "America/New_York", label: "America/New_York" },
  { id: "Europe/London", label: "Europe/London" },
];

export function nowTimestamp(unit: "s" | "ms" = "s") {
  return unit === "ms" ? Date.now() : Math.floor(Date.now() / 1000);
}

export function timestampToDate(ts: string | number, tz = "local") {
  if (ts === "" || ts === null || ts === undefined) return null;
  const num = Number(ts);
  if (!Number.isFinite(num)) return { error: "无效的时间戳" };
  const asMs = num > 1e12 ? num : num * 1000;
  const date = new Date(asMs);
  if (Number.isNaN(date.getTime())) return { error: "无效的时间戳" };
  return {
    unixSeconds: Math.floor(asMs / 1000),
    unixMs: asMs,
    utc: date.toISOString(),
    human: date.toLocaleString("zh-CN", tz === "local" ? undefined : { timeZone: tz }),
    weekDay: date.toLocaleString("zh-CN", { weekday: "long" }),
  };
}

export function dateToTimestamp(dateStr: string) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return { error: "无效的日期格式" };
  return { unixSeconds: Math.floor(date.getTime() / 1000), unixMs: date.getTime(), readable: date.toLocaleString("zh-CN") };
}
