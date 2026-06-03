import { getStorageItem, removeStorageItem, setStorageItem } from "../../shared/storage.js";
import { shouldUseProxy } from "../../shared/url.js";
import * as dom from "../../shared/dom-cache.js";
import * as benchmark from "./benchmark.js";
import * as modelFetcher from "./model-fetcher.js";

export const meta = {
  id: "speed-test",
  route: "#speed-test",
  title: "大模型测速",
  kicker: "LLM Speed Bench",
  description: "对比 OpenAI 兼容接口和 Anthropic 接口的 TTFT、总耗时、tokens/s。",
};

const STORAGE_KEY = "llm-speed-bench-static-v1";

let currentAbortController = null;

export function init() {
  bindEvents();
  restoreFromStorage();
  if (!dom.speedTest.targetsContainer.children.length) {
    addTargetCard({ kind: "openai" });
  }
  if (window.location.protocol === "file:") {
    log("当前是直接打开的本地页面模式。", "info", true);
  } else if (!shouldUseProxy()) {
    log("当前是静态发布模式，会直接请求目标接口；如果接口未开启 CORS，浏览器会拦截请求。", "info", true);
  }
}

export function destroy() {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

function bindEvents() {
  dom.speedTest.addOpenAiBtn.addEventListener("click", () => addTargetCard({ kind: "openai" }));
  dom.speedTest.addAnthropicBtn.addEventListener("click", () => addTargetCard({ kind: "anthropic" }));
  dom.speedTest.addOllamaBtn.addEventListener("click", () => addTargetCard({ kind: "ollama" }));
  dom.speedTest.exampleBtn.addEventListener("click", fillExampleConfig);
  dom.speedTest.resetBtn.addEventListener("click", resetPage);
  dom.speedTest.runBtn.addEventListener("click", runBenchmark);
  dom.speedTest.stopBtn.addEventListener("click", stopBenchmark);
  dom.speedTest.exportBtn.addEventListener("click", () => benchmark.exportResults());
  dom.speedTest.clearLogBtn.addEventListener("click", () => {
    dom.speedTest.logOutput.textContent = "等待开始…";
  });

  [
    dom.speedTest.promptInput,
    dom.speedTest.systemPromptInput,
    dom.speedTest.roundsInput,
    dom.speedTest.warmupInput,
    dom.speedTest.maxTokensInput,
    dom.speedTest.temperatureInput,
  ].forEach((element) => {
    element.addEventListener("input", saveToStorage);
  });
}

function addTargetCard(initial = {}) {
  const fragment = dom.speedTest.targetTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".target-card");
  const enabled = card.querySelector(".target-enabled");
  const name = card.querySelector(".target-name");
  const kind = card.querySelector(".target-kind");
  const baseUrl = card.querySelector(".target-base-url");
  const model = card.querySelector(".target-model");
  const modelSelect = card.querySelector(".target-model-select");
  const fetchModelsBtn = card.querySelector(".fetch-models-btn");
  const endpointPath = card.querySelector(".target-endpoint-path");
  const apiKey = card.querySelector(".target-api-key");
  const extraHeaders = card.querySelector(".target-extra-headers");
  const extraBody = card.querySelector(".target-extra-body");
  const badge = card.querySelector(".target-type-badge");
  const removeBtn = card.querySelector(".remove-target-btn");

  enabled.checked = initial.enabled ?? true;
  name.value = initial.name ?? "";
  kind.value = initial.kind ?? "openai";
  baseUrl.value = initial.baseUrl ?? "";
  model.value = initial.model ?? "";
  endpointPath.value = initial.endpointPath ?? defaultEndpointFor(kind.value);
  apiKey.value = initial.apiKey ?? "";
  extraHeaders.value = initial.extraHeadersText ?? "";
  extraBody.value = initial.extraBodyText ?? "";

  const saveFields = [enabled, name, kind, baseUrl, model, endpointPath, extraHeaders, extraBody];
  saveFields.forEach((element) => {
    element.addEventListener("input", saveToStorage);
    element.addEventListener("change", saveToStorage);
  });

  apiKey.addEventListener("input", () => {
    if (apiKey.dataset.noticeShown === "1") return;
    apiKey.dataset.noticeShown = "1";
    log("API Key 不会写入 localStorage，只保留在当前页面里。");
  });

  kind.addEventListener("change", () => {
    badge.textContent = typeLabel(kind.value);
    endpointPath.value = defaultEndpointFor(kind.value);
    apiKey.closest(".field").style.display = "flex";
    modelSelect.classList.add("hidden");
    saveToStorage();
  });

  removeBtn.addEventListener("click", () => {
    card.remove();
    saveToStorage();
  });

  fetchModelsBtn.addEventListener("click", async () => {
    await handleFetchModels({
      kind: kind.value,
      baseUrl: baseUrl.value,
      apiKey: apiKey.value,
      extraHeaders: extraHeaders.value,
      modelInput: model,
      modelSelect: modelSelect,
      fetchBtn: fetchModelsBtn,
    });
  });

  modelSelect.addEventListener("change", () => {
    if (modelSelect.value) {
      model.value = modelSelect.value;
      saveToStorage();
    }
  });

  badge.textContent = typeLabel(kind.value);
  apiKey.closest(".field").style.display = "flex";

  dom.speedTest.targetsContainer.appendChild(fragment);
}

