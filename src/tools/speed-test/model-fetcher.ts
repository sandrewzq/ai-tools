// @ts-nocheck
import { joinUrl, shouldUseProxy } from "../../shared/url";
import { parseJsonObject } from "../../shared/object";

export async function fetchModelList({ kind, baseUrl, apiKey, extraHeaders }) {
  if (!baseUrl.trim()) {
    throw new Error("请先填写 Base URL");
  }

  if (kind === "anthropic") {
    return fetchAnthropicModels(baseUrl, apiKey, extraHeaders);
  }
  if (kind === "ollama") {
    return fetchOllamaModels(baseUrl);
  }
  return fetchOpenAiModels(baseUrl, apiKey, extraHeaders);
}

async function fetchAnthropicModels(baseUrl, apiKey, extraHeadersText) {
  const modelUrl = joinUrl(baseUrl, "/models");
  const url = shouldUseProxy() ? `/proxy/${modelUrl}` : modelUrl;
  const headers = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    ...parseJsonObject(extraHeadersText, "额外 Headers"),
  };

  if (apiKey) headers["x-api-key"] = apiKey;

  const response = await fetch(url, { method: "GET", headers });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

  const data = await response.json();
  if (!data.data || !Array.isArray(data.data)) throw new Error("接口返回格式不正确");

  return data.data.map((item) => item.id || item.model).filter(Boolean).sort();
}

async function fetchOpenAiModels(baseUrl, apiKey, extraHeadersText) {
  const modelUrl = joinUrl(baseUrl, "/models");
  const url = shouldUseProxy() ? `/proxy/${modelUrl}` : modelUrl;
  const headers = {
    "Content-Type": "application/json",
    ...parseJsonObject(extraHeadersText, "额外 Headers"),
  };

  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(url, { method: "GET", headers });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

  const data = await response.json();
  if (!data.data || !Array.isArray(data.data)) throw new Error("接口返回格式不正确");

  return data.data.map((item) => item.id || item.model).filter(Boolean).sort();
}

async function fetchOllamaModels(baseUrl) {
  const modelUrl = joinUrl(baseUrl, "/api/tags");
  const url = shouldUseProxy() ? `/proxy/${modelUrl}` : modelUrl;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

  const data = await response.json();
  if (!data.models || !Array.isArray(data.models)) throw new Error("接口返回格式不正确");

  return data.models.map((item) => item.name || item.model).filter(Boolean).sort();
}
