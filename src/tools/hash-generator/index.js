import * as dom from "../../shared/dom-cache.js";
import * as data from "./data.js";
import * as render from "./render.js";
import { debounce } from "../../shared/format.js";

export const meta = {
  id: "hash-generator",
  route: "#hash-generator",
  title: "哈希生成器",
  kicker: "Hash Generator",
  description: "在线生成 MD5、SHA-1、SHA-256、SHA-512 哈希值，纯浏览器端计算。",
};

let debouncedCalc;

export function init() {
  debouncedCalc = debounce(calculate, 300);
  bindEvents();
  calculate();
}

export function destroy() {}

function bindEvents() {
  dom.hashGenerator.input.addEventListener("input", () => debouncedCalc());
  dom.hashGenerator.algoSelect.addEventListener("change", calculate);

  dom.hashGenerator.result.addEventListener("click", (e) => {
    const btn = e.target.closest(".hash-copy-btn");
    if (!btn) return;
    navigator.clipboard.writeText(btn.dataset.hash).catch(() => {});
  });
}

async function calculate() {
  const input = dom.hashGenerator.input.value;
  const algo = dom.hashGenerator.algoSelect.value;

  if (!input.trim()) {
    render.renderEmpty(dom.hashGenerator.result);
    return;
  }

  try {
    const hash = await data.hashAsync(input, algo);
    render.renderResult(hash, dom.hashGenerator.result, algo);
  } catch (err) {
    render.renderError(err.message, dom.hashGenerator.result);
  }
}