async function handleFetchModels({ kind, baseUrl, apiKey, extraHeaders, modelInput, modelSelect, fetchBtn }) {
  if (!baseUrl.trim()) {
    log("请先填写 Base URL", "error");
    return;
  }

  const originalText = fetchBtn.textContent;
  fetchBtn.disabled = true;
  fetchBtn.textContent = "获取中...";
  modelSelect.classList.add("hidden");

  try {
    const models = await modelFetcher.fetchModelList({ kind, baseUrl, apiKey, extraHeaders });

    if (models.length === 0) {
      log("未获取到模型列表", "error");
      return;
    }

    modelSelect.innerHTML = '<option value="">-- 选择模型 --</option>';
    models.forEach((modelName) => {
      const option = document.createElement("option");
      option.value = modelName;
      option.textContent = modelName;
      modelSelect.appendChild(option);
    });

    if (!modelInput.value.trim()) {
      modelInput.value = models[0];
      saveToStorage();
    }
    modelSelect.value = modelInput.value.trim();
    modelSelect.classList.remove("hidden");
    log(`成功获取 ${models.length} 个模型`);
  } catch (error) {
    log(`获取模型列表失败: ${error.message}`, "error");
    showStatus(`获取模型列表失败：${error.message}`, "error");
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = originalText;
  }
}

function fillExampleConfig() {
  dom.speedTest.promptInput.value = "请用 300 字解释什么是 RAG，并补充一个电商客服场景案例。";
  dom.speedTest.systemPromptInput.value = "";
  dom.speedTest.roundsInput.value = "3";
  dom.speedTest.warmupInput.value = "1";
  dom.speedTest.maxTokensInput.value = "256";
  dom.speedTest.temperatureInput.value = "0";

  saveToStorage();
  showStatus("已填充测试参数，接口配置保持不变。", "info");
  log("已填充测试参数，接口配置保持不变。");
}

function resetPage() {
  if (!removeStorageItem(STORAGE_KEY)) {
    log("当前浏览器不允许清理本地缓存。", "error", true);
  }
  dom.speedTest.promptInput.value = "";
  dom.speedTest.systemPromptInput.value = "";
  dom.speedTest.roundsInput.value = "3";
  dom.speedTest.warmupInput.value = "1";
  dom.speedTest.maxTokensInput.value = "256";
  dom.speedTest.temperatureInput.value = "0";
  dom.speedTest.targetsContainer.innerHTML = "";
  addTargetCard({ kind: "openai" });
  benchmark.setLatestExportPayload(null);
  benchmark.clearResults();
  syncExportButton();
  log("页面已重置。");
}

