import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { analyzeJson, compressJson, formatJson, validateJson } from "./logic";

const SAMPLE = '{"name":"demo","items":["api","web"],"active":true}';

export default function Tool() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState("");
  const [message, setMessage] = useState("");
  const validation = useMemo(() => validateJson(input), [input]);
  const stats = validation.valid ? analyzeJson(validation.parsed) : null;

  function run(action: "format" | "compress" | "validate") {
    try {
      if (action === "format") setOutput(formatJson(input));
      if (action === "compress") setOutput(compressJson(input));
      setMessage(action === "validate" ? "JSON 有效" : "处理完成");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <ToolLayout title="JSON 格式化" description="格式化、压缩、校验并分析 JSON。">
      <div className="tool-panel tool-stack">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={10} />
        <div className="tool-button-row">
          <button type="button" onClick={() => run("format")}>格式化</button>
          <button type="button" onClick={() => run("compress")}>压缩</button>
          <button type="button" onClick={() => run("validate")}>校验</button>
          <button type="button" disabled={!output} onClick={() => copyText(output)}>复制结果</button>
        </div>
        <Status message={validation.valid ? message : validation.error || ""} />
        {stats ? <div className="stat-grid">{Object.entries(stats).map(([key, value]) => <span key={key}>{key}: {value}</span>)}</div> : null}
        <pre className="tool-output">{output || "输出结果会显示在这里"}</pre>
      </div>
    </ToolLayout>
  );
}

function Status({ message }: { message: string }) {
  return message ? <p className="tool-status">{message}</p> : null;
}
