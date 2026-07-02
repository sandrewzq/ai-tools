import { useEffect, useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { csvToJson, getCsvExample, getCsvStats } from "./logic";

type CsvResult = ReturnType<typeof csvToJson>;

export default function Tool() {
  const [input, setInput] = useState(getCsvExample());
  const [delimiter, setDelimiter] = useState("auto");
  const [hasHeader, setHasHeader] = useState(true);
  const [result, setResult] = useState<CsvResult>(() => csvToJson(getCsvExample(), { delimiter: "auto", hasHeader: true }));
  const [toast, setToast] = useState("");
  const stats = useMemo(() => (!result.error && "headers" in result ? getCsvStats(result) : null), [result]);

  useEffect(() => {
    const timer = window.setTimeout(runConvert, 250);
    return () => window.clearTimeout(timer);
  }, [input, delimiter, hasHeader]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function runConvert() {
    setResult(csvToJson(input, { delimiter, hasHeader }));
  }

  function fillExample() {
    setInput(getCsvExample());
  }

  function clearAll() {
    setInput("");
    setResult({ error: null, output: "[]" } as CsvResult);
  }

  async function copyJson() {
    if (result.error || !("output" in result) || !result.output) return;
    const copyResult = await copyText(result.output);
    setToast(copyResult.ok ? "已复制 JSON" : copyResult.message);
  }

  return (
    <ToolLayout title="CSV 转 JSON / 表格" description="解析 CSV 为 JSON，并提供表格预览、分隔符识别和表头选项。">
      <section className="panel tool-panel tool-stack">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={10} spellCheck={false} />
        <div className="tool-inline-controls">
          <label>
            分隔符
            <select value={delimiter} onChange={(event) => setDelimiter(event.target.value)}>
              <option value="auto">自动</option>
              <option value="comma">逗号</option>
              <option value="semicolon">分号</option>
              <option value="tab">Tab</option>
              <option value="pipe">竖线</option>
            </select>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={hasHeader} onChange={(event) => setHasHeader(event.target.checked)} /> 首行为表头
          </label>
        </div>
        <div className="tool-button-row">
          <button type="button" onClick={runConvert}>
            转换
          </button>
          <button className="ghost-btn" type="button" onClick={fillExample}>
            示例
          </button>
          <button type="button" disabled={Boolean(result.error) || !("output" in result)} onClick={copyJson}>
            复制 JSON
          </button>
          <button className="ghost-btn" type="button" onClick={clearAll}>
            清空
          </button>
        </div>

        {result.error ? <div className="regex-error">{result.error}</div> : null}

        {stats ? (
          <div className="devtool-stats-grid">
            <div className="devtool-stat">
              <strong>{stats.rows}</strong>
              <span>行数</span>
            </div>
            <div className="devtool-stat">
              <strong>{stats.columns}</strong>
              <span>列数</span>
            </div>
            <div className="devtool-stat">
              <strong>{stats.delimiter}</strong>
              <span>分隔符</span>
            </div>
          </div>
        ) : null}

        <div className="two-column">
          <section>
            <h3>JSON 输出</h3>
            <pre className="tool-output csv-json-output">{!result.error && "output" in result ? result.output : ""}</pre>
          </section>
          <section>
            <h3>表格预览</h3>
            <div className="tool-output csv-table-output">
              {!result.error && "rows" in result ? <CsvPreview headers={result.headers} rows={result.rows} /> : <div className="empty-state">CSV 表格预览会显示在这里。</div>}
            </div>
          </section>
        </div>
      </section>
      <div className={`toast csv-toast${toast ? " toast-visible" : " hidden"}`}>{toast}</div>
    </ToolLayout>
  );
}

function CsvPreview({ headers, rows }: { headers: string[]; rows: Record<string, string>[] }) {
  if (!rows.length) return <div className="empty-state">没有数据行。</div>;
  return (
    <table className="result-table result-table-small devtool-table">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, 50).map((row, index) => (
          <tr key={`${index}-${headers.join("|")}`}>
            {headers.map((header) => (
              <td key={header}>{row[header] ?? ""}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
