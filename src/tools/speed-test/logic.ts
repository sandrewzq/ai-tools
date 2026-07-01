import { average, numericSort, percentile, roughTokenEstimate } from "../../shared/stats";
import { normalizeErrorMessage } from "../../shared/validation";
import { parseJsonObject } from "../../shared/object";
import * as providers from "./providers";
import { fetchModelList as fetchModels } from "./model-fetcher";

export type SpeedProvider = "openai" | "anthropic" | "ollama";

export type SpeedTarget = {
  id: string;
  enabled: boolean;
  name: string;
  kind: SpeedProvider;
  baseUrl: string;
  model: string;
  endpointPath: string;
  apiKey: string;
  extraHeadersText: string;
  extraBodyText: string;
};

export type SpeedConfig = {
  prompt: string;
  systemPrompt: string;
  rounds: number;
  warmupRounds: number;
  maxTokens: number;
  temperature: number;
  targets: SpeedTarget[];
};

export type SpeedRunResult = {
  targetName: string;
  kind: SpeedProvider;
  round: number;
  warmup: boolean;
  status: "ok" | "error";
  ttftMs: number | null;
  totalLatencyMs: number;
  outputDurationMs: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  tokensPerSecond: number | null;
  providerTokensPerSecond: number | null;
  tokenSource: string | null;
  note: string;
};

export type SpeedSummary = {
  targetName: string;
  totalCount: number;
  okCount: number;
  avgTtftMs: number | null;
  p95TotalLatencyMs: number | null;
  avgTokensPerSecond: number | null;
  avgProviderTokensPerSecond: number | null;
};

export function createTarget(kind: SpeedProvider = "openai"): SpeedTarget {
  return {
    id: crypto.randomUUID(),
    enabled: true,
    name: "",
    kind,
    baseUrl: defaultBaseUrlFor(kind),
    model: "",
    endpointPath: defaultEndpointFor(kind),
    apiKey: "",
    extraHeadersText: "",
    extraBodyText: "",
  };
}

export function defaultBaseUrlFor(kind: SpeedProvider) {
  if (kind === "anthropic") return "https://api.anthropic.com/v1";
  if (kind === "ollama") return "http://localhost:11434";
  return "https://api.openai.com/v1";
}

export function defaultEndpointFor(kind: SpeedProvider) {
  if (kind === "anthropic") return "/messages";
  if (kind === "ollama") return "/api/generate";
  return "/chat/completions";
}

export function typeLabel(kind: SpeedProvider) {
  if (kind === "anthropic") return "Anthropic";
  if (kind === "ollama") return "Ollama";
  return "OpenAI 兼容";
}

export function validateConfig(config: SpeedConfig) {
  if (!config.prompt.trim()) throw new Error("请先填写测试提示词。");
  if (!Number.isInteger(config.rounds) || config.rounds <= 0) throw new Error("正式轮数必须是大于 0 的整数。");
  if (!Number.isInteger(config.warmupRounds) || config.warmupRounds < 0) throw new Error("预热轮数必须是大于等于 0 的整数。");
  if (!Number.isFinite(config.maxTokens) || config.maxTokens <= 0) throw new Error("Max tokens 必须是大于 0 的数字。");
  if (!Number.isFinite(config.temperature)) throw new Error("Temperature 必须是数字。");
  const enabledTargets = config.targets.filter((target) => target.enabled);
  if (!enabledTargets.length) throw new Error("请至少启用一个测试目标。");
  enabledTargets.forEach((target, index) => {
    const label = target.name.trim() || `${typeLabel(target.kind)} #${index + 1}`;
    if (!target.baseUrl.trim()) throw new Error(`${label} 缺少 Base URL。`);
    if (!target.model.trim()) throw new Error(`${label} 缺少模型名称。`);
    parseJsonObject(target.extraHeadersText, `${label} 额外 Headers`);
    parseJsonObject(target.extraBodyText, `${label} 额外 Body`);
  });
}

export async function fetchModelList(target: SpeedTarget) {
  return fetchModels({
    kind: target.kind,
    baseUrl: target.baseUrl,
    apiKey: target.apiKey,
    extraHeaders: target.extraHeadersText,
  });
}

