const STORAGE_KEY = "llm-speed-bench-static-v1";
const DEFAULT_VIEW = "home";

const dom = {
  homeView: document.querySelector("#homeView"),
  speedTestView: document.querySelector("#speedTestView"),
  viewLinks: document.querySelectorAll("[data-view-link]"),
  promptInput: document.querySelector("#promptInput"),
  systemPromptInput: document.querySelector("#systemPromptInput"),
  roundsInput: document.querySelector("#roundsInput"),
  warmupInput: document.querySelector("#warmupInput"),
  maxTokensInput: document.querySelector("#maxTokensInput"),
  temperatureInput: document.querySelector("#temperatureInput"),
  addOpenAiBtn: document.querySelector("#addOpenAiBtn"),
  addAnthropicBtn: document.querySelector("#addAnthropicBtn"),
  addOllamaBtn: document.querySelector("#addOllamaBtn"),
  exampleBtn: document.querySelector("#exampleBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  runBtn: document.querySelector("#runBtn"),
  stopBtn: document.querySelector("#stopBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  clearLogBtn: document.querySelector("#clearLogBtn"),
  targetsContainer: document.querySelector("#targetsContainer"),
  targetTemplate: document.querySelector("#targetTemplate"),
  summaryEmpty: document.querySelector("#summaryEmpty"),
  summaryBoard: document.querySelector("#summaryBoard"),
  summaryTableWrap: document.querySelector("#summaryTableWrap"),
  summaryTableBody: document.querySelector("#summaryTableBody"),
  detailsEmpty: document.querySelector("#detailsEmpty"),
  detailsTableWrap: document.querySelector("#detailsTableWrap"),
  detailsTableBody: document.querySelector("#detailsTableBody"),
  logOutput: document.querySelector("#logOutput"),
  statusMessage: document.querySelector("#statusMessage"),
};

let currentAbortController = null;
let latestExportPayload = null;

bootstrap();

function bootstrap() {
  bindEvents();
  syncViewFromHash();
  if (window.location.protocol === "file:") {
    log("当前是直接打开的本地页面模式。", "info", true);
  } else if (!shouldUseProxy()) {
    log("当前是静态发布模式，会直接请求目标接口；如果接口未开启 CORS，浏览器会拦截请求。", "info", true);
  }
  restoreFromStorage();
  if (!dom.targetsContainer.children.length) {
    addTargetCard({ kind: "openai" });
  }
  syncExportButton();
}

function bindEvents() {
  window.addEventListener("hashchange", syncViewFromHash);
  dom.viewLinks.forEach((link) => {
    link.addEventListener("click", () => showView(link.dataset.viewLink));
  });
  dom.addOpenAiBtn.addEventListener("click", () => addTargetCard({ kind: "openai" }));
  dom.addAnthropicBtn.addEventListener("click", () => addTargetCard({ kind: "anthropic" }));
  dom.addOllamaBtn.addEventListener("click", () => addTargetCard({ kind: "ollama" }));
  dom.exampleBtn.addEventListener("click", fillExampleConfig);
  dom.resetBtn.addEventListener("click", resetPage);
  dom.runBtn.addEventListener("click", runBenchmark);
  dom.stopBtn.addEventListener("click", stopBenchmark);
  dom.exportBtn.addEventListener("click", exportResults);
  dom.clearLogBtn.addEventListener("click", () => {
    dom.logOutput.textContent = "等待开始…";
  });

  [
    dom.promptInput,
    dom.systemPromptInput,
    dom.roundsInput,
    dom.warmupInput,
    dom.maxTokensInput,
    dom.temperatureInput,
  ].forEach((element) => {
    element.addEventListener("input", saveToStorage);
  });
}

function syncViewFromHash() {
  const view = window.location.hash.replace("#", "") || DEFAULT_VIEW;
  showView(view);
}

function showView(view) {
  const normalizedView = view === "speed-test" ? "speed-test" : DEFAULT_VIEW;
  dom.homeView.classList.toggle("hidden", normalizedView !== "home");
  dom.speedTestView.classList.toggle("hidden", normalizedView !== "speed-test");
  dom.viewLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.viewLink === normalizedView);
  });
}

