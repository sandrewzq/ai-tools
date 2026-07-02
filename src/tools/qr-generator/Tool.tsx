import { useEffect, useRef, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { drawQR, generateQR } from "./logic";

export default function Tool() {
  const [text, setText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const result = generateQR(text);
  const hasQr = !result.error && result.matrix && typeof result.size === "number";

  useEffect(() => {
    if (!result.error && result.matrix && canvasRef.current) {
      drawQR(canvasRef.current, result.matrix, result.size);
    }
  }, [result]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas?.width) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <ToolLayout title="二维码生成器" description="输入文本或 URL 即时生成二维码，支持下载 PNG 图片。">
      <section className="panel tool-panel">
        <div className="qr-body">
          <div className="qr-left">
            <textarea className="qr-input" value={text} onChange={(event) => setText(event.target.value)} rows={8} placeholder="输入文本或 URL" />
            <div className="tool-button-row">
              <button type="button" disabled={Boolean(result.error)} onClick={download}>
                下载 PNG
              </button>
            </div>
            {result.error ? <div className="regex-error">{result.error}</div> : null}
          </div>
          <div className="qr-right">
            <div className="qr-canvas-wrap">
              <canvas className="qr-canvas" ref={canvasRef} style={{ display: hasQr ? "block" : "none" }} />
              <div className="qr-placeholder" style={{ display: hasQr ? "none" : "block" }}>
                输入内容后生成二维码
              </div>
            </div>
            <div className="qr-info">
              <span>{hasQr ? `版本 ${result.version}` : ""}</span>
              <span>{hasQr ? `${result.size}×${result.size} (${result.size * 8}px)` : ""}</span>
            </div>
          </div>
        </div>
      </section>
    </ToolLayout>
  );
}