export async function runBenchmark(
  config: SpeedConfig,
  onProgress: (event: { type: "log" | "result"; message?: string; result?: SpeedRunResult }) => void,
  signal: AbortSignal,
) {
  validateConfig(config);
  const runResults: SpeedRunResult[] = [];
  const enabledTargets = config.targets.filter((target) => target.enabled);

  for (const rawTarget of enabledTargets) {
    const target = normalizeTarget(rawTarget);
    onProgress({ type: "log", message: `准备测试 ${target.name} (${target.kind})。` });

    for (let warmupIndex = 1; warmupIndex <= config.warmupRounds; warmupIndex += 1) {
      onProgress({ type: "log", message: `[预热 ${warmupIndex}/${config.warmupRounds}] ${target.name}` });
      await executeSingleRun(target, config, { signal, round: warmupIndex, warmup: true }, onProgress);
    }

    for (let roundIndex = 1; roundIndex <= config.rounds; roundIndex += 1) {
      onProgress({ type: "log", message: `[正式 ${roundIndex}/${config.rounds}] ${target.name}` });
      const result = await executeSingleRun(target, config, { signal, round: roundIndex, warmup: false }, onProgress);
      runResults.push(result);
      onProgress({ type: "result", result });
    }
  }

  return runResults;
}

function normalizeTarget(target: SpeedTarget) {
  return {
    ...target,
    name: target.name.trim() || `${typeLabel(target.kind)} / ${target.model || "未命名模型"}`,
    extraHeaders: parseJsonObject(target.extraHeadersText, "额外 Headers"),
    extraBody: parseJsonObject(target.extraBodyText, "额外 Body"),
  };
}

async function executeSingleRun(
  target: ReturnType<typeof normalizeTarget>,
  config: SpeedConfig,
  context: { signal: AbortSignal; round: number; warmup: boolean },
  onProgress: (event: { type: "log"; message: string }) => void,
): Promise<SpeedRunResult> {
  const requestStartedAt = performance.now();

  try {
    const providerResult = await runProviderBenchmark(target, config, context.signal);
    const totalLatencyMs = performance.now() - requestStartedAt;
    const completionTokens = providerResult.completionTokens ?? roughTokenEstimate(providerResult.outputText || "");
    const promptTokens = providerResult.promptTokens ?? roughTokenEstimate([config.systemPrompt, config.prompt].filter(Boolean).join("\n"));
    const outputDurationMs = providerResult.ttftMs === null ? null : Math.max(totalLatencyMs - providerResult.ttftMs, 0);
    const tokensPerSecond =
      completionTokens > 0 && outputDurationMs && outputDurationMs > 0 ? completionTokens / (outputDurationMs / 1000) : null;

    const result: SpeedRunResult = {
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
      onProgress({
        type: "log",
        message: `${target.name} 第 ${context.round} 轮完成：TTFT ${formatMs(result.ttftMs)}，总耗时 ${formatMs(result.totalLatencyMs)}，tokens/s ${formatNumber(result.tokensPerSecond)}。`,
      });
    }

    return result;
  } catch (error) {
    const result: SpeedRunResult = {
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

    onProgress({ type: "log", message: context.warmup ? `${target.name} 预热失败：${result.note}` : `${target.name} 第 ${context.round} 轮失败：${result.note}` });
    return result;
  }
}

async function runProviderBenchmark(target: ReturnType<typeof normalizeTarget>, config: SpeedConfig, signal: AbortSignal) {
  if (target.kind === "anthropic") return providers.runAnthropicBenchmark(target, config, signal);
  if (target.kind === "ollama") return providers.runOllamaBenchmark(target, config, signal);
  return providers.runOpenAiBenchmark(target, config, signal);
}

export function buildSummary(results: SpeedRunResult[]): SpeedSummary[] {
  const groups = new Map<string, SpeedRunResult[]>();

  for (const item of results) {
    if (item.warmup) continue;
    if (!groups.has(item.targetName)) groups.set(item.targetName, []);
    groups.get(item.targetName)?.push(item);
  }

  return [...groups.entries()]
    .map(([targetName, items]) => {
      const okItems = items.filter((item) => item.status === "ok");
      return {
        targetName,
        totalCount: items.length,
        okCount: okItems.length,
        avgTtftMs: average(okItems.map((item) => item.ttftMs ?? Number.NaN)),
        p95TotalLatencyMs: percentile(okItems.map((item) => item.totalLatencyMs), 95),
        avgTokensPerSecond: average(okItems.map((item) => item.tokensPerSecond ?? Number.NaN)),
        avgProviderTokensPerSecond: average(okItems.map((item) => item.providerTokensPerSecond ?? Number.NaN)),
      };
    })
    .sort((a, b) => {
      if (a.okCount !== b.okCount) return b.okCount - a.okCount;
      return numericSort(b.avgTokensPerSecond ?? Number.NaN, a.avgTokensPerSecond ?? Number.NaN);
    });
}

export function exportResults(config: SpeedConfig, results: SpeedRunResult[]) {
  const payload = {
    generatedAt: new Date().toISOString(),
    config: {
      ...config,
      targets: config.targets.map(({ apiKey: _apiKey, ...target }) => target),
    },
    runs: results,
    summary: buildSummary(results),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `llm-speed-results-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatMs(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(0)} ms`;
}

export function formatNumber(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "-";
  return value.toFixed(2);
}
