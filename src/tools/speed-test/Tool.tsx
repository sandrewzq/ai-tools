import { useMemo, useRef, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import {
  buildSummary,
  createTarget,
  defaultBaseUrlFor,
  defaultEndpointFor,
  exportResults,
  fetchModelList,
  formatMs,
  formatNumber,
  runBenchmark,
  type SpeedProvider,
  type SpeedRunResult,
  type SpeedTarget,
} from "./logic";

export default function Tool() {
  const [targets, setTargets] = useState<SpeedTarget[]>(() => [createTarget("openai")]);
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [rounds, setRounds] = useState(3);
  const [warmupRounds, setWarmupRounds] = useState(1);
  const [maxTokens, setMaxTokens] = useState(256);
  const [temperature, setTemperature] = useState(0);
  const [results, setResults] = useState<SpeedRunResult[]>([]);
  const [logs, setLogs] = useState<string[]>(["等待开始..."]);
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);
  const [modelOptions, setModelOptions] = useState<Record<string, string[]>>({});
  const abortRef = useRef<AbortController | null>(null);

  const config = useMemo(
    () => ({ prompt, systemPrompt, rounds, warmupRounds, maxTokens, temperature, targets }),
    [maxTokens, prompt, rounds, systemPrompt, targets, temperature, warmupRounds],
  );
  const summary = useMemo(() => buildSummary(results), [results]);

  function log(message: string) {
    setLogs((current) => [message, ...current.filter((item) => item !== "等待开始...")].slice(0, 120));
  }

  function updateTarget(id: string, updater: (target: SpeedTarget) => SpeedTarget) {
    setTargets((current) => current.map((target) => (target.id === id ? updater(target) : target)));
  }

  function addTarget(kind: SpeedProvider) {
    setTargets((current) => [...current, createTarget(kind)]);
  }

  function removeTarget(id: string) {
    setTargets((current) => (current.length > 1 ? current.filter((target) => target.id !== id) : current));
  }

  function fillExampleConfig() {
    setPrompt("请用 300 字解释什么是 RAG，并补充一个电商客服场景案例。");
    setSystemPrompt("");
    setRounds(3);
    setWarmupRounds(1);
    setMaxTokens(256);
    setTemperature(0);
    setStatus("已填充测试参数，接口配置保持不变。");
    log("已填充测试参数，接口配置保持不变。");
  }

  function resetPage() {
    abortRef.current?.abort();
    setTargets([createTarget("openai")]);
    setPrompt("");
    setSystemPrompt("");
    setRounds(3);
    setWarmupRounds(1);
    setMaxTokens(256);
    setTemperature(0);
    setResults([]);
    setLogs(["等待开始..."]);
    setStatus("页面已重置。");
  }

  async function loadModels(target: SpeedTarget) {
    try {
      log(`开始获取 ${target.name || target.baseUrl} 的模型列表。`);
      const models = await fetchModelList(target);
      setModelOptions((current) => ({ ...current, [target.id]: models }));
      if (models[0] && !target.model.trim()) updateTarget(target.id, (item) => ({ ...item, model: models[0] }));
      log(`成功获取 ${models.length} 个模型。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`获取模型列表失败：${message}`);
      log(`获取模型列表失败：${message}`);
    }
  }

  async function run() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setStatus("测速中...");
    setResults([]);
    setLogs([]);
    try {
      const runResults = await runBenchmark(
        config,
        (event) => {
          if (event.type === "log" && event.message) log(event.message);
          if (event.type === "result" && event.result) {
            const result = event.result;
            setResults((current) => [...current, result]);
          }
        },
        controller.signal,
      );
      const failedCount = runResults.filter((item) => item.status === "error").length;
      setStatus(failedCount ? `测速结束，${failedCount} 轮失败，详情见逐轮结果和日志。` : "测速完成。");
      log("测速完成。");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(message);
      log(message);
    } finally {
      setRunning(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
    setRunning(false);
    setStatus("已停止。");
    log("已停止。");
  }

  return (
    <ToolLayout title="大模型测速" description="对比 OpenAI 兼容接口和 Anthropic 接口的 TTFT、总耗时、tokens/s。">
      <section className="panel speed-panel">
        <div className="section-head compact">
          <div>
            <p className="section-tag">Targets</p>
            <h2>测试目标</h2>
          </div>
          <div className="action-bar">
            <button className="ghost-btn" type="button" onClick={() => addTarget("openai")}>
              添加 OpenAI
            </button>
            <button className="ghost-btn" type="button" onClick={() => addTarget("anthropic")}>
              添加 Anthropic
            </button>
            <button className="ghost-btn" type="button" onClick={() => addTarget("ollama")}>
              添加 Ollama
            </button>
          </div>
        </div>

        <div className="target-list">
          {targets.map((target, index) => (
            <article className="target-card" key={target.id}>
              <div className="target-card-head">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={target.enabled}
                    onChange={(event) => updateTarget(target.id, (item) => ({ ...item, enabled: event.target.checked }))}
                  />
                  启用
                </label>
                <strong>{target.name || `目标 ${index + 1}`}</strong>
                <span className="target-type-badge">{target.kind}</span>
                <button className="ghost-btn" type="button" onClick={() => removeTarget(target.id)}>
                  删除
                </button>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>名称</span>
                  <input value={target.name} onChange={(event) => updateTarget(target.id, (item) => ({ ...item, name: event.target.value }))} />
                </label>
                <label className="field">
                  <span>类型</span>
                  <select
                    value={target.kind}
                    onChange={(event) => {
                      const kind = event.target.value as SpeedProvider;
                      updateTarget(target.id, (item) => ({ ...item, kind, baseUrl: defaultBaseUrlFor(kind), endpointPath: defaultEndpointFor(kind) }));
                    }}
                  >
                    <option value="openai">OpenAI 兼容</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="ollama">Ollama</option>
                  </select>
                </label>
                <label className="field field-span-2">
                  <span>Base URL</span>
                  <input value={target.baseUrl} onChange={(event) => updateTarget(target.id, (item) => ({ ...item, baseUrl: event.target.value }))} />
                </label>
                <label className="field">
                  <span>模型</span>
                  <input value={target.model} onChange={(event) => updateTarget(target.id, (item) => ({ ...item, model: event.target.value }))} />
                </label>
                <label className="field">
                  <span>模型列表</span>
                  <div className="model-row">
                    <button className="ghost-btn" type="button" onClick={() => loadModels(target)}>
                      获取模型
                    </button>
                    <select
                      value=""
                      onChange={(event) => event.target.value && updateTarget(target.id, (item) => ({ ...item, model: event.target.value }))}
                    >
                      <option value="">选择模型</option>
                      {(modelOptions[target.id] || []).map((model) => (
                        <option value={model} key={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
                <label className="field">
                  <span>Endpoint Path</span>
                  <input
                    value={target.endpointPath}
                    onChange={(event) => updateTarget(target.id, (item) => ({ ...item, endpointPath: event.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>API Key</span>
                  <input
                    type="password"
                    value={target.apiKey}
                    onChange={(event) => updateTarget(target.id, (item) => ({ ...item, apiKey: event.target.value }))}
                    autoComplete="off"
                  />
                </label>
                <label className="field field-span-2">
                  <span>额外 Headers JSON</span>
                  <textarea
                    value={target.extraHeadersText}
                    onChange={(event) => updateTarget(target.id, (item) => ({ ...item, extraHeadersText: event.target.value }))}
                    rows={3}
                  />
                </label>
                <label className="field field-span-2">
                  <span>额外 Body JSON</span>
                  <textarea
                    value={target.extraBodyText}
                    onChange={(event) => updateTarget(target.id, (item) => ({ ...item, extraBodyText: event.target.value }))}
                    rows={3}
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-head compact">
          <div>
            <p className="section-tag">Prompt</p>
            <h2>测试参数</h2>
          </div>
        </div>
        <div className="form-grid">
          <label className="field field-span-4">
            <span>Prompt</span>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={6} />
          </label>
          <label className="field field-span-4">
            <span>System Prompt</span>
            <textarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={3} />
          </label>
          <label className="field">
            <span>正式轮数</span>
            <input type="number" min={1} value={rounds} onChange={(event) => setRounds(Number(event.target.value))} />
          </label>
          <label className="field">
            <span>预热轮数</span>
            <input type="number" min={0} value={warmupRounds} onChange={(event) => setWarmupRounds(Number(event.target.value))} />
          </label>
          <label className="field">
            <span>Max tokens</span>
            <input type="number" min={1} value={maxTokens} onChange={(event) => setMaxTokens(Number(event.target.value))} />
          </label>
          <label className="field">
            <span>Temperature</span>
            <input type="number" step={0.1} value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} />
          </label>
        </div>
        <div className="action-bar">
          <button className="primary-btn" type="button" disabled={running} onClick={run}>
            开始测速
          </button>
          <button className="ghost-btn" type="button" onClick={stop}>
            停止
          </button>
          <button className="ghost-btn" type="button" onClick={fillExampleConfig}>
            填充示例
          </button>
          <button className="ghost-btn" type="button" onClick={resetPage}>
            重置
          </button>
          <button className="ghost-btn" type="button" disabled={!results.length} onClick={() => exportResults(config, results)}>
            导出 JSON
          </button>
        </div>
        {status ? <p className="status-message">{status}</p> : null}
      </section>

      <section className="panel">
        <div className="section-head compact">
          <div>
            <p className="section-tag">Summary</p>
            <h2>汇总结果</h2>
          </div>
        </div>
        {summary.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>目标</th>
                  <th>成功</th>
                  <th>平均 TTFT</th>
                  <th>P95 总耗时</th>
                  <th>平均 tokens/s</th>
                  <th>接口 tokens/s</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((item) => (
                  <tr key={item.targetName}>
                    <td>{item.targetName}</td>
                    <td>
                      {item.okCount}/{item.totalCount}
                    </td>
                    <td>{formatMs(item.avgTtftMs)}</td>
                    <td>{formatMs(item.p95TotalLatencyMs)}</td>
                    <td>{formatNumber(item.avgTokensPerSecond)}</td>
                    <td>{formatNumber(item.avgProviderTokensPerSecond)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">运行后展示汇总结果。</p>
        )}
      </section>

      <section className="panel">
        <div className="section-head compact">
          <div>
            <p className="section-tag">Details</p>
            <h2>逐轮结果</h2>
          </div>
        </div>
        {results.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>目标</th>
                  <th>轮次</th>
                  <th>状态</th>
                  <th>TTFT</th>
                  <th>总耗时</th>
                  <th>输出 tokens</th>
                  <th>tokens/s</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={`${result.targetName}-${result.round}-${index}`}>
                    <td>{result.targetName}</td>
                    <td>{result.round}</td>
                    <td>{result.status}</td>
                    <td>{formatMs(result.ttftMs)}</td>
                    <td>{formatMs(result.totalLatencyMs)}</td>
                    <td>{formatNumber(result.completionTokens)}</td>
                    <td>{formatNumber(result.tokensPerSecond)}</td>
                    <td>{result.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">暂无逐轮结果。</p>
        )}
      </section>

      <section className="panel">
        <div className="section-head compact">
          <div>
            <p className="section-tag">Log</p>
            <h2>运行日志</h2>
          </div>
          <button className="ghost-btn" type="button" onClick={() => setLogs(["等待开始..."])}>
            清空日志
          </button>
        </div>
        <pre className="log-output">{logs.join("\n")}</pre>
      </section>
    </ToolLayout>
  );
}
