import { useEffect, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { getUrlExamples, parseUrl, type QueryRow } from "./logic";

type ParsedUrl = ReturnType<typeof parseUrl>;
type UrlState = ParsedUrl | { error: null; parts: null; query: QueryRow[]; queryJson: Record<string, never> };

export default function Tool() {
  const [input, setInput] = useState(getUrlExamples()[0]);
  const [result, setResult] = useState<UrlState>(() => parseUrl(getUrlExamples()[0]));
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(runParse, 200);
    return () => window.clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function runParse() {
    setResult(parseUrl(input));
  }

  function fillExample() {
    setInput(getUrlExamples()[0]);
  }

  function clearAll() {
    setInput("");
    setResult({ error: null, parts: null, query: [], queryJson: {} });
  }

  async function copyValue(value: string) {
    if (!value) return;
    const copyResult = await copyText(value);
    setToast(copyResult.ok ? "已复制" : copyResult.message);
  }

  const parsed = result && !result.error && "parts" in result && result.parts ? result : null;
  const queryJson = parsed ? JSON.stringify(parsed.queryJson, null, 2) : "{}";

  return (
    <ToolLayout title="URL 解析器" description="拆解 URL 组成部分，查看 Query 表格、Query JSON 和重建结果。">
      <section className="panel tool-panel tool-stack">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="输入 URL" />
        <div className="tool-button-row">
          <button type="button" onClick={runParse}>
            解析
          </button>
          <button className="ghost-btn" type="button" onClick={fillExample}>
            示例
          </button>
          <button type="button" disabled={!parsed} onClick={() => parsed && copyValue(parsed.parts.href)}>
            复制 URL
          </button>
          <button type="button" disabled={!parsed} onClick={() => copyValue(queryJson)}>
            复制 JSON
          </button>
          <button className="ghost-btn" type="button" onClick={clearAll}>
            清空
          </button>
        </div>

        {result?.error ? <div className="regex-error">{result.error}</div> : null}

        <div className="two-column">
          <section>
            <h3>URL 组成</h3>
            <div className="url-parts-output tool-output">
              {parsed ? (
                Object.entries(parsed.parts).map(([key, value]) => (
                  <div className="url-part-row" key={key}>
                    <span>{key}</span>
                    <code>{value || "-"}</code>
                  </div>
                ))
              ) : (
                <div className="empty-state">请输入 URL 后查看拆解结果。</div>
              )}
            </div>
          </section>
          <section>
            <h3>Query 参数</h3>
            <div className="tool-output">
              {parsed ? <QueryTable query={parsed.query} /> : <div className="empty-state">Query 参数会显示在这里。</div>}
            </div>
          </section>
        </div>

        <div className="two-column">
          <section>
            <h3>Query JSON</h3>
            <pre className="tool-output url-json-output">{queryJson}</pre>
          </section>
          <section>
            <h3>重建结果</h3>
            <pre className="tool-output url-rebuilt-output">{parsed ? parsed.parts.href : ""}</pre>
          </section>
        </div>
      </section>
      <div className={`toast url-toast${toast ? " toast-visible" : " hidden"}`}>{toast}</div>
    </ToolLayout>
  );
}

function QueryTable({ query }: { query: QueryRow[] }) {
  if (!query.length) return <div className="empty-state">当前 URL 没有 Query 参数。</div>;
  return (
    <table className="result-table result-table-small devtool-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {query.map((item) => (
          <tr key={item.index}>
            <td>{item.index}</td>
            <td>{item.key}</td>
            <td>{item.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
