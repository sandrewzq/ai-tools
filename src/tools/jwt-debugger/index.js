import * as dom from "../../shared/dom-cache.js";
import * as data from "./data.js";
import * as render from "./render.js";
import { debounce } from "../../shared/format.js";

export const meta = {
  id: "jwt-debugger",
  route: "#jwt-debugger",
  title: "JWT 调试器",
  kicker: "JWT Debugger",
  description: "在线解码 JWT Token，查看 Header 和 Payload，支持 HMAC 签名验证。",
};

let debouncedParse;

export function init() {
  debouncedParse = debounce(parse, 200);
  bindEvents();
  render.renderEmpty(
    dom.jwtDebugger.headerOutput,
    dom.jwtDebugger.payloadOutput,
    dom.jwtDebugger.sigOutput,
    dom.jwtDebugger.verifyOutput,
  );
}

export function destroy() {}

function bindEvents() {
  dom.jwtDebugger.tokenInput.addEventListener("input", () => debouncedParse());
  dom.jwtDebugger.verifyBtn.addEventListener("click", verify);
  dom.jwtDebugger.copyHeaderBtn.addEventListener("click", () =>
    copyText(dom.jwtDebugger.headerOutput.textContent));
  dom.jwtDebugger.copyPayloadBtn.addEventListener("click", () =>
    copyText(dom.jwtDebugger.payloadOutput.textContent));
}

function parse() {
  const token = dom.jwtDebugger.tokenInput.value;
  const parsed = data.parseJwt(token);
  render.renderResult(
    parsed,
    dom.jwtDebugger.headerOutput,
    dom.jwtDebugger.payloadOutput,
    dom.jwtDebugger.sigOutput,
    dom.jwtDebugger.verifyOutput,
  );
}

async function verify() {
  const token = dom.jwtDebugger.tokenInput.value.trim();
  if (!token) return;

  const parts = token.split(".");
  if (parts.length !== 3) return;

  const [headerB64, payloadB64, signature] = parts;
  const { alg } = data.parseJwt(token);
  const secret = dom.jwtDebugger.secretInput.value;

  const result = await data.verifySignature(headerB64, payloadB64, signature, secret, alg);
  render.renderVerifyResult(result, dom.jwtDebugger.verifyOutput);
}

async function copyText(text) {
  if (!text || text === "等待解析") return;
  try { await navigator.clipboard.writeText(text); } catch {}
}
