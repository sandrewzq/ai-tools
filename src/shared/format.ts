export function formatMs(value: number) {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(0)} ms`;
}

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(2);
}

export function prettyJson(value: Record<string, unknown> | unknown[] | null | undefined) {
  if (!value || (typeof value === "object" && Object.keys(value).length === 0)) return "";
  return JSON.stringify(value, null, 2);
}

export function timestampString() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function escapeHtml(value: unknown) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function shorten(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}

export function debounce<TArgs extends unknown[]>(fn: (...args: TArgs) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: TArgs) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
