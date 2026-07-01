import { useEffect, useRef, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { drawQR, generateQR } from "./logic";

export default function Tool() {
  const [text, setText] = useState("https://example.com");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const result = generateQR(text);

  useEffect(() => {
    if (!result.error && result.matrix && canvasRef.current) drawQR(canvasRef.current, result.matrix, result.size, 8);
  }, [text]);

  function download() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  return (
    <ToolLayout title="二维码生成" description="生成文本或链接二维码并下载图片。">
      <div className="tool-panel tool-stack">
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} />
        {result.error ? <p className="tool-status">{result.error}</p> : <div className="stat-grid"><span>版本: {result.version}</span><span>尺寸: {result.size} x {result.size}</span></div>}
        <canvas className="qr-canvas" ref={canvasRef} />
        <button type="button" onClick={download}>下载 PNG</button>
      </div>
    </ToolLayout>
  );
}