function addTargetCard(initial = {}) {
  const fragment = dom.targetTemplate.content.cloneNode(true);
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
  extraHeaders.value = initial.extraHeadersText ?? prettyJson(initial.extraHeaders);
  extraBody.value = initial.extraBodyText ?? prettyJson(initial.extraBody);

  const saveFields = [enabled, name, kind, baseUrl, model, endpointPath, extraHeaders, extraBody];
  saveFields.forEach((element) => {
    element.addEventListener("input", saveToStorage);
    element.addEventListener("change", saveToStorage);
  });

  apiKey.addEventListener("input", () => {
    if (apiKey.dataset.noticeShown === "1") {
      return;
    }
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
    await fetchModelList({
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

  dom.targetsContainer.appendChild(fragment);
}

function fillExampleConfig() {
  dom.promptInput.value = "请用 300 字解释什么是 RAG，并补充一个电商客服场景案例。";
  dom.systemPromptInput.value = "";
  dom.roundsInput.value = "3";
  dom.warmupInput.value = "1";
  dom.maxTokensInput.value = "256";
  dom.temperatureInput.value = "0";

  saveToStorage();
  showStatus("已填充测试参数，接口配置保持不变。", "info");
  log("已填充测试参数，接口配置保持不变。");
}

function resetPage() {
  removeStorageItem(STORAGE_KEY);
  dom.promptInput.value = "";
  dom.systemPromptInput.value = "";
  dom.roundsInput.value = "3";
  dom.warmupInput.value = "1";
  dom.maxTokensInput.value = "256";
  dom.temperatureInput.value = "0";
  dom.targetsContainer.innerHTML = "";
  addTargetCard({ kind: "openai" });
  latestExportPayload = null;
  clearResults();
  syncExportButton();
  log("页面已重置。");
}

async function runBenchmark() {
  clearResults();
  hideStatus();
  latestExportPayload = null;
  syncExportButton();

  let config;
  try {
    config = readConfigFromPage();
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
  log(
    `开始测速：${config.targets.length} 个接口，正式轮数 ${config.rounds}，预热轮数 ${config.warmupRounds}。`,
  );

  const runResults = [];

  try {
    for (const target of config.targets) {
      log(`准备测试 ${target.name} (${target.kind})。`);

      for (let warmupIndex = 1; warmupIndex <= config.warmupRounds; warmupIndex += 1) {
        log(`[预热 ${warmupIndex}/${config.warmupRounds}] ${target.name}`);
        await executeSingleRun(target, config, {
          signal: currentAbortController.signal,
          round: warmupIndex,
          warmup: true,
        });
      }

      for (let roundIndex = 1; roundIndex <= config.rounds; roundIndex += 1) {
        log(`[正式 ${roundIndex}/${config.rounds}] ${target.name}`);
        const result = await executeSingleRun(target, config, {
          signal: currentAbortController.signal,
          round: roundIndex,
          warmup: false,
        });
        runResults.push(result);
        renderDetails(runResults);
        renderSummary(runResults);
        latestExportPayload = {
          generatedAt: new Date().toISOString(),
          config: redactSecrets(config),
          runs: runResults,
          summary: buildSummary(runResults),
        };
        syncExportButton();
      }
    }

    const failedCount = runResults.filter((item) => item.status === "error").length;
    if (failedCount) {
      showStatus(`测速结束，${failedCount} 轮失败，详情见逐轮结果和日志。`, "error");
    } else {
      showStatus("测速完成。", "success");
    }
    log("测速完成。");
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
  dom.statusMessage.textContent = message;
  dom.statusMessage.className = `status-message status-${level}`;
}

function hideStatus() {
  dom.statusMessage.textContent = "";
  dom.statusMessage.className = "status-message hidden";
}

async function executeSingleRun(target, config, context) {
  const requestStartedAt = performance.now();

  try {
    const providerResult = await runProviderBenchmark(target, config, context.signal);

    const totalLatencyMs = performance.now() - requestStartedAt;
    const completionTokens =
      providerResult.completionTokens ??
      roughTokenEstimate(providerResult.outputText || "");
    const promptTokens =
      providerResult.promptTokens ??
      roughTokenEstimate([config.systemPrompt, config.prompt].filter(Boolean).join("\n"));
    const outputDurationMs =
      providerResult.ttftMs === null ? null : Math.max(totalLatencyMs - providerResult.ttftMs, 0);
    const tokensPerSecond =
      completionTokens > 0 && outputDurationMs && outputDurationMs > 0
        ? completionTokens / (outputDurationMs / 1000)
        : null;

    const result = {
      targetName: target.name,
      kind: target.kind,
      round: context.round,
      warmup: context.warmup,
      status: "ok",
      ttftMs: providerResult.ttftMs,
      totalLatencyMs,
      outputDurationMs,
      promptTokens,
      completionTokens,
      tokensPerSecond,
      providerTokensPerSecond: providerResult.providerTokensPerSecond ?? null,
      tokenSource: providerResult.tokenSource,
      note: providerResult.note || "",
    };

    if (!context.warmup) {
      log(
        `${target.name} 第 ${context.round} 轮完成：TTFT ${formatMs(result.ttftMs)}，总耗时 ${formatMs(result.totalLatencyMs)}，tokens/s ${formatNumber(result.tokensPerSecond)}。`,
      );
    }

    return result;
  } catch (error) {
    const result = {
      targetName: target.name,
      kind: target.kind,
      round: context.round,
      warmup: context.warmup,
      status: "error",
      ttftMs: null,
      totalLatencyMs: performance.now() - requestStartedAt,
      outputDurationMs: null,
      promptTokens: null,
      completionTokens: null,
      tokensPerSecond: null,
      providerTokensPerSecond: null,
      tokenSource: null,
      note: normalizeErrorMessage(error),
    };

    if (!context.warmup) {
      log(`${target.name} 第 ${context.round} 轮失败：${result.note}`, "error");
    } else {
      log(`${target.name} 预热失败：${result.note}`, "error");
    }

    return result;
  }
}

async function runProviderBenchmark(target, config, signal) {
  if (target.kind === "anthropic") {
    return runAnthropicBenchmark(target, config, signal);
  }
  if (target.kind === "ollama") {
    return runOllamaBenchmark(target, config, signal);
  }
  return runOpenAiBenchmark(target, config, signal);
}

async function runOpenAiBenchmark(target, config, signal) {
  const apiUrl = joinUrl(target.baseUrl, target.endpointPath || "/chat/completions");
  const url = shouldUseProxy() ? `/proxy/${apiUrl}` : apiUrl;
  const headers = {
    "Content-Type": "application/json",
    ...target.extraHeaders,
  };

  if (target.apiKey) {
    headers.Authorization = `Bearer ${target.apiKey}`;
  }

  const payload = {
    model: target.model,
    messages: buildMessages(config),
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true,
    stream_options: {
      include_usage: true,
    },
    ...target.extraBody,
  };

  const requestStartedAt = performance.now();
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${await safeReadText(response)}`);
  }

  if (!response.body) {
    throw new Error("目标接口没有返回可读流。");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let outputText = "";
  let usage = null;
  let ttftMs = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || !line.startsWith("data:")) {
        continue;
      }

      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") {
        continue;
      }

      const chunk = JSON.parse(data);
      if (chunk.usage) {
        usage = chunk.usage;
      }

      const piece = extractOpenAiText(chunk);
      if (piece) {
        if (ttftMs === null) {
          ttftMs = performance.now() - requestStartedAt;
        }
        outputText += piece;
      }
    }
  }

  if (buffer.trim().startsWith("data:")) {
    const maybeJson = buffer.trim().slice(5).trim();
    if (maybeJson && maybeJson !== "[DONE]") {
      const chunk = JSON.parse(maybeJson);
      if (chunk.usage) {
        usage = chunk.usage;
      }
      const piece = extractOpenAiText(chunk);
      if (piece) {
        if (ttftMs === null) {
          ttftMs = performance.now() - requestStartedAt;
        }
        outputText += piece;
      }
    }
  }

  return {
    outputText,
    ttftMs,
    promptTokens: usage?.prompt_tokens ?? null,
    completionTokens: usage?.completion_tokens ?? null,
    providerTokensPerSecond: null,
    tokenSource: usage?.completion_tokens ? "api" : "estimated",
    note: usage?.completion_tokens ? "" : "接口未返回 usage，tokens 使用估算值",
  };
}

async function runAnthropicBenchmark(target, config, signal) {
  const apiUrl = joinUrl(target.baseUrl, target.endpointPath || "/messages");
  const url = shouldUseProxy() ? `/proxy/${apiUrl}` : apiUrl;
  const headers = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    ...target.extraHeaders,
  };

  if (target.apiKey) {
    headers["x-api-key"] = target.apiKey;
  }

  const payload = {
    model: target.model,
    messages: [{ role: "user", content: config.prompt }],
    system: config.systemPrompt || undefined,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true,
    ...target.extraBody,
  };

  const requestStartedAt = performance.now();
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${await safeReadText(response)}`);
  }

  if (!response.body) {
    throw new Error("Anthropic 接口没有返回可读流。");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let outputText = "";
  let usage = null;
  let ttftMs = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || !line.startsWith("data:")) {
        continue;
      }

      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") {
        continue;
      }

      const chunk = JSON.parse(data);
      if (chunk.type === "error") {
        throw new Error(chunk.error?.message || "Anthropic 流式响应返回错误");
      }
      if (chunk.usage) {
        usage = { ...usage, ...chunk.usage };
      }

      const piece = extractAnthropicText(chunk);
      if (piece) {
        if (ttftMs === null) {
          ttftMs = performance.now() - requestStartedAt;
        }
        outputText += piece;
      }
    }
  }

  return {
    outputText,
    ttftMs,
    promptTokens: usage?.input_tokens ?? null,
    completionTokens: usage?.output_tokens ?? null,
    providerTokensPerSecond: null,
    tokenSource: usage?.output_tokens ? "api" : "estimated",
    note: usage?.output_tokens ? "" : "接口未返回 usage，tokens 使用估算值",
  };
}

async function runOllamaBenchmark(target, config, signal) {
  const apiUrl = joinUrl(target.baseUrl, target.endpointPath || "/api/generate");
  const url = shouldUseProxy() ? `/proxy/${apiUrl}` : apiUrl;
  const payload = deepMerge(
    {
      model: target.model,
      prompt: config.prompt,
      system: config.systemPrompt || undefined,
      stream: true,
      options: {
        num_predict: config.maxTokens,
        temperature: config.temperature,
      },
    },
    target.extraBody,
  );

  const requestStartedAt = performance.now();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...target.extraHeaders,
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${await safeReadText(response)}`);
  }

  if (!response.body) {
    throw new Error("Ollama 没有返回可读流。");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let outputText = "";
  let finalChunk = null;
  let ttftMs = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }

      const chunk = JSON.parse(line);
      if (chunk.error) {
        throw new Error(chunk.error);
      }
      if (chunk.response) {
        if (ttftMs === null) {
          ttftMs = performance.now() - requestStartedAt;
        }
        outputText += chunk.response;
      }
      if (chunk.done) {
        finalChunk = chunk;
      }
    }
  }

  if (buffer.trim()) {
    const chunk = JSON.parse(buffer.trim());
    if (chunk.error) {
      throw new Error(chunk.error);
    }
    if (chunk.response) {
      if (ttftMs === null) {
        ttftMs = performance.now() - requestStartedAt;
      }
      outputText += chunk.response;
    }
    if (chunk.done) {
      finalChunk = chunk;
    }
  }

  const providerTokensPerSecond =
    finalChunk?.eval_count && finalChunk?.eval_duration
      ? finalChunk.eval_count / (finalChunk.eval_duration / 1_000_000_000)
      : null;

  return {
    outputText,
    ttftMs,
    promptTokens: finalChunk?.prompt_eval_count ?? null,
    completionTokens: finalChunk?.eval_count ?? null,
    providerTokensPerSecond,
    tokenSource: finalChunk?.eval_count ? "api" : "estimated",
    note: finalChunk?.eval_count ? "" : "未拿到 eval_count，tokens 使用估算值",
  };
}

function renderSummary(results) {
  const summary = buildSummary(results);
  const successful = results.filter((item) => item.status === "ok");

  if (!summary.length) {
    dom.summaryEmpty.classList.remove("hidden");
    dom.summaryBoard.classList.add("hidden");
    dom.summaryTableWrap.classList.add("hidden");
    return;
  }

  dom.summaryEmpty.classList.add("hidden");
  dom.summaryBoard.classList.remove("hidden");
  dom.summaryTableWrap.classList.remove("hidden");

  const fastest = summary[0];
  const ttftCandidates = summary.filter((item) => Number.isFinite(item.avgTtftMs));
  const bestTtft =
    ttftCandidates.length > 0
      ? [...ttftCandidates].sort((a, b) => numericSort(a.avgTtftMs, b.avgTtftMs))[0]
      : fastest;
  const successRate = `${successful.length}/${results.length}`;

  dom.summaryBoard.innerHTML = `
    <article class="metric-card">
      <strong>最快输出</strong>
      <span>${escapeHtml(fastest.targetName)}</span>
      <small>${formatNumber(fastest.avgTokensPerSecond)} tokens/s</small>
    </article>
    <article class="metric-card">
      <strong>最低 TTFT</strong>
      <span>${escapeHtml(bestTtft.targetName)}</span>
      <small>${formatMs(bestTtft.avgTtftMs)}</small>
    </article>
    <article class="metric-card">
      <strong>成功率</strong>
      <span>${successRate}</span>
      <small>仅统计正式轮</small>
    </article>
  `;

  dom.summaryTableBody.innerHTML = summary
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.targetName)}</td>
          <td>${item.okCount}/${item.totalCount}</td>
          <td>${formatMs(item.avgTtftMs)}</td>
          <td>${formatMs(item.p95TotalLatencyMs)}</td>
          <td>${formatNumber(item.avgTokensPerSecond)}</td>
          <td>${formatNumber(item.avgProviderTokensPerSecond)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderDetails(results) {
  if (!results.length) {
    dom.detailsEmpty.classList.remove("hidden");
    dom.detailsTableWrap.classList.add("hidden");
    return;
  }

  dom.detailsEmpty.classList.add("hidden");
  dom.detailsTableWrap.classList.remove("hidden");

  dom.detailsTableBody.innerHTML = results
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.targetName)}</td>
          <td>${item.round}</td>
          <td class="${item.status === "ok" ? "status-ok" : "status-error"}">${item.status}</td>
          <td>${formatMs(item.ttftMs)}</td>
          <td>${formatMs(item.totalLatencyMs)}</td>
          <td>${formatNumber(item.completionTokens)}</td>
          <td>${formatNumber(item.tokensPerSecond)}</td>
          <td title="${escapeHtml(item.note || "")}">${escapeHtml(shorten(item.note || "-", 72))}</td>
        </tr>
      `,
    )
    .join("");
}