async function runBenchmark() {
  benchmark.clearResults();
  hideStatus();
  benchmark.setLatestExportPayload(null);
  syncExportButton();

  let config;
  try {
    config = benchmark.readConfigFromPage();
  } catch (error) {
    showStatus(error.message, "error");
    log(error.message, "error");
    return;
  }

  if (!config.targets.length) {
    showStatus("至少需要启用一个接口。", "error");
    log("至少需要启用一个接口。", "error");
    return;
  }

  currentAbortController = new AbortController();
  setRunning(true);
  showStatus("测速已开始，请查看下方日志和结果。", "info");
  log(`开始测速：${config.targets.length} 个接口，正式轮数 ${config.rounds}，预热轮数 ${config.warmupRounds}。`);

  try {
    await benchmark.runBenchmark(
      config,
      (msg, level = "info") => log(msg, level),
      (msg, level) => showStatus(msg, level),
      currentAbortController.signal,
    );
    syncExportButton();
  } catch (error) {
    if (error.name === "AbortError") {
      showStatus("测速已手动停止。", "error");
      log("测速已手动停止。", "error");
    } else {
      showStatus(error.message || String(error), "error");
      log(error.message || String(error), "error");
    }
  } finally {
    currentAbortController = null;
    setRunning(false);
  }
}

function stopBenchmark() {
  if (currentAbortController) {
    currentAbortController.abort();
  }
}

function showStatus(message, level = "info") {
  dom.speedTest.statusMessage.textContent = message;
  dom.speedTest.statusMessage.className = `status-message status-${level}`;
}

function hideStatus() {
  dom.speedTest.statusMessage.textContent = "";
  dom.speedTest.statusMessage.className = "status-message hidden";
}

function log(message, level = "info", dedupe = false) {
  const prefix = level === "error" ? "[ERROR]" : "[INFO]";
  const line = `${new Date().toLocaleTimeString()} ${prefix} ${message}`;
  if (dedupe && dom.speedTest.logOutput.textContent.includes(line)) return;
  if (dom.speedTest.logOutput.textContent === "等待开始…") {
    dom.speedTest.logOutput.textContent = line;
  } else {
    dom.speedTest.logOutput.textContent += `\n${line}`;
  }
  dom.speedTest.logOutput.scrollTop = dom.speedTest.logOutput.scrollHeight;
}

function restoreFromStorage() {
  const raw = getStorageItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    dom.speedTest.promptInput.value = data.prompt ?? "";
    dom.speedTest.systemPromptInput.value = data.systemPrompt ?? "";
    dom.speedTest.roundsInput.value = String(data.rounds ?? 3);
    dom.speedTest.warmupInput.value = String(data.warmupRounds ?? 1);
    dom.speedTest.maxTokensInput.value = String(data.maxTokens ?? 256);
    dom.speedTest.temperatureInput.value = String(data.temperature ?? 0);
    dom.speedTest.targetsContainer.innerHTML = "";
    (data.targets ?? []).forEach((target) => addTargetCard(target));
  } catch {
    log("本地缓存读取失败，已忽略。", "error");
  }
}

function saveToStorage() {
  const payload = {
    prompt: dom.speedTest.promptInput.value,
    systemPrompt: dom.speedTest.systemPromptInput.value,
    rounds: dom.speedTest.roundsInput.value,
    warmupRounds: dom.speedTest.warmupInput.value,
    maxTokens: dom.speedTest.maxTokensInput.value,
    temperature: dom.speedTest.temperatureInput.value,
    targets: [...dom.speedTest.targetsContainer.querySelectorAll(".target-card")].map((card) => ({
      enabled: card.querySelector(".target-enabled").checked,
      kind: card.querySelector(".target-kind").value,
      name: card.querySelector(".target-name").value,
      baseUrl: card.querySelector(".target-base-url").value,
      model: card.querySelector(".target-model").value,
      endpointPath: card.querySelector(".target-endpoint-path").value,
      extraHeadersText: card.querySelector(".target-extra-headers").value,
      extraBodyText: card.querySelector(".target-extra-body").value,
    })),
  };

  if (!setStorageItem(STORAGE_KEY, JSON.stringify(payload))) {
    log("当前浏览器不允许写入本地缓存，页面仍可继续使用。", "error", true);
  }
}

function setRunning(isRunning) {
  dom.speedTest.runBtn.disabled = isRunning;
  dom.speedTest.stopBtn.disabled = !isRunning;
}

function syncExportButton() {
  dom.speedTest.exportBtn.disabled = !benchmark.getLatestExportPayload();
}

function defaultEndpointFor(kind) {
  if (kind === "anthropic") return "/messages";
  if (kind === "ollama") return "/api/generate";
  return "/chat/completions";
}

function typeLabel(kind) {
  if (kind === "anthropic") return "Anthropic";
  if (kind === "ollama") return "Ollama";
  return "OpenAI 兼容";
}
