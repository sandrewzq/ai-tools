import { formatJson } from "../json-formatter/data.js";

export function renderResult(parsed, headerEl, payloadEl, sigEl, verifyEl) {
  if (parsed.error) {
    headerEl.textContent = parsed.error;
    payloadEl.innerHTML = "";
    sigEl.innerHTML = "";
    verifyEl.innerHTML = "";
    return;
  }

  const headerFormatted = formatJson(JSON.stringify(parsed.header));
  const payloadFormatted = formatJson(JSON.stringify(parsed.payload));

  headerEl.className = "jwt-code-panel";
  headerEl.innerHTML = headerFormatted;
  payloadEl.className = "jwt-code-panel";
  payloadEl.innerHTML = payloadFormatted;
  sigEl.innerHTML = `<code class="jwt-sig">${parsed.signature}</code>`;
  verifyEl.innerHTML = `<span class="jwt-verify-hint">输入密钥后可验证签名</span>`;
}

export function renderVerifyResult(result, container) {
  if (result.verified) {
    container.innerHTML = `<span class="jwt-verify-ok">签名验证通过</span>`;
  } else {
    container.innerHTML = `<span class="jwt-verify-fail">${result.reason}</span>`;
  }
}

export function renderEmpty(headerEl, payloadEl, sigEl, verifyEl) {
  headerEl.className = "";
  headerEl.textContent = "等待解析";
  payloadEl.innerHTML = "";
  sigEl.innerHTML = "";
  verifyEl.innerHTML = "";
}