function buildSummary(results) {
  const groups = new Map();

  for (const item of results) {
    if (item.warmup) {
      continue;
    }
    if (!groups.has(item.targetName)) {
      groups.set(item.targetName, []);
    }
    groups.get(item.targetName).push(item);
  }

  return [...groups.entries()]
    .map(([targetName, items]) => {
      const okItems = items.filter((item) => item.status === "ok");
      return {
        targetName,
        totalCount: items.length,
        okCount: okItems.length,
        avgTtftMs: average(okItems.map((item) => item.ttftMs)),
        p95TotalLatencyMs: percentile(okItems.map((item) => item.totalLatencyMs), 95),
        avgTokensPerSecond: average(okItems.map((item) => item.tokensPerSecond)),
        avgProviderTokensPerSecond: average(okItems.map((item) => item.providerTokensPerSecond)),
      };
    })
    .sort((a, b) => {
      if (a.okCount !== b.okCount) {
        return b.okCount - a.okCount;
      }
      return numericSort(b.avgTokensPerSecond, a.avgTokensPerSecond);
    });
}

function readConfigFromPage() {
  const prompt = dom.promptInput.value.trim();
  if (!prompt) {
    throw new Error("请先填写测试提示词。");
  }

  const targets = [...dom.targetsContainer.querySelectorAll(".target-card")]
    .map(readTargetCard)
    .filter((target) => target.enabled);

  return {
    prompt,
    systemPrompt: dom.systemPromptInput.value.trim(),
    rounds: parsePositiveInt(dom.roundsInput.value, "正式轮数"),
    warmupRounds: parseNonNegativeInt(dom.warmupInput.value, "预热轮数"),
    maxTokens: parsePositiveInt(dom.maxTokensInput.value, "最大输出 Token"),
    temperature: parseFloatOrThrow(dom.temperatureInput.value, "Temperature"),
    targets,
  };
}

