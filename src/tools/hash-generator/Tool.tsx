import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { hashAsync } from "./logic";

const ALGOS = ["MD5", "SHA-1", "SHA-256", "SHA-512"];

export default function Tool() {
  const [input, setInput] = useState("hello");
  const [algo, setAlgo] = useState("SHA-256");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");

  async function generate() {
    try {
      setOutput(await hashAsync(input, algo));
      setStatus("生成完成");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <ToolLayout title="哈希生成" description="生成 MD5、SHA 系列哈希摘要。">
      <div className="tool-panel tool-stack">
        <select value={algo} onChange={(event) => setAlgo(event.target.value)}>{ALGOS.map((item) => <option key={item}>{item}</option>)}</select>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={8} />
        <div className="tool-button-row"><button type="button" onClick={generate}>生成</button><button type="button" disabled={!output} onClick={() => copyText(output)}>复制</button></div>
        <p className="tool-status">{status}</p>
        <pre className="tool-output">{output || "哈希结果会显示在这里"}</pre>
      </div>
    </ToolLayout>
  );
}
