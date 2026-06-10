import { parseCurl, generateFetch, generatePython, generateGo } from "./data.js";

export function renderResult(parsed, fetchContainer, pythonContainer, goContainer, summaryContainer, errorContainer) {
  if (parsed.error) {
    errorContainer.textContent = parsed.error;
    errorContainer.classList.remove("hidden");
    fetchContainer.textContent = "";
    pythonContainer.textContent = "";
    goContainer.textContent = "";
    summaryContainer.innerHTML = "";
    return;
  }

  errorContainer.textContent = "";
  errorContainer.classList.add("hidden");
  // 摘要
  const methodColors = { GET: "#2da44e", POST: "#1f6feb", PUT: "#bf8700", DELETE: "#cf222e", PATCH: "#8250df" };
  const color = methodColors[parsed.method] || "#656d76";
  const headerCount = Object.keys(parsed.headers).length;

  summaryContainer.innerHTML = `
    <div class="curl-summary">
      <span class="curl-method" style="background:${color}20;color:${color}">${parsed.method}</span>
      <span class="curl-url">${escapeHtml(parsed.url)}</span>
      ${headerCount ? `<span class="curl-stat">${headerCount} headers</span>` : ""}
      ${parsed.body ? `<span class="curl-stat">有请求体</span>` : ""}
    </div>
  `;

  fetchContainer.textContent = generateFetch(parsed);
  pythonContainer.textContent = generatePython(parsed);
  goContainer.textContent = generateGo(parsed);
}

export function renderEmpty(fetchContainer, pythonContainer, goContainer, summaryContainer, errorContainer) {
  fetchContainer.textContent = "";
  pythonContainer.textContent = "";
  goContainer.textContent = "";
  summaryContainer.innerHTML = "";
  errorContainer.textContent = "";
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
