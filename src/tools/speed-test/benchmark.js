import { formatMs, formatNumber, escapeHtml, shorten, timestampString } from "../../shared/format.js";
import { average, numericSort, percentile, roughTokenEstimate } from "../../shared/stats.js";
import { parseFloatOrThrow, parseNonNegativeInt, parsePositiveInt, normalizeErrorMessage } from "../../shared/validation.js";
import * as dom from "../../shared/dom-cache.js";
import * as providers from "./providers.js";

const STORAGE_KEY = "llm-speed-bench-static-v1";

let latestExportPayload = null;

export function getLatestExportPayload() {
  return latestExportPayload;
}

export function setLatestExportPayload(payload) {
  latestExportPayload = payload;
}

export function clearResults() {
  dom.speedTest.summaryTableBody.innerHTML = "";
  dom.speedTest.detailsTableBody.innerHTML = "";
  dom.speedTest.summaryEmpty.classList.remove("hidden");
  dom.speedTest.summaryBoard.classList.add("hidden");
  dom.speedTest.summaryTableWrap.classList.add("hidden");
  dom.speedTest.detailsEmpty.classList.remove("hidden");
  dom.speedTest.detailsTableWrap.classList.add("hidden");
}

export function renderSummary(results) {
  const summary = buildSummary(results);
  const successful = results.filter((item) => item.status === "ok");

  if (!summary.length) {
    dom.speedTest.summaryEmpty.classList.remove("hidden");
    dom.speedTest.summaryBoard.classList.add("hidden");
    dom.speedTest.summaryTableWrap.classList.add("hidden");
    return;
  }

  dom.speedTest.summaryEmpty.classList.add("hidden");
  dom.speedTest.summaryBoard.classList.remove("hidden");
  dom.speedTest.summaryTableWrap.classList.remove("hidden");

  const fastest = summary[0];
  const ttftCandidates = summary.filter((item) => Number.isFinite(item.avgTtftMs));
  const bestTtft =
    ttftCandidates.length > 0
      ? [...ttftCandidates].sort((a, b) => numericSort(a.avgTtftMs, b.avgTtftMs))[0]
      : fastest;
  const successRate = `${successful.length}/${results.length}`;

  dom.speedTest.summaryBoard.innerHTML = `
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

  dom.speedTest.summaryTableBody.innerHTML = summary
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

export function renderDetails(results) {
  if (!results.length) {
    dom.speedTest.detailsEmpty.classList.remove("hidden");
    dom.speedTest.detailsTableWrap.classList.add("hidden");
    return;
  }

  dom.speedTest.detailsEmpty.classList.add("hidden");
  dom.speedTest.detailsTableWrap.classList.remove("hidden");

  dom.speedTest.detailsTableBody.innerHTML = results
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

export function buildSummary(results) {
  const groups = new Map();

  for (const item of results) {
    if (item.warmup) continue;
    if (!groups.has(item.targetName)) groups.set(item.targetName, []);
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
      if (a.okCount !== b.okCount) return b.okCount - a.okCount;
      return numericSort(b.avgTokensPerSecond, a.avgTokensPerSecond);
    });
}

export async function runBenchmark(config, onLog, onStatus, signal) {
  const runResults = [];

  for (const target of config.targets) {
    onLog(`准备测试 ${target.name} (${target.kind})。`);

    for (let warmupIndex = 1; warmupIndex <= config.warmupRounds; warmupIndex += 1) {
      onLog(`[预热 ${warmupIndex}/${config.warmupRounds}] ${target.name}`);
      await executeSingleRun(target, config, { signal, round: warmupIndex, warmup: true }, onLog);
    }

    for (let roundIndex = 1; roundIndex <= config.rounds; roundIndex += 1) {
      onLog(`[正式 ${roundIndex}/${config.rounds}] ${target.name}`);
      const result = await executeSingleRun(target, config, { signal, round: roundIndex, warmup: false }, onLog);
      runResults.push(result);
      renderDetails(runResults);
      renderSummary(runResults);
      latestExportPayload = {
        generatedAt: new Date().toISOString(),
        config: redactSecrets(config),
        runs: runResults,
        summary: buildSummary(runResults),
      };
    }
  }

  const failedCount = runResults.filter((item) => item.status === "error").length;
  if (failedCount) {
    onStatus(`测速结束，${failedCount} 轮失败，详情见逐轮结果和日志。`, "error");
  } else {
    onStatus("测速完成。", "success");
  }
  onLog("测速完成。");

  return runResults;
}

async function executeSingleRun(target, config, context, onLog) {
  const requestStartedAt = performance.now();

  try {
    const providerResult = await runProviderBenchmark(target, config, context.signal);

    const totalLatencyMs = performance.now() - requestStartedAt;
    const completionTokens =
      providerResult.completionTokens ?? roughTokenEstimate(providerResult.outputText || "");
    const promptTokens =
      providerResult.promptTokens ?? roughTokenEstimate([config.systemPrompt, config.prompt].filter(Boolean).join("\n"));
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
      onLog(
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
      onLog(`${target.name} 第 ${context.round} 轮失败：${result.note}`, "error");
    } else {
      onLog(`${target.name} 预热失败：${result.note}`, "error");
    }

    return result;
  }
}

async function runProviderBenchmark(target, config, signal) {
  if (target.kind === "anthropic") return providers.runAnthropicBenchmark(target, config, signal);
  if (target.kind === "ollama") return providers.runOllamaBenchmark(target, config, signal);
  return providers.runOpenAiBenchmark(target, config, signal);
}

export function readConfigFromPage() {
  const prompt = dom.speedTest.promptInput.value.trim();
  if (!prompt) throw new Error("请先填写测试提示词。");

  const targets = [...dom.speedTest.targetsContainer.querySelectorAll(".target-card")]
    .map(readTargetCard)
    .filter((target) => target.enabled);

  return {
    prompt,
    systemPrompt: dom.speedTest.systemPromptInput.value.trim(),
    rounds: parsePositiveInt(dom.speedTest.roundsInput.value, "正式轮数"),
    warmupRounds: parseNonNegativeInt(dom.speedTest.warmupInput.value, "预热轮数"),
    maxTokens: parsePositiveInt(dom.speedTest.maxTokensInput.value, "最大输出 Token"),
    temperature: parseFloatOrThrow(dom.speedTest.temperatureInput.value, "Temperature"),
    targets,
  };
}

function readTargetCard(card) {
  const kind = card.querySelector(".target-kind").value;
  const baseUrl = card.querySelector(".target-base-url").value.trim();
  const model = card.querySelector(".target-model").value.trim();
  const endpointPath = card.querySelector(".target-endpoint-path").value.trim();
  const name = card.querySelector(".target-name").value.trim() || `${kind}-${model || "unnamed"}`;
  const apiKey = card.querySelector(".target-api-key").value.trim();
  const extraHeadersText = card.querySelector(".target-extra-headers").value.trim();
  const extraBodyText = card.querySelector(".target-extra-body").value.trim();

  if (!baseUrl) throw new Error(`接口 ${name} 缺少 Base URL。`);
  if (!model) throw new Error(`接口 ${name} 缺少模型名。`);

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

function defaultEndpointFor(kind) {
  if (kind === "anthropic") return "/messages";
  if (kind === "ollama") return "/api/generate";
  return "/chat/completions";
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

export function exportResults() {
  if (!latestExportPayload) return;

  const blob = new Blob([JSON.stringify(latestExportPayload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `llm-speed-bench-${timestampString()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}