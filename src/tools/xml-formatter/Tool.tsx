import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { compactXml, formatXml, getXmlStats, xmlToJson } from "./logic";

const SAMPLE = '<root><item id="1">A</item><item id="2">B</item></root>';

export default function Tool() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  function apply(action: "format" | "compact" | "json") {
    const result = action === "format" ? formatXml(input) : action === "compact" ? compactXml(input) : xmlToJson(input);
    if (result.error || !("tree" in result) || !result.tree) {
      setStatus(result.error || "处理失败");
      setOutput("");
      setStats(null);
      return;
    }
    setOutput(result.output);
    setStats(getXmlStats(result.tree, result.output));
    setStatus("处理完成");
  }

  return (
    <ToolLayout title="XML 格式化" description="格式化、压缩 XML，并转换为 JSON 树。">
      <div className="tool-panel tool-stack">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={10} />
        <div className="tool-button-row">
          <button type="button" onClick={() => apply("format")}>格式化</button>
          <button type="button" onClick={() => apply("compact")}>压缩</button>
          <button type="button" onClick={() => apply("json")}>转 JSON</button>
          <button type="button" disabled={!output} onClick={() => copyText(output)}>复制</button>
        </div>
        <p className="tool-status">{status}</p>
        {stats ? <div className="stat-grid">{Object.entries(stats).map(([key, value]) => <span key={key}>{key}: {String(value)}</span>)}</div> : null}
        <pre className="tool-output">{output || "输出结果会显示在这里"}</pre>
      </div>
    </ToolLayout>
  );
}
