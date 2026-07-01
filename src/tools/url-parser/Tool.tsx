import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { buildUrl, getUrlExamples, parseUrl } from "./logic";

export default function Tool() {
  const [input, setInput] = useState(getUrlExamples()[0]);
  const [result, setResult] = useState<ReturnType<typeof parseUrl> | null>(null);

  function parse() {
    setResult(parseUrl(input));
  }

  const hasParsed = Boolean(result && !result.error && "query" in result && result.query && "parts" in result && result.parts);
  const rebuilt = hasParsed && result && "query" in result && result.query ? buildUrl(result.query) : "";

  return (
    <ToolLayout title="URL 解析" description="拆解 URL 组成部分、查询参数和重建参数。">
      <div className="tool-panel tool-stack">
        <input value={input} onChange={(event) => setInput(event.target.value)} />
        <div className="tool-button-row">
          <button type="button" onClick={parse}>解析</button>
          <button type="button" onClick={() => setInput(getUrlExamples()[1])}>示例</button>
          <button type="button" disabled={!rebuilt} onClick={() => copyText(rebuilt)}>复制查询串</button>
        </div>
        {result?.error ? <p className="tool-status">{result.error}</p> : null}
        {hasParsed && result && "parts" in result && result.parts ? (
          <>
            <div className="key-value-grid">{Object.entries(result.parts).map(([key, value]) => <span key={key}><b>{key}</b>{value}</span>)}</div>
            <pre className="tool-output">{JSON.stringify(result.queryJson, null, 2)}</pre>
          </>
        ) : null}
      </div>
    </ToolLayout>
  );
}
