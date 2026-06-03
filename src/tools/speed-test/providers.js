import { joinUrl, shouldUseProxy } from "../../shared/url.js";
import { safeReadText } from "../../shared/validation.js";

function buildMessages(config) {
  const messages = [];
  if (config.systemPrompt) {
    messages.push({ role: "system", content: config.systemPrompt });
  }
  messages.push({ role: "user", content: config.prompt });
  return messages;
}

function extractOpenAiText(chunk) {
  if (!Array.isArray(chunk.choices)) return "";
  let text = "";
  for (const choice of chunk.choices) {
    const delta = choice.delta ?? {};
    text += normalizeChunkText(delta.content);
    text += normalizeChunkText(delta.reasoning_content);
  }
  return text;
}

function extractAnthropicText(chunk) {
  if (chunk.type === "content_block_delta") return normalizeChunkText(chunk.delta?.text);
  if (chunk.type === "content_block_start") return normalizeChunkText(chunk.content_block?.text);
  return "";
}

function normalizeChunkText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item?.text === "string") return item.text;
        if (typeof item?.content === "string") return item.content;
        return "";
      })
      .join("");
  }
  return "";
}

async function readSseStream(response, parser, requestStartedAt) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let outputText = "";
  let usage = null;
  let ttftMs = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || !line.startsWith("data:")) continue;

      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;

      const chunk = JSON.parse(data);
      if (chunk.usage) usage = chunk.usage;

      const piece = parser(chunk);
      if (piece) {
        if (ttftMs === null) ttftMs = performance.now() - requestStartedAt;
        outputText += piece;
      }
    }
  }

  // 处理缓冲区剩余
  if (buffer.trim().startsWith("data:")) {
    const maybeJson = buffer.trim().slice(5).trim();
    if (maybeJson && maybeJson !== "[DONE]") {
      const chunk = JSON.parse(maybeJson);
      if (chunk.usage) usage = chunk.usage;
      const piece = parser(chunk);
      if (piece) {
        if (ttftMs === null) ttftMs = performance.now() - requestStartedAt;
        outputText += piece;
      }
    }
  }

  return { outputText, ttftMs, usage };
}

export async function runOpenAiBenchmark(target, config, signal) {
  const apiUrl = joinUrl(target.baseUrl, target.endpointPath || "/chat/completions");
  const url = shouldUseProxy() ? `/proxy/${apiUrl}` : apiUrl;
  const headers = { "Content-Type": "application/json", ...target.extraHeaders };
  if (target.apiKey) headers.Authorization = `Bearer ${target.apiKey}`;

  const payload = {
    model: target.model,
    messages: buildMessages(config),
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true,
    stream_options: { include_usage: true },
    ...target.extraBody,
  };

  const requestStartedAt = performance.now();
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}: ${await safeReadText(response)}`);
  if (!response.body) throw new Error("目标接口没有返回可读流。");

  const { outputText, ttftMs, usage } = await readSseStream(response, extractOpenAiText, requestStartedAt);

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

export async function runAnthropicBenchmark(target, config, signal) {
  const apiUrl = joinUrl(target.baseUrl, target.endpointPath || "/messages");
  const url = shouldUseProxy() ? `/proxy/${apiUrl}` : apiUrl;
  const headers = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    ...target.extraHeaders,
  };
  if (target.apiKey) headers["x-api-key"] = target.apiKey;

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

  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}: ${await safeReadText(response)}`);
  if (!response.body) throw new Error("Anthropic 接口没有返回可读流。");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let outputText = "";
  let usage = null;
  let ttftMs = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || !line.startsWith("data:")) continue;

      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;

      const chunk = JSON.parse(data);
      if (chunk.type === "error") throw new Error(chunk.error?.message || "Anthropic 流式响应返回错误");
      if (chunk.usage) usage = { ...usage, ...chunk.usage };

      const piece = extractAnthropicText(chunk);
      if (piece) {
        if (ttftMs === null) ttftMs = performance.now() - requestStartedAt;
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

export async function runOllamaBenchmark(target, config, signal) {
  const apiUrl = joinUrl(target.baseUrl, target.endpointPath || "/api/generate");
  const url = shouldUseProxy() ? `/proxy/${apiUrl}` : apiUrl;

  const { deepMerge } = await import("../../shared/object.js");
  const payload = deepMerge(
    {
      model: target.model,
      prompt: config.prompt,
      system: config.systemPrompt || undefined,
      stream: true,
      options: { num_predict: config.maxTokens, temperature: config.temperature },
    },
    target.extraBody,
  );

  const requestStartedAt = performance.now();
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...target.extraHeaders },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}: ${await safeReadText(response)}`);
  if (!response.body) throw new Error("Ollama 没有返回可读流。");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let outputText = "";
  let finalChunk = null;
  let ttftMs = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const chunk = JSON.parse(line);
      if (chunk.error) throw new Error(chunk.error);
      if (chunk.response) {
        if (ttftMs === null) ttftMs = performance.now() - requestStartedAt;
        outputText += chunk.response;
      }
      if (chunk.done) finalChunk = chunk;
    }
  }

  if (buffer.trim()) {
    const chunk = JSON.parse(buffer.trim());
    if (chunk.error) throw new Error(chunk.error);
    if (chunk.response) {
      if (ttftMs === null) ttftMs = performance.now() - requestStartedAt;
      outputText += chunk.response;
    }
    if (chunk.done) finalChunk = chunk;
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
