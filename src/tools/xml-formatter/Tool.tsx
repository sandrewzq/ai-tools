import { useEffect, useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { compactXml, formatXml, getXmlStats, xmlToJson, type XmlNode } from "./logic";

const SAMPLE = '<root><item id="1">A</item><item id="2">B</item></root>';

type ResultState = {
  output: string;
  treeOutput: string;
  tree: XmlNode | null;
  error: string;
};

export default function Tool() {
  const [input, setInput] = useState(SAMPLE);
  const [result, setResult] = useState<ResultState>(() => buildResult(formatXml(SAMPLE)));
  const [toast, setToast] = useState("");
  const stats = useMemo(() => (result.tree ? getXmlStats(result.tree, result.output) : null), [result]);

  useEffect(() => {
    const timer = window.setTimeout(() => runAction("format", false), 250);
    return () => window.clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function runAction(action: "format" | "compact" | "to-json", writeBack = true) {
    const raw = input.trim();
    if (!raw) {
      setResult({ output: "请粘贴 XML 内容并点击操作按钮。", treeOutput: "XML 树结构 JSON 会显示在这里。", tree: null, error: "" });
      return;
    }

    const next = action === "compact" ? compactXml(raw) : action === "to-json" ? xmlToJson(raw) : formatXml(raw);
    if (next.error || !("tree" in next) || !next.tree) {
      setResult({ output: "", treeOutput: "", tree: null, error: next.error || "处理失败" });
      return;
    }

    if (writeBack) setInput(next.output);
    setResult(buildResult(next));
  }

  async function copyOutput() {
    if (!result.output || result.error || !result.tree) return;
    const copyResult = await copyText(result.output);
    setToast(copyResult.ok ? "已复制结果" : copyResult.message);
  }

  function clearAll() {
    setInput("");
    setResult({ output: "请粘贴 XML 内容并点击操作按钮。", treeOutput: "XML 树结构 JSON 会显示在这里。", tree: null, error: "" });
  }

  return (
    <ToolLayout title="XML 格式化器" description="格式化、压缩和校验 XML，支持 XML 树结构 JSON 预览。">
      <section className="panel tool-panel tool-stack">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={10} spellCheck={false} />
        <div className="tool-button-row">
          <button type="button" onClick={() => runAction("format")}>
            格式化
          </button>
          <button type="button" onClick={() => runAction("compact")}>
            压缩
          </button>
          <button type="button" onClick={() => runAction("to-json", false)}>
            转 JSON
          </button>
          <button type="button" disabled={!result.tree} onClick={copyOutput}>
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
              <strong>{stats.root}</strong>
              <span>根节点</span>
            </div>
            <div className="devtool-stat">
              <strong>{stats.nodes}</strong>
              <span>节点</span>
            </div>
            <div className="devtool-stat">
              <strong>{stats.attrs}</strong>
              <span>属性</span>
            </div>
            <div className="devtool-stat">
              <strong>{stats.lines}</strong>
              <span>行数</span>
            </div>
          </div>
        ) : null}

        <div className="two-column">
          <section>
            <h3>XML 输出</h3>
            <pre className="tool-output xml-output">{result.output}</pre>
          </section>
          <section>
            <h3>树结构 JSON</h3>
            <pre className="tool-output xml-tree-output">{result.treeOutput}</pre>
          </section>
        </div>
      </section>
      <div className={`toast xml-toast${toast ? " toast-visible" : " hidden"}`}>{toast}</div>
    </ToolLayout>
  );
}

function buildResult(result: { output: string; tree?: XmlNode; error?: string | null }): ResultState {
  const tree = "tree" in result ? result.tree ?? null : null;
  return {
    output: result.output,
    treeOutput: tree ? JSON.stringify(tree, null, 2) : "XML 树结构 JSON 会显示在这里。",
    tree,
    error: "",
  };
}
