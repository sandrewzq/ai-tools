export function formatMs(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  return `${value.toFixed(0)} ms`;
}

export function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  return value.toFixed(2);
}

export function prettyJson(value) {
  if (!value || !Object.keys(value).length) {
    return "";
  }
  return JSON.stringify(value, null, 2);
}

export function timestampString() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function shorten(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
}
