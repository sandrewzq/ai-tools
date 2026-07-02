import { useEffect, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { hashAsync } from "./logic";

const ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-512"];

export default function Tool() {
  const [input, setInput] = useState("hello");
  const [algo, setAlgo] = useState("SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void calculate();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [input, algo]);

  async function calculate() {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      setOutput(await hashAsync(input, algo));
      setError("");
    } catch (caught) {
      setOutput("");
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  return (
    <ToolLayout title="哈希生成器" description="在线生成 MD5、SHA-1、SHA-256、SHA-512 哈希值，纯浏览器端计算。">
      <section className="panel tool-panel tool-stack">
        <select value={algo} onChange={(event) => setAlgo(event.target.value)}>
          {ALGOS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={8} placeholder="输入文本后自动计算哈希值" />
        <div className="hash-result tool-output">
          {error ? (
            <p className="hash-placeholder" style={{ color: "#f85149" }}>
              {error}
            </p>
          ) : output ? (
            <div className="hash-result-row">
              <span className="hash-algo-tag">{algo}</span>
              <code className="hash-value">{output}</code>
              <button className="ghost-btn hash-copy-btn" type="button" data-hash={output} title="复制" onClick={() => copyText(output)}>
                复制
              </button>
            </div>
          ) : (
            <p className="hash-placeholder">输入文本后自动计算哈希值</p>
          )}
        </div>
      </section>
    </ToolLayout>
  );
}