function readTargetCard(card) {
  const kind = card.querySelector(".target-kind").value;
  const baseUrl = card.querySelector(".target-base-url").value.trim();
  const model = card.querySelector(".target-model").value.trim();
  const endpointPath = card.querySelector(".target-endpoint-path").value.trim();
  const name =
    card.querySelector(".target-name").value.trim() || `${kind}-${model || "unnamed"}`;
  const apiKey = card.querySelector(".target-api-key").value.trim();
  const extraHeadersText = card.querySelector(".target-extra-headers").value.trim();
  const extraBodyText = card.querySelector(".target-extra-body").value.trim();

  if (!baseUrl) {
    throw new Error(`接口 ${name} 缺少 Base URL。`);
  }

  if (!model) {
    throw new Error(`接口 ${name} 缺少模型名。`);
  }

  return {
    enabled: card.querySelector(".target-enabled").checked,
    kind,
    name,
    baseUrl,
    model,
    endpointPath: endpointPath || defaultEndpointFor(kind),
    apiKey,
    extraHeaders: parseJsonObject(extraHeadersText, `${name} 的额外 Headers`),
    extraBody: parseJsonObject(extraBodyText, `${name} 的额外 Body`),
  };
}

function restoreFromStorage() {
  const raw = getStorageItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const data = JSON.parse(raw);
    dom.promptInput.value = data.prompt ?? "";
    dom.systemPromptInput.value = data.systemPrompt ?? "";
    dom.roundsInput.value = String(data.rounds ?? 3);
    dom.warmupInput.value = String(data.warmupRounds ?? 1);
    dom.maxTokensInput.value = String(data.maxTokens ?? 256);
    dom.temperatureInput.value = String(data.temperature ?? 0);
    dom.targetsContainer.innerHTML = "";
    (data.targets ?? []).forEach((target) => addTargetCard(target));
  } catch {
    log("本地缓存读取失败，已忽略。", "error");
  }
}

