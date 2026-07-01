import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { generateFetch, generateGo, generatePython, parseCurl, type ParsedCurl } from "./logic";

const SAMPLE = 'curl -X POST "https://api.example.com/v1/demo" -H "Content-Type: application/json" -d "{\"name\":\"demo\"}"';

function isParsedCurl(value: ParsedCurl | { error: string }): value is ParsedCurl {
  return value.error === null;
}

export default function Tool() {
  const [input, setInput] = useState(SAMPLE);
  const parsed = useMemo(() => parseCurl(input), [input]);
  const outputs = isParsedCurl(parsed) ? { fetch: generateFetch(parsed), python: generatePython(parsed), go: generateGo(parsed) } : null;

  return (
    <ToolLayout title="cURL 转代码" description="把 cURL 命令转换为 fetch、Python 和 Go 示例。">
      <div className="tool-panel tool-stack">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={6} />
        {isParsedCurl(parsed) ? <div className="stat-grid"><span>方法: {parsed.method}</span><span>URL: {parsed.url}</span></div> : <p className="tool-status">{parsed.error}</p>}
        {outputs ? Object.entries(outputs).map(([key, value]) => <section className="tool-stack" key={key}><h3>{key}</h3><pre className="tool-output">{value}</pre><button type="button" onClick={() => copyText(value)}>复制 {key}</button></section>) : null}
      </div>
    </ToolLayout>
  );
}
