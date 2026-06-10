import * as dom from "../../shared/dom-cache.js";
import { parseCurl } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "curl-converter",
  route: "#curl-converter",
  title: "cURL 转代码",
  kicker: "cURL Converter",
  description: "粘贴 cURL 命令，一键生成 fetch、Python requests、Go net/http 代码。",
};

export function init() {
  bindEvents();
  render.renderEmpty(
    dom.curlConverter.fetchOutput,
    dom.curlConverter.pythonOutput,
    dom.curlConverter.goOutput,
    dom.curlConverter.summary,
    dom.curlConverter.error,
  );
}

export function destroy() {}

function bindEvents() {
  dom.curlConverter.convertBtn.addEventListener("click", () => {
    const parsed = parseCurl(dom.curlConverter.curlInput.value);
    render.renderResult(
      parsed,
      dom.curlConverter.fetchOutput,
      dom.curlConverter.pythonOutput,
      dom.curlConverter.goOutput,
      dom.curlConverter.summary,
      dom.curlConverter.error,
    );
  });

  dom.curlConverter.curlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      dom.curlConverter.convertBtn.click();
    }
  });

  // 复制按钮
  dom.curlConverter.copyFetchBtn.addEventListener("click", () => copyText(dom.curlConverter.fetchOutput.textContent));
  dom.curlConverter.copyPythonBtn.addEventListener("click", () => copyText(dom.curlConverter.pythonOutput.textContent));
  dom.curlConverter.copyGoBtn.addEventListener("click", () => copyText(dom.curlConverter.goOutput.textContent));

  // 示例填充
  dom.curlConverter.exampleBtn.addEventListener("click", () => {
    dom.curlConverter.curlInput.value = `curl -X POST "https://api.example.com/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -d '{"name":"Alice","email":"alice@example.com"}'`;
    dom.curlConverter.convertBtn.click();
  });
}

function copyText(text) {
  navigator.clipboard.writeText(text).catch(() => {});
  dom.curlConverter.toast.textContent = "已复制";
  dom.curlConverter.toast.classList.remove("hidden");
  dom.curlConverter.toast.classList.add("toast-visible");
  clearTimeout(dom.curlConverter.toast._timeout);
  dom.curlConverter.toast._timeout = setTimeout(() => {
    dom.curlConverter.toast.classList.remove("toast-visible");
    dom.curlConverter.toast.classList.add("hidden");
  }, 2000);
}