function saveToStorage() {
  const payload = {
    prompt: dom.promptInput.value,
    systemPrompt: dom.systemPromptInput.value,
    rounds: dom.roundsInput.value,
    warmupRounds: dom.warmupInput.value,
    maxTokens: dom.maxTokensInput.value,
    temperature: dom.temperatureInput.value,
    targets: [...dom.targetsContainer.querySelectorAll(".target-card")].map((card) => ({
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

  setStorageItem(STORAGE_KEY, JSON.stringify(payload));
}

function clearResults() {
  dom.summaryTableBody.innerHTML = "";
  dom.detailsTableBody.innerHTML = "";
  dom.summaryEmpty.classList.remove("hidden");
  dom.summaryBoard.classList.add("hidden");
  dom.summaryTableWrap.classList.add("hidden");
  dom.detailsEmpty.classList.remove("hidden");
  dom.detailsTableWrap.classList.add("hidden");
}

function exportResults() {
  if (!latestExportPayload) {
    return;
  }

  const blob = new Blob([JSON.stringify(latestExportPayload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `llm-speed-bench-${timestampString()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function setRunning(isRunning) {
  dom.runBtn.disabled = isRunning;
  dom.stopBtn.disabled = !isRunning;
}

function syncExportButton() {
  dom.exportBtn.disabled = !latestExportPayload;
}

function log(message, level = "info", dedupe = false) {
  const prefix = level === "error" ? "[ERROR]" : "[INFO]";
  const line = `${new Date().toLocaleTimeString()} ${prefix} ${message}`;
  if (dedupe && dom.logOutput.textContent.includes(line)) {
    return;
  }
  if (dom.logOutput.textContent === "等待开始…") {
    dom.logOutput.textContent = line;
  } else {
    dom.logOutput.textContent += `\n${line}`;
  }
  dom.logOutput.scrollTop = dom.logOutput.scrollHeight;
}

function buildMessages(config) {
  const messages = [];
  if (config.systemPrompt) {
    messages.push({ role: "system", content: config.systemPrompt });
  }
  messages.push({ role: "user", content: config.prompt });
  return messages;
}

function extractOpenAiText(chunk) {
  if (!Array.isArray(chunk.choices)) {
    return "";
  }

  let text = "";
  for (const choice of chunk.choices) {
    const delta = choice.delta ?? {};
    text += normalizeChunkText(delta.content);
    text += normalizeChunkText(delta.reasoning_content);
  }
  return text;
}

function extractAnthropicText(chunk) {
  if (chunk.type === "content_block_delta") {
    return normalizeChunkText(chunk.delta?.text);
  }
  if (chunk.type === "content_block_start") {
    return normalizeChunkText(chunk.content_block?.text);
  }
  return "";
}

function normalizeChunkText(value) {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (typeof item?.text === "string") {
          return item.text;
        }
        if (typeof item?.content === "string") {
          return item.content;
        }
        return "";
      })
      .join("");
  }
  return "";
}

function joinUrl(baseUrl, path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function defaultEndpointFor(kind) {
  if (kind === "anthropic") {
    return "/messages";
  }
  if (kind === "ollama") {
    return "/api/generate";
  }
  return "/chat/completions";
}

function typeLabel(kind) {
  if (kind === "anthropic") {
    return "Anthropic";
  }
  if (kind === "ollama") {
    return "Ollama";
  }
  return "OpenAI 兼容";
}

function deepMerge(baseValue, overrideValue) {
  if (!isPlainObject(baseValue) || !isPlainObject(overrideValue)) {
    return overrideValue ?? baseValue;
  }

  const merged = { ...baseValue };
  for (const [key, value] of Object.entries(overrideValue)) {
    merged[key] =
      isPlainObject(value) && isPlainObject(baseValue[key])
        ? deepMerge(baseValue[key], value)
        : value;
  }
  return merged;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function average(values) {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (!filtered.length) {
    return null;
  }
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function percentile(values, p) {
  const filtered = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!filtered.length) {
    return null;
  }
  if (filtered.length === 1) {
    return filtered[0];
  }
  const index = (filtered.length - 1) * (p / 100);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return filtered[lower];
  }
  return filtered[lower] + (filtered[upper] - filtered[lower]) * (index - lower);
}

function roughTokenEstimate(text) {
  if (!text) {
    return 0;
  }
  const cjkCount = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const otherCount = text.length - cjkCount;
  return Math.max(1, Math.ceil(cjkCount * 1.1 + otherCount / 4));
}

function parseJsonObject(text, fieldName) {
  if (!text) {
    return {};
  }
  try {
    const parsed = JSON.parse(text);
    if (!isPlainObject(parsed)) {
      throw new Error("必须是 JSON 对象");
    }
    return parsed;
  } catch (error) {
    throw new Error(`${fieldName} JSON 解析失败：${error.message}`);
  }
}

function parsePositiveInt(value, fieldName) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} 必须是大于 0 的整数。`);
  }
  return parsed;
}

function parseNonNegativeInt(value, fieldName) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldName} 必须是大于等于 0 的整数。`);
  }
  return parsed;
}

function parseFloatOrThrow(value, fieldName) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} 必须是数字。`);
  }
  return parsed;
}

function formatMs(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  return `${value.toFixed(0)} ms`;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  return value.toFixed(2);
}

function prettyJson(value) {
  if (!value || !Object.keys(value).length) {
    return "";
  }
  return JSON.stringify(value, null, 2);
}

function timestampString() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function normalizeErrorMessage(error) {
  if (error?.name === "AbortError") {
    return "请求被手动停止。";
  }
  if (error instanceof TypeError) {
    return "请求失败，可能是跨域限制、网络异常，或接口地址不可达。";
  }
  return error?.message || String(error);
}

function redactSecrets(config) {
  return {
    ...config,
    targets: config.targets.map((target) => ({
      ...target,
      apiKey: target.apiKey ? "***" : "",
    })),
  };
}

async function safeReadText(response) {
  try {
    const text = await response.text();
    return text.slice(0, 300);
  } catch {
    return "";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function shorten(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
}

function numericSort(a, b) {
  const safeA = Number.isFinite(a) ? a : -Infinity;
  const safeB = Number.isFinite(b) ? b : -Infinity;
  return safeA - safeB;
}

function getStorageItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorageItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    log("当前浏览器不允许写入本地缓存，页面仍可继续使用。", "error", true);
  }
}

function removeStorageItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    log("当前浏览器不允许清理本地缓存。", "error", true);
  }
}

