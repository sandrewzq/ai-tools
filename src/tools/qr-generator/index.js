import * as dom from "../../shared/dom-cache.js";
import { generateQR } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "qr-generator",
  route: "#qr-generator",
  title: "二维码生成器",
  kicker: "QR Generator",
  description: "输入文本或 URL 即时生成二维码，支持下载 PNG 图片。",
};

export function init() {
  bindEvents();
  render.renderEmpty(
    dom.qrGenerator.canvas,
    dom.qrGenerator.versionInfo,
    dom.qrGenerator.sizeInfo,
    dom.qrGenerator.error,
    dom.qrGenerator.placeholder,
  );
}

export function destroy() {}

let lastResult = null;

function bindEvents() {
  dom.qrGenerator.qrInput.addEventListener("input", () => {
    const text = dom.qrGenerator.qrInput.value;
    lastResult = generateQR(text);
    render.renderQR(
      lastResult,
      dom.qrGenerator.canvas,
      dom.qrGenerator.versionInfo,
      dom.qrGenerator.sizeInfo,
      dom.qrGenerator.error,
      dom.qrGenerator.placeholder,
    );
  });

  dom.qrGenerator.downloadBtn.addEventListener("click", () => {
    const canvas = dom.qrGenerator.canvas;
    if (!canvas.width) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}
