import * as dom from "../../shared/dom-cache.js";
import * as converter from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "encoding-converter",
  route: "#encoding-converter",
  title: "编码转换器",
  kicker: "Encoding Converter",
  description: "Base64、URL 编解码、HTML 实体、Unicode 转义 — 一键互转。",
};

const actions = {
  "enc-base64-encode": () => converter.base64Encode,
  "enc-base64-decode": () => converter.base64Decode,
  "enc-url-encode": () => converter.urlEncode,
  "enc-url-decode": () => converter.urlDecode,
  "enc-html-encode": () => converter.htmlEncode,
  "enc-html-decode": () => converter.htmlDecode,
  "enc-unicode-escape": () => converter.unicodeEscape,
  "enc-unicode-unescape": () => converter.unicodeUnescape,
};

export function init() {
  bindEvents();
  render.renderEmpty(dom.encodingConverter.output, dom.encodingConverter.error);
}

export function destroy() {}

function bindEvents() {
  Object.entries(actions).forEach(([id, fn]) => {
    const btn = document.querySelector(`#${id}`);
    if (btn) {
      btn.addEventListener("click", () => {
        try {
          const result = fn()(dom.encodingConverter.input.value);
          render.renderResult(result, dom.encodingConverter.output, dom.encodingConverter.error);
        } catch (e) {
          render.renderError(e.message, dom.encodingConverter.output, dom.encodingConverter.error);
        }
      });
    }
  });

  dom.encodingConverter.copyBtn.addEventListener("click", async () => {
    const val = dom.encodingConverter.output.value;
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      showToast("已复制");
    } catch {
      showToast("复制失败");
    }
  });

  dom.encodingConverter.clearBtn.addEventListener("click", () => {
    dom.encodingConverter.input.value = "";
    render.renderEmpty(dom.encodingConverter.output, dom.encodingConverter.error);
  });

  dom.encodingConverter.swapBtn.addEventListener("click", () => {
    const tmp = dom.encodingConverter.input.value;
    dom.encodingConverter.input.value = dom.encodingConverter.output.value;
    dom.encodingConverter.output.value = tmp;
    dom.encodingConverter.error.textContent = "";
  });
}

function showToast(msg) {
  dom.encodingConverter.toast.textContent = msg;
  dom.encodingConverter.toast.classList.remove("hidden");
  dom.encodingConverter.toast.classList.add("toast-visible");
  clearTimeout(dom.encodingConverter.toast._timeout);
  dom.encodingConverter.toast._timeout = setTimeout(() => {
    dom.encodingConverter.toast.classList.remove("toast-visible");
    dom.encodingConverter.toast.classList.add("hidden");
  }, 2000);
}
