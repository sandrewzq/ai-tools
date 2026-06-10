import { getTimezoneOptions } from "./data.js";

export function renderCurrentTimestamp(container) {
  const now = Date.now();
  const s = Math.floor(now / 1000);

  container.innerHTML = `
    <div class="ts-current">
      <div class="ts-current-item">
        <span class="ts-label">Unix 秒</span>
        <code class="ts-value">${s}</code>
        <button class="ts-copy" data-val="${s}">复制</button>
      </div>
      <div class="ts-current-item">
        <span class="ts-label">Unix 毫秒</span>
        <code class="ts-value">${now}</code>
        <button class="ts-copy" data-val="${now}">复制</button>
      </div>
      <div class="ts-current-item">
        <span class="ts-label">当前时间</span>
        <code class="ts-value">${new Date().toLocaleString("zh-CN")}</code>
      </div>
    </div>
  `;
}

export function renderTsToDate(result, container) {
  if (!result) {
    container.innerHTML = "";
    return;
  }
  if (result.error) {
    container.innerHTML = `<div class="regex-error">${result.error}</div>`;
    return;
  }

  let tzInfo = "";
  if (result.tzLocal) {
    tzInfo = `<div class="ts-field">
      <span class="ts-label">指定时区</span>
      <code class="ts-value">${result.tzLocal}</code>
    </div>`;
  }

  container.innerHTML = `
    <div class="ts-grid">
      <div class="ts-field">
        <span class="ts-label">UTC 时间</span>
        <code class="ts-value">${result.utc}</code>
      </div>
      <div class="ts-field">
        <span class="ts-label">北京时间</span>
        <code class="ts-value">${result.iso}</code>
      </div>
      <div class="ts-field">
        <span class="ts-label">本地时间</span>
        <code class="ts-value">${result.human}</code>
      </div>
      <div class="ts-field">
        <span class="ts-label">星期</span>
        <code class="ts-value">${result.weekDay}</code>
      </div>
      <div class="ts-field">
        <span class="ts-label">相对时间</span>
        <code class="ts-value">${result.relative}</code>
      </div>
      <div class="ts-field">
        <span class="ts-label">Unix 秒</span>
        <code class="ts-value">${result.unixSeconds}</code>
      </div>
      ${tzInfo}
    </div>
  `;
}

export function renderDateToTs(result, container) {
  if (!result) {
    container.innerHTML = "";
    return;
  }
  if (result.error) {
    container.innerHTML = `<div class="regex-error">${result.error}</div>`;
    return;
  }

  container.innerHTML = `
    <div class="ts-grid">
      <div class="ts-field">
        <span class="ts-label">Unix 秒</span>
        <code class="ts-value">${result.unixSeconds}</code>
      </div>
      <div class="ts-field">
        <span class="ts-label">Unix 毫秒</span>
        <code class="ts-value">${result.unixMs}</code>
      </div>
      <div class="ts-field">
        <span class="ts-label">本地时间</span>
        <code class="ts-value">${result.readable}</code>
      </div>
    </div>
  `;
}

export function renderTimezoneOptions(selectEl, selectedTz) {
  const options = getTimezoneOptions();
  selectEl.innerHTML = options
    .map(
      (o) =>
        `<option value="${o.id}" ${o.id === selectedTz ? "selected" : ""}>${o.label}</option>`,
    )
    .join("");
}