async function fetchModelList({ kind, baseUrl, apiKey, extraHeaders, modelInput, modelSelect, fetchBtn }) {
  if (!baseUrl.trim()) {
    log("请先填写 Base URL", "error");
    return;
  }

  const originalText = fetchBtn.textContent;
  fetchBtn.disabled = true;
  fetchBtn.textContent = "获取中...";
  modelSelect.classList.add("hidden");

  try {
    let models = [];
    if (kind === "anthropic") {
      models = await fetchAnthropicModels(baseUrl, apiKey, extraHeaders);
    } else if (kind === "ollama") {
      models = await fetchOllamaModels(baseUrl);
    } else {
      models = await fetchOpenAiModels(baseUrl, apiKey, extraHeaders);
    }

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

async function fetchAnthropicModels(baseUrl, apiKey, extraHeadersText) {
  const modelUrl = joinUrl(baseUrl, "/models");
  const url = shouldUseProxy() ? `/proxy/${modelUrl}` : modelUrl;
  const headers = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    ...parseJsonObject(extraHeadersText, "额外 Headers"),
  };

  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.data || !Array.isArray(data.data)) {
    throw new Error("接口返回格式不正确");
  }

  return data.data
    .map((item) => item.id || item.model)
    .filter(Boolean)
    .sort();
}

async function fetchOpenAiModels(baseUrl, apiKey, extraHeadersText) {
  const modelUrl = joinUrl(baseUrl, "/models");
  const url = shouldUseProxy() ? `/proxy/${modelUrl}` : modelUrl;
  
  const headers = {
    "Content-Type": "application/json",
    ...parseJsonObject(extraHeadersText, "额外 Headers"),
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.data || !Array.isArray(data.data)) {
    throw new Error("接口返回格式不正确");
  }

  return data.data
    .map((item) => item.id || item.model)
    .filter(Boolean)
    .sort();
}

async function fetchOllamaModels(baseUrl) {
  const modelUrl = joinUrl(baseUrl, "/api/tags");
  const url = shouldUseProxy() ? `/proxy/${modelUrl}` : modelUrl;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.models || !Array.isArray(data.models)) {
    throw new Error("接口返回格式不正确");
  }

  return data.models
    .map((item) => item.name || item.model)
    .filter(Boolean)
    .sort();
}

function shouldUseProxy() {
  return window.location.protocol === "http:" && window.location.port === "8080";
}
