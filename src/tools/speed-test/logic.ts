import { joinUrl, shouldUseProxy } from "../../shared/url";

export type SpeedTarget = {
  provider: "openai" | "anthropic" | "ollama";
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type SpeedConfig = {
  prompt: string;
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
};

export type SpeedResult = {
  provider: string;
  model: string;
  ttftMs: number | null;
  totalMs: number;
  outputChars: number;
  outputText: string;
};

function withProxy(url: string) {
  return shouldUseProxy() ? `/proxy/${url}` : url;
}

export async function runSpeedTest(target: SpeedTarget, config: SpeedConfig, signal: AbortSignal): Promise<SpeedResult> {
  if (target.provider === "ollama") return runOllama(target, config, signal);
  if (target.provider === "anthropic") return runAnthropic(target, config, signal);
  return runOpenAi(target, config, signal);
}

async function runOpenAi(target: SpeedTarget, config: SpeedConfig, signal: AbortSignal): Promise<SpeedResult> {
  const started = performance.now();
  const response = await fetch(withProxy(joinUrl(target.baseUrl, "/chat/completions")), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(target.apiKey ? { Authorization: `Bearer ${target.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: target.model,
      messages: [
        ...(config.systemPrompt ? [{ role: "system", content: config.systemPrompt }] : []),
        { role: "user", content: config.prompt },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: false,
    }),
    signal,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`);
  const totalMs = performance.now() - started;
  const outputText = data?.choices?.[0]?.message?.content || "";
  return { provider: "OpenAI", model: target.model, ttftMs: totalMs, totalMs, outputChars: outputText.length, outputText };
}

async function runAnthropic(target: SpeedTarget, config: SpeedConfig, signal: AbortSignal): Promise<SpeedResult> {
  const started = performance.now();
  const response = await fetch(withProxy(joinUrl(target.baseUrl, "/messages")), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      ...(target.apiKey ? { "x-api-key": target.apiKey } : {}),
    },
    body: JSON.stringify({
      model: target.model,
      messages: [{ role: "user", content: config.prompt }],
      system: config.systemPrompt || undefined,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: false,
    }),
    signal,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`);
  const totalMs = performance.now() - started;
  const outputText = data?.content?.map((item: { text?: string }) => item.text || "").join("") || "";
  return { provider: "Anthropic", model: target.model, ttftMs: totalMs, totalMs, outputChars: outputText.length, outputText };
}

async function runOllama(target: SpeedTarget, config: SpeedConfig, signal: AbortSignal): Promise<SpeedResult> {
  const started = performance.now();
  const response = await fetch(withProxy(joinUrl(target.baseUrl, "/api/generate")), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: target.model, prompt: config.prompt, stream: false }),
    signal,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
  const totalMs = performance.now() - started;
  const outputText = data?.response || "";
  return { provider: "Ollama", model: target.model, ttftMs: totalMs, totalMs, outputChars: outputText.length, outputText };
}

export function exportResults(results: SpeedResult[]) {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), results }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `llm-speed-results-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
