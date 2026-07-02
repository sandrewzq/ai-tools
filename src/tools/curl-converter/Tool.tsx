import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { generateFetch, generateGo, generatePython, parseCurl, type ParsedCurl } from "./logic";

const SAMPLE = `curl -X POST "https://api.example.com/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -d '{"name":"Alice","email":"alice@example.com"}'`;

function isParsedCurl(value: ParsedCurl | { error: string }): value is ParsedCurl {
  return value.error === null;
}

export default function Tool() {
  const [input, setInput] = useState("");
  const [convertedInput, setConvertedInput] = useState("");
  const [toast, setToast] = useState("");
  const parsed = useMemo(() => (convertedInput ? parseCurl(convertedInput) : null), [convertedInput]);
  const outputs = parsed && isParsedCurl(parsed)
    ? {
        fetch: generateFetch(parsed),
        python: generatePython(parsed),
        go: generateGo(parsed),
      }
    : null;

  function convert() {
    setConvertedInput(input);
  }

  function fillExample() {
    setInput(SAMPLE);
    setConvertedInput(SAMPLE);
  }

  async function copyOutput(value: string) {
    if (!value) return;
    const result = await copyText(value);
    setToast(result.ok ? "已复制" : result.message);
    window.setTimeout(() => setToast(""), 2000);
  }

  return (
    <ToolLayout title="cURL 转代码" description="粘贴 cURL 命令，一键生成 fetch、Python requests、Go net/http 代码。">
      <section className="panel tool-panel tool-stack">
        <div className="curl-input-row">
          <textarea
            className="curl-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.ctrlKey) convert();
            }}
            placeholder="粘贴 cURL 命令，Ctrl + Enter 转换"
            rows={6}
            spellCheck={false}
          />
          <div className="curl-actions">
            <button type="button" onClick={convert}>
              转换
            </button>
            <button className="ghost-btn" type="button" onClick={fillExample}>
              示例
            </button>
          </div>
        </div>

        <div className="curl-summary-wrap">
          {parsed && isParsedCurl(parsed) ? (
            <div className="curl-summary">
              <span className="curl-method" style={methodStyle(parsed.method)}>
                {parsed.method}
              </span>
              <span className="curl-url">{parsed.url}</span>
              {Object.keys(parsed.headers).length ? <span className="curl-stat">{Object.keys(parsed.headers).length} headers</span> : null}
              {parsed.body ? <span className="curl-stat">有请求体</span> : null}
            </div>
          ) : parsed && !isParsedCurl(parsed) ? (
            <div className="regex-error">{parsed.error}</div>
          ) : null}
        </div>

        {outputs ? (
          <div className="form-grid">
            <section className="curl-output-panel">
              <h3>fetch</h3>
              <pre className="tool-output">{outputs.fetch}</pre>
              <button type="button" onClick={() => copyOutput(outputs.fetch)}>
                复制 fetch
              </button>
            </section>
            <section className="curl-output-panel">
              <h3>Python requests</h3>
              <pre className="tool-output">{outputs.python}</pre>
              <button type="button" onClick={() => copyOutput(outputs.python)}>
                复制 Python
              </button>
            </section>
            <section className="curl-output-panel field-span-2">
              <h3>Go net/http</h3>
              <pre className="tool-output">{outputs.go}</pre>
              <button type="button" onClick={() => copyOutput(outputs.go)}>
                复制 Go
              </button>
            </section>
          </div>
        ) : null}
      </section>
      <div className={`toast curl-toast${toast ? " toast-visible" : " hidden"}`}>{toast}</div>
    </ToolLayout>
  );
}

function methodStyle(method: string) {
  const colors: Record<string, string> = {
    GET: "#2da44e",
    POST: "#1f6feb",
    PUT: "#bf8700",
    DELETE: "#cf222e",
    PATCH: "#8250df",
  };
  const color = colors[method] || "#656d76";
  return { background: `${color}20`, color };
}
