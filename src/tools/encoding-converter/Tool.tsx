import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { base64Decode, base64Encode, htmlDecode, htmlEncode, unicodeEscape, unicodeUnescape, urlDecode, urlEncode } from "./logic";

const actions = {
  "Base64 编码": base64Encode,
  "Base64 解码": base64Decode,
  "URL 编码": urlEncode,
  "URL 解码": urlDecode,
  "HTML 编码": htmlEncode,
  "HTML 解码": htmlDecode,
  "Unicode Escape": unicodeEscape,
  "Unicode Unescape": unicodeUnescape,
};

export default function Tool() {
  const [input, setInput] = useState("你好 AI Tools");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");

  function run(fn: (value: string) => string) {
    try {
      setOutput(fn(input));
      setStatus("转换完成");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <ToolLayout title="编码转换" description="进行 Base64、URL、HTML 和 Unicode 编码转换。">
      <div className="tool-panel tool-stack">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={8} />
        <div className="tool-button-row">{Object.entries(actions).map(([label, fn]) => <button type="button" key={label} onClick={() => run(fn)}>{label}</button>)}</div>
        <p className="tool-status">{status}</p>
        <pre className="tool-output">{output || "输出结果会显示在这里"}</pre>
        <button type="button" disabled={!output} onClick={() => copyText(output)}>复制结果</button>
      </div>
    </ToolLayout>
  );
}
