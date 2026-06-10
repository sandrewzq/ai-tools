import * as dom from "../../shared/dom-cache.js";
import * as data from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "uuid-generator",
  route: "#uuid-generator",
  title: "UUID 生成器",
  kicker: "UUID Generator",
  description: "在线生成 UUID v4 和 v7，支持批量生成、去连字符、大小写切换。",
};

export function init() {
  bindEvents();
  generate();
}

export function destroy() {}

function bindEvents() {
  dom.uuidGenerator.generateBtn.addEventListener("click", generate);
  dom.uuidGenerator.copyAllBtn.addEventListener("click", copyAll);
  dom.uuidGenerator.versionSelect.addEventListener("change", () => {
    generate();
    syncBatchLimit();
  });
  dom.uuidGenerator.countInput.addEventListener("input", () => {
    validateCount();
    generate();
  });
  dom.uuidGenerator.noHyphensCheck.addEventListener("change", generate);
  dom.uuidGenerator.uppercaseCheck.addEventListener("change", generate);
}

function syncBatchLimit() {
  const isV7 = dom.uuidGenerator.versionSelect.value === "v7";
  dom.uuidGenerator.countInput.max = isV7 ? "50" : "100";
  const current = Number(dom.uuidGenerator.countInput.value);
  if (current > (isV7 ? 50 : 100)) {
    dom.uuidGenerator.countInput.value = isV7 ? "50" : "100";
  }
}

function validateCount() {
  const count = Number(dom.uuidGenerator.countInput.value);
  const max = Number(dom.uuidGenerator.countInput.max);
  if (!count || count < 1) dom.uuidGenerator.countInput.value = "1";
  else if (count > max) dom.uuidGenerator.countInput.value = String(max);
}

function generate() {
  const version = dom.uuidGenerator.versionSelect.value;
  const count = Number(dom.uuidGenerator.countInput.value) || 1;
  const noHyphens = dom.uuidGenerator.noHyphensCheck.checked;
  const uppercase = dom.uuidGenerator.uppercaseCheck.checked;
  const uuids = data.generateBatch(count, version, noHyphens, uppercase);
  render.renderUuidList(uuids, dom.uuidGenerator.uuidList);
}

async function copyAll() {
  const codes = dom.uuidGenerator.uuidList.querySelectorAll("code");
  const text = Array.from(codes, c => c.textContent).join("\n");
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // fallback silent
  }
}
