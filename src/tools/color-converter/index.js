import * as dom from "../../shared/dom-cache.js";
import { debounce } from "../../shared/format.js";
import { convertColor } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "color-converter",
  route: "#color-converter",
  title: "颜色格式转换",
  kicker: "Color Converter",
  description: "将 HEX、RGB、HSL 颜色互转，并展示实时预览与复制结果。",
};

let debouncedConvert;
let eventsBound = false;

export function init() {
  debouncedConvert = debounce(runConvert, 200);

  if (!eventsBound) {
    bindEvents();
    eventsBound = true;
  }

  if (dom.colorConverter.input.value.trim()) {
    runConvert();
  } else {
    render.renderColorEmpty(dom.colorConverter.preview, dom.colorConverter.formats, dom.colorConverter.error);
  }
}

export function destroy() {}

function bindEvents() {
  dom.colorConverter.input.addEventListener("input", () => debouncedConvert());
  dom.colorConverter.convertBtn.addEventListener("click", runConvert);

  dom.colorConverter.formats.addEventListener("click", async (event) => {
    const btn = event.target.closest("[data-copy-value]");
    if (!btn) return;
    try {
      await navigator.clipboard.writeText(btn.dataset.copyValue);
    } catch {}
  });
}

function runConvert() {
  const result = convertColor(dom.colorConverter.input.value);
  if (result.error) {
    render.renderColorError(result.error, dom.colorConverter.preview, dom.colorConverter.formats, dom.colorConverter.error);
    return;
  }
  render.renderColorResult(result, dom.colorConverter.preview, dom.colorConverter.formats, dom.colorConverter.error);
}
