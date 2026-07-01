import { useRef, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { exportResults, runSpeedTest, type SpeedResult, type SpeedTarget } from "./logic";

export default function Tool() {
  const [target, setTarget] = useState<SpeedTarget>({ provider: "openai", baseUrl: "https://api.openai.com/v1", apiKey: "", model: "" });
  const [prompt, setPrompt] = useState("请用一句话介绍你自己。");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [maxTokens, setMaxTokens] = useState(256);
  const [temperature, setTemperature] = useState(0.7);
  const [results, setResults] = useState<SpeedResult[]>([]);
  const [status, setStatus] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("测速中...");
    try {
      const result = await runSpeedTest(target, { prompt, systemPrompt, maxTokens, temperature }, controller.signal);
      setResults((current) => [result, ...current]);
      setStatus("测速完成");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  function updateTarget<K extends keyof SpeedTarget>(key: K, value: SpeedTarget[K]) {
    setTarget((current) => ({ ...current, [key]: value }));
  }

  return (
    <ToolLayout title="大模型测速" description="测试 OpenAI、Anthropic、Ollama 兼容接口响应速度。">
      <div className="tool-panel tool-stack">
        <div className="tool-inline-controls">
          <label>Provider<select value={target.provider} onChange={(event) => updateTarget("provider", event.target.value as SpeedTarget["provider"])}><option value="openai">OpenAI 兼容</option><option value="anthropic">Anthropic</option><option value="ollama">Ollama</option></select></label>
          <label>Base URL<input value={target.baseUrl} onChange={(event) => updateTarget("baseUrl", event.target.value)} /></label>
          <label>Model<input value={target.model} onChange={(event) => updateTarget("model", event.target.value)} placeholder="模型名" /></label>
          <label>API Key<input type="password" value={target.apiKey} onChange={(event) => updateTarget("apiKey", event.target.value)} /></label>
        </div>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} />
        <textarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={3} placeholder="System prompt，可选" />
        <div className="tool-inline-controls">
          <label>Max tokens<input type="number" value={maxTokens} onChange={(event) => setMaxTokens(Number(event.target.value))} /></label>
          <label>Temperature<input type="number" step={0.1} value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} /></label>
        </div>
        <div className="tool-button-row">
          <button type="button" disabled={!target.baseUrl || !target.model || !prompt} onClick={run}>开始测速</button>
          <button type="button" onClick={() => abortRef.current?.abort()}>停止</button>
          <button type="button" disabled={!results.length} onClick={() => exportResults(results)}>导出 JSON</button>
        </div>
        <p className="tool-status">{status}</p>
        <div className="tool-stack">
          {results.map((result, index) => (
            <article className="template-card" key={`${result.model}-${index}`}>
              <h3>{result.provider} / {result.model}</h3>
              <div className="stat-grid"><span>总耗时: {result.totalMs.toFixed(0)} ms</span><span>TTFT: {result.ttftMs?.toFixed(0) ?? "-"} ms</span><span>输出字符: {result.outputChars}</span></div>
              <pre>{result.outputText}</pre>
            </article>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
