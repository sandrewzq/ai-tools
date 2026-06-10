import * as dom from "../../shared/dom-cache.js";
import { nowTimestamp, timestampToDate, dateToTimestamp } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "timestamp-converter",
  route: "#timestamp-converter",
  title: "时间戳转换器",
  kicker: "Timestamp Converter",
  description: "Unix 时间戳与可读时间互转，支持多时区换算和实时时钟。",
};

let clockTimer = null;

export function init() {
  bindEvents();
  render.renderCurrentTimestamp(dom.timestampConverter.currentContainer);
  render.renderTimezoneOptions(
    dom.timestampConverter.tzSelectTs,
    dom.timestampConverter.tzSelectTs.dataset.val || "local",
  );
  render.renderTimezoneOptions(
    dom.timestampConverter.tzSelectDate,
    dom.timestampConverter.tzSelectDate.dataset.val || "local",
  );
  startClock();
}

export function destroy() {
  stopClock();
}

function startClock() {
  stopClock();
  clockTimer = setInterval(() => {
    render.renderCurrentTimestamp(dom.timestampConverter.currentContainer);
  }, 1000);
}

function stopClock() {
  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
  }
}

function bindEvents() {
  // 时间戳 → 日期
  dom.timestampConverter.convertTsBtn.addEventListener("click", () => {
    const ts = dom.timestampConverter.tsInput.value.trim();
    const tz = dom.timestampConverter.tzSelectTs.value;
    const result = timestampToDate(ts, tz);
    render.renderTsToDate(result, dom.timestampConverter.tsResultContainer);
  });

  dom.timestampConverter.tsInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      dom.timestampConverter.convertTsBtn.click();
    }
  });

  // 快速填入当前时间戳
  dom.timestampConverter.nowSecBtn.addEventListener("click", () => {
    dom.timestampConverter.tsInput.value = nowTimestamp("s");
    dom.timestampConverter.convertTsBtn.click();
  });
  dom.timestampConverter.nowMsBtn.addEventListener("click", () => {
    dom.timestampConverter.tsInput.value = nowTimestamp("ms");
    dom.timestampConverter.convertTsBtn.click();
  });

  // 日期 → 时间戳
  dom.timestampConverter.convertDateBtn.addEventListener("click", () => {
    const dateStr = dom.timestampConverter.dateInput.value;
    const tz = dom.timestampConverter.tzSelectDate.value;
    const result = dateToTimestamp(dateStr, tz);
    render.renderDateToTs(result, dom.timestampConverter.dateResultContainer);
  });

  dom.timestampConverter.dateInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      dom.timestampConverter.convertDateBtn.click();
    }
  });

  // 现在按钮 → 填入当前日期时间
  dom.timestampConverter.nowDateBtn.addEventListener("click", () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    dom.timestampConverter.dateInput.value =
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    dom.timestampConverter.convertDateBtn.click();
  });

  // 复制按钮
  dom.timestampConverter.currentContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".ts-copy");
    if (!btn) return;
    navigator.clipboard.writeText(btn.dataset.val).catch(() => {});
    showToast("已复制");
  });

  // 时区变化自动重算
  dom.timestampConverter.tzSelectTs.addEventListener("change", () => {
    dom.timestampConverter.convertTsBtn.click();
  });
  dom.timestampConverter.tzSelectDate.addEventListener("change", () => {
    dom.timestampConverter.convertDateBtn.click();
  });
}

function showToast(msg) {
  dom.timestampConverter.toast.textContent = msg;
  dom.timestampConverter.toast.classList.remove("hidden");
  dom.timestampConverter.toast.classList.add("toast-visible");
  clearTimeout(dom.timestampConverter.toast._timeout);
  dom.timestampConverter.toast._timeout = setTimeout(() => {
    dom.timestampConverter.toast.classList.remove("toast-visible");
    dom.timestampConverter.toast.classList.add("hidden");
  }, 2000);
}
