import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { csvToJson, getCsvExample, getCsvStats } from "./logic";

export default function Tool() {
  const [input, setInput] = useState(getCsvExample());
  const [delimiter, setDelimiter] = useState("auto");
  const [hasHeader, setHasHeader] = useState(true);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  function convert() {
    const result = csvToJson(input, { delimiter, hasHeader });
    if (result.error || !("rows" in result)) {
      setStatus(result.error || "转换失败");
      setOutput("");
      setStats(null);
      return;
    }
    setOutput(result.output);
    setStats(getCsvStats(result));
    setStatus("转换完成");
  }

  return (
    <ToolLayout title="CSV 转换" description="解析 CSV，预览表格并转换为 JSON。">
      <div className="tool-panel tool-stack">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={10} />
        <div className="tool-inline-controls">
          <label>分隔符<select value={delimiter} onChange={(event) => setDelimiter(event.target.value)}><option value="auto">自动</option><option value="comma">逗号</option><option value="semicolon">分号</option><option value="tab">Tab</option><option value="pipe">竖线</option></select></label>
          <label className="checkbox-label"><input type="checkbox" checked={hasHeader} onChange={(event) => setHasHeader(event.target.checked)} /> 首行为表头</label>
        </div>
        <div className="tool-button-row">
          <button type="button" onClick={convert}>转换</button>
          <button type="button" onClick={() => setInput(getCsvExample())}>示例</button>
          <button type="button" disabled={!output} onClick={() => copyText(output)}>复制 JSON</button>
        </div>
        <p className="tool-status">{status}</p>
        {stats ? <div className="stat-grid">{Object.entries(stats).map(([key, value]) => <span key={key}>{key}: {String(value)}</span>)}</div> : null}
        <pre className="tool-output">{output || "JSON 输出会显示在这里"}</pre>
      </div>
    </ToolLayout>
  );
}
