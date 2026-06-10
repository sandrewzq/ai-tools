import * as dom from "../../shared/dom-cache.js";
import { getStorageItem, setStorageItem } from "../../shared/storage.js";
import { chunkText, DEFAULTS, estimateTokens } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "text-chunker",
  route: "#text-chunker",
  title: "文本分块器",
  kicker: "Text Chunker",
  description: "为 RAG 场景提供文本分块能力，支持按字符/段落/Markdown 标题分割，可调大小和重叠。",
};

const STORAGE_KEY = "text-chunker-config";

let config = { ...DEFAULTS };
let allChunks = [];

export function init() {
  loadConfig();
  applyConfigToDom();
  render.renderSplitModeOptions(dom.textChunker.splitMode);
  bindEvents();
  render.renderEmpty(dom.textChunker.chunksContainer);
  dom.textChunker.statsContainer.innerHTML = "";
}

export function destroy() {}

function loadConfig() {
  try {
    const raw = getStorageItem(STORAGE_KEY);
    if (raw) {
      config = { ...DEFAULTS, ...JSON.parse(raw) };
    }
  } catch {
    config = { ...DEFAULTS };
  }
}

function saveConfig() {
  setStorageItem(STORAGE_KEY, JSON.stringify(config));
}

function applyConfigToDom() {
  dom.textChunker.chunkSize.value = config.chunkSize;
  dom.textChunker.overlap.value = config.overlap;
  dom.textChunker.splitMode.value = config.splitMode;
}

function readConfigFromDom() {
  config.chunkSize = Math.max(50, Math.min(10000, parseInt(dom.textChunker.chunkSize.value, 10) || DEFAULTS.chunkSize));
  config.overlap = Math.max(0, Math.min(5000, parseInt(dom.textChunker.overlap.value, 10) || 0));
  config.splitMode = dom.textChunker.splitMode.value;
  saveConfig();
}

function bindEvents() {
  dom.textChunker.chunkBtn.addEventListener("click", doChunk);
  dom.textChunker.resetBtn.addEventListener("click", resetAll);
  dom.textChunker.copyAllBtn.addEventListener("click", copyAllChunks);

  dom.textChunker.chunksContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".chunk-copy-btn");
    if (!btn) return;
    const index = parseInt(btn.dataset.index, 10);
    if (allChunks[index]) copyText(allChunks[index].text, `分块 #${index + 1}`);
  });
}

function doChunk() {
  readConfigFromDom();
  const text = dom.textChunker.textInput.value.trim();

  if (!text) {
    render.renderEmpty(dom.textChunker.chunksContainer);
    dom.textChunker.statsContainer.innerHTML = "";
    return;
  }

  const rawChunks = chunkText(text, config.splitMode, config.chunkSize, config.overlap);
  allChunks = rawChunks.map((chunk) => ({
    text: chunk,
    chars: chunk.length,
    tokens: estimateTokens(chunk),
  }));

  render.renderChunks(allChunks, dom.textChunker.chunksContainer);
  render.renderStats(allChunks, dom.textChunker.statsContainer);
  dom.textChunker.copyAllBtn.disabled = allChunks.length === 0;
}

function resetAll() {
  config = { ...DEFAULTS };
  applyConfigToDom();
  saveConfig();
  allChunks = [];
  dom.textChunker.textInput.value = "";
  render.renderEmpty(dom.textChunker.chunksContainer);
  dom.textChunker.statsContainer.innerHTML = "";
  dom.textChunker.copyAllBtn.disabled = true;
}

async function copyAllChunks() {
  if (allChunks.length === 0) return;
  const text = allChunks
    .map((c, i) => `--- 分块 ${i + 1} (${c.chars} 字, ~${c.tokens} tokens) ---\n${c.text}`)
    .join("\n\n");
  await copyText(text, `已复制全部 ${allChunks.length} 个分块`);
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${label} 已复制`);
  } catch {
    showToast("复制失败，请手动选择文本");
  }
}

function showToast(message) {
  dom.textChunker.toast.textContent = message;
  dom.textChunker.toast.classList.remove("hidden");
  dom.textChunker.toast.classList.add("toast-visible");
  clearTimeout(dom.textChunker.toast._timeout);
  dom.textChunker.toast._timeout = setTimeout(() => {
    dom.textChunker.toast.classList.remove("toast-visible");
    dom.textChunker.toast.classList.add("hidden");
  }, 2000);
}
