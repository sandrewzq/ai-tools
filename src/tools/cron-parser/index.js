import * as dom from "../../shared/dom-cache.js";
import { debounce } from "../../shared/format.js";
import { parseCron, CRON_EXAMPLES } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "cron-parser",
  route: "#cron-parser",
  title: "Cron 解析器",
  kicker: "Cron Parser",
  description: "解析 5 段 Cron 表达式，输出字段拆解和中文自然语言说明。",
};

let debouncedParse;
let eventsBound = false;

export function init() {
  debouncedParse = debounce(runParse, 250);

  if (!eventsBound) {
    bindEvents();
    eventsBound = true;
  }

  render.renderExamples(CRON_EXAMPLES, dom.cronParser.examples);
  if (dom.cronParser.input.value.trim()) {
    runParse();
  } else {
    render.renderCronEmpty(dom.cronParser.summary, dom.cronParser.fields, dom.cronParser.error);
  }
}

export function destroy() {}

function bindEvents() {
  dom.cronParser.input.addEventListener("input", () => debouncedParse());
  dom.cronParser.parseBtn.addEventListener("click", runParse);

  dom.cronParser.examples.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-cron-example]");
    if (!btn) return;
    dom.cronParser.input.value = btn.dataset.cronExample;
    runParse();
  });
}

function runParse() {
  const result = parseCron(dom.cronParser.input.value);
  if (result.error) {
    render.renderCronError(result.error, dom.cronParser.summary, dom.cronParser.fields, dom.cronParser.error);
    return;
  }
  render.renderCronResult(result, dom.cronParser.summary, dom.cronParser.fields, dom.cronParser.error);
}
