import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { analyzeJson, compressJson, formatJson, renderJsonTree, validateJson } from "./logic";

const SAMPLE = '{"name":"demo","items":["api","web"],"active":true}';

type OutputState =
  | { type: "empty"; message: string }
  | { type: "error"; message: string }
  | { type: "tree"; html: string; parsed: unknown };

export default function Tool() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState<OutputState>({ type: "empty", message: "请粘贴 JSON 文本并点击操作按钮。" });
  const [lastParsed, setLastParsed] = useState<unknown>(null);
  const [toast, setToast] = useState("");

  const stats = useMemo(() => (output.type === "tree" ? buildStats(output.parsed) : null), [output]);
  const canCopy = lastParsed !== null;

  function doAction(action: "format" | "compress" | "validate") {
    const raw = input.trim();
    if (!raw) {
      clearOutput();
      return;
    }

    const result = validateJson(raw);
    if (!result.valid) {
      setOutput({ type: "error", message: result.error || "JSON 无效" });
      setLastParsed(null);
      return;
    }

    const parsed = result.parsed;
    setLastParsed(parsed);

    if (action === "format") {
      setInput(formatJson(raw));
    } else if (action === "compress") {
      setInput(compressJson(raw));
    }

    setOutput({ type: "tree", html: renderJsonTree(parsed), parsed });
  }

  function clearOutput() {
    setInput("");
    setOutput({ type: "empty", message: "请粘贴 JSON 文本并点击操作按钮。" });
    setLastParsed(null);
  }

  async function copyOutput() {
    if (lastParsed === null) return;
    const result = await copyText(JSON.stringify(lastParsed, null, 2));
    setToast(result.ok ? "已复制格式化后的 JSON" : result.message);
  }

  async function copyIndent() {
    if (lastParsed === null) return;
    const result = await copyText(JSON.stringify(lastParsed, null, 2));
    setToast(result.ok ? "已复制带缩进的 JSON" : result.message);
  }

  function toggleTree(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const toggle = target.closest<HTMLElement>(".json-toggle");
    if (!toggle) return;

    const parent = toggle.parentElement;
    if (!parent) return;

    const isCollapsed = parent.classList.toggle("collapsed");
    toggle.textContent = isCollapsed ? "▶" : "▼";
    const depth = Number(parent.dataset.depth);
    let sibling = parent.nextElementSibling as HTMLElement | null;

    while (sibling) {
      if (sibling.classList.contains("json-close") && Number(sibling.dataset.depth) === depth) break;
      sibling.classList.toggle("json-hidden", isCollapsed);
      sibling = sibling.nextElementSibling as HTMLElement | null;
    }
  }

  return (
    <ToolLayout title="JSON 格式化器" description="格式化、压缩和校验 JSON 数据，支持语法高亮、树形折叠浏览和结构分析。">
      <section className="panel tool-panel tool-stack">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={10} spellCheck={false} />
        <div className="tool-button-row">
          <button type="button" onClick={() => doAction("format")}>
            格式化
          </button>
          <button type="button" onClick={() => doAction("compress")}>
            压缩
          </button>
          <button type="button" onClick={() => doAction("validate")}>
            校验
          </button>
          <button type="button" disabled={!canCopy} onClick={copyOutput}>
            复制结果
          </button>
          <button type="button" disabled={!canCopy} onClick={copyIndent}>
            复制缩进 JSON
          </button>
          <button type="button" onClick={clearOutput}>
            清空
          </button>
        </div>

        {stats ? (
          <div className="json-stats-grid">
            <div className="json-stat">
              <strong>{stats.type}</strong>
              <span>根类型</span>
            </div>
            <div className="json-stat">
              <strong>{stats.depth}</strong>
              <span>最大深度</span>
            </div>
            <div className="json-stat">
              <strong>{stats.keys}</strong>
              <span>键数</span>
            </div>
            <div className="json-stat">
              <strong>{stats.lines}</strong>
              <span>行数</span>
            </div>
            <div className="json-stat">
              <strong>{stats.values}</strong>
              <span>值数</span>
            </div>
          </div>
        ) : null}

        <div className="json-output tool-output" onClick={toggleTree}>
          {output.type === "tree" ? (
            <div dangerouslySetInnerHTML={{ __html: output.html }} />
          ) : output.type === "error" ? (
            <div className="json-error">{output.message}</div>
          ) : (
            <div className="empty-state">{output.message}</div>
          )}
        </div>
      </section>
      <div className={`toast json-toast${toast ? " toast-visible" : " hidden"}`}>{toast}</div>
    </ToolLayout>
  );
}

function buildStats(parsed: unknown) {
  const stats = analyzeJson(parsed);
  const json = JSON.stringify(parsed, null, 2);
  return {
    ...stats,
    lines: json.split("\n").length,
    values: stats.strings + stats.numbers + stats.booleans + stats.nulls,
  };
}
