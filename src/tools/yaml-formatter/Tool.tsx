import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { compactYaml, formatYaml, getYamlStats, jsonToYaml, yamlToJson } from "./logic";

const SAMPLE = "name: demo\nactive: true\nitems:\n  - api\n  - web";

export default function Tool() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  function apply(action: "format" | "compact" | "toJson" | "fromJson") {
    const result = action === "format" ? formatYaml(input) : action === "compact" ? compactYaml(input) : action === "toJson" ? yamlToJson(input) : jsonToYaml(input);
    if (result.error) {
      setStatus(result.error);
      setOutput("");
      setStats(null);
      return;
    }
    setOutput(result.output);
    setStatus("处理完成");
    if ("parsed" in result && result.parsed) setStats(getYamlStats(result.parsed, result.output));
  }

  return (
    <ToolLayout title="YAML 格式化" description="格式化 YAML，并在 YAML 和 JSON 间转换。">
      <div className="tool-panel tool-stack">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={10} />
        <div className="tool-button-row">
          <button type="button" onClick={() => apply("format")}>格式化</button>
          <button type="button" onClick={() => apply("compact")}>压缩</button>
          <button type="button" onClick={() => apply("toJson")}>转 JSON</button>
          <button type="button" onClick={() => apply("fromJson")}>JSON 转 YAML</button>
          <button type="button" disabled={!output} onClick={() => copyText(output)}>复制</button>
        </div>
        <p className="tool-status">{status}</p>
        {stats ? <div className="stat-grid">{Object.entries(stats).map(([key, value]) => <span key={key}>{key}: {String(value)}</span>)}</div> : null}
        <pre className="tool-output">{output || "输出结果会显示在这里"}</pre>
      </div>
    </ToolLayout>
  );
}
