import { useEffect, useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { compactYaml, formatYaml, getYamlStats, jsonToYaml, yamlToJson } from "./logic";

const SAMPLE = "name: demo\nactive: true\nitems:\n  - api\n  - web";

type ResultState = {
  output: string;
  jsonOutput: string;
  parsed: unknown | null;
  error: string;
};

export default function Tool() {
  const [input, setInput] = useState(SAMPLE);
  const [result, setResult] = useState<ResultState>(() => buildResult(formatYaml(SAMPLE), false));
  const [toast, setToast] = useState("");
  const stats = useMemo(() => (result.parsed ? getYamlStats(result.parsed as never, result.output) : null), [result]);

  useEffect(() => {
    const timer = window.setTimeout(() => runAction("format", false), 250);
    return () => window.clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function runAction(action: "format" | "compact" | "to-json" | "from-json", writeBack = true) {
    const raw = input.trim();
    if (!raw) {
      setResult({ output: "请粘贴 YAML 或 JSON 内容并点击操作按钮。", jsonOutput: "JSON 预览会显示在这里。", parsed: null, error: "" });
      return;
    }

    const next =
      action === "compact" ? compactYaml(raw) : action === "to-json" ? yamlToJson(raw) : action === "from-json" ? jsonToYaml(raw) : formatYaml(raw);

    if (next.error) {
      setResult({ output: "", jsonOutput: "", parsed: null, error: next.error });
      return;
    }

    if (writeBack) setInput(next.output);
    setResult(buildResult(next, action === "to-json"));
  }

  async function copyOutput() {
    if (!result.output || result.error || !result.parsed) return;
    const copyResult = await copyText(result.output);
    setToast(copyResult.ok ? "已复制结果" : copyResult.message);
  }

  function clearAll() {
    setInput("");
    setResult({ output: "请粘贴 YAML 或 JSON 内容并点击操作按钮。", jsonOutput: "JSON 预览会显示在这里。", parsed: null, error: "" });
  }

  return (
    <ToolLayout title="YAML 格式化器" description="格式化、压缩和校验 YAML，支持 YAML 与 JSON 基础互转。">
      <section className="panel tool-panel tool-stack">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={10} spellCheck={false} />
        <div className="tool-button-row">
          <button type="button" onClick={() => runAction("format")}>
            格式化
          </button>
          <button type="button" onClick={() => runAction("compact")}>
            压缩
          </button>
          <button type="button" onClick={() => runAction("to-json")}>
            转 JSON
          </button>
          <button type="button" onClick={() => runAction("from-json")}>
            JSON 转 YAML
          </button>
          <button type="button" disabled={!result.parsed} onClick={copyOutput}>
            复制
          </button>
          <button className="ghost-btn" type="button" onClick={clearAll}>
            清空
          </button>
        </div>

        {result.error ? <div className="regex-error">{result.error}</div> : null}

        {stats ? (
          <div className="devtool-stats-grid">
            <div className="devtool-stat">
              <strong>{stats.type}</strong>
              <span>根类型</span>
            </div>
            <div className="devtool-stat">
              <strong>{stats.keys}</strong>
              <span>键数</span>
            </div>
            <div className="devtool-stat">
              <strong>{stats.lines}</strong>
              <span>行数</span>
            </div>
            <div className="devtool-stat">
              <strong>{stats.chars}</strong>
              <span>字符</span>
            </div>
          </div>
        ) : null}

        <div className="two-column">
          <section>
            <h3>YAML 输出</h3>
            <pre className="tool-output yaml-output">{result.output}</pre>
          </section>
          <section>
            <h3>JSON 预览</h3>
            <pre className="tool-output yaml-json-output">{result.jsonOutput}</pre>
          </section>
        </div>
      </section>
      <div className={`toast yaml-toast${toast ? " toast-visible" : " hidden"}`}>{toast}</div>
    </ToolLayout>
  );
}

function buildResult(result: { output: string; parsed?: unknown; error?: string | null }, outputIsJson: boolean): ResultState {
  const parsed = "parsed" in result ? result.parsed ?? null : null;
  return {
    output: result.output,
    jsonOutput: outputIsJson ? result.output : parsed ? JSON.stringify(parsed, null, 2) : "JSON 预览会显示在这里。",
    parsed,
    error: "",
  };
}
