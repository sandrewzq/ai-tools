import { useEffect, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { base64Decode, base64Encode, htmlDecode, htmlEncode, unicodeEscape, unicodeUnescape, urlDecode, urlEncode } from "./logic";

const actions = [
  { id: "enc-base64-encode", label: "Base64 编码", run: base64Encode },
  { id: "enc-base64-decode", label: "Base64 解码", run: base64Decode },
  { id: "enc-url-encode", label: "URL 编码", run: urlEncode },
  { id: "enc-url-decode", label: "URL 解码", run: urlDecode },
  { id: "enc-html-encode", label: "HTML 编码", run: htmlEncode },
  { id: "enc-html-decode", label: "HTML 解码", run: htmlDecode },
  { id: "enc-unicode-escape", label: "Unicode Escape", run: unicodeEscape },
  { id: "enc-unicode-unescape", label: "Unicode Unescape", run: unicodeUnescape },
];

export default function Tool() {
  const [input, setInput] = useState("你好 AI Tools");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function runAction(fn: (value: string) => string) {
    try {
      setOutput(fn(input));
      setError("");
    } catch (caught) {
      setOutput("");
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  async function copyOutput() {
    if (!output) return;
    const result = await copyText(output);
    setToast(result.ok ? "已复制" : result.message);
  }

  function clearAll() {
    setInput("");
    setOutput("");
    setError("");
  }

  function swapOutput() {
    const nextInput = output;
    setOutput(input);
    setInput(nextInput);
    setError("");
  }

  return (
    <ToolLayout title="编码转换器" description="Base64、URL 编解码、HTML 实体、Unicode 转义，一键互转。">
      <section className="panel tool-panel tool-stack">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={8} placeholder="输入需要转换的文本" />
        <div className="tool-button-row">
          {actions.map((action) => (
            <button id={action.id} type="button" key={action.id} onClick={() => runAction(action.run)}>
              {action.label}
            </button>
          ))}
        </div>
        <div className="tool-button-row">
          <button type="button" disabled={!output} onClick={copyOutput}>
            复制结果
          </button>
          <button className="ghost-btn" type="button" disabled={!output} onClick={swapOutput}>
            交换输入输出
          </button>
          <button className="ghost-btn" type="button" onClick={clearAll}>
            清空
          </button>
        </div>
        {error ? <div className="regex-error">{error}</div> : null}
        <textarea className="tool-output encoding-output" value={output} onChange={(event) => setOutput(event.target.value)} rows={8} placeholder="输出结果会显示在这里" />
      </section>
      <div className={`toast encoding-toast${toast ? " toast-visible" : " hidden"}`}>{toast}</div>
    </ToolLayout>
  );
}
