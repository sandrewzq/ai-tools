import { useEffect, useMemo, useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { copyText } from "../../shared/clipboard";
import { dateToTimestamp, getTimezoneOptions, nowTimestamp, timestampToDate } from "./logic";

function formatDateTimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}:${pad(date.getSeconds())}`;
}

export default function Tool() {
  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);
  const [currentNow, setCurrentNow] = useState(() => Date.now());
  const [timestamp, setTimestamp] = useState(String(nowTimestamp()));
  const [date, setDate] = useState(() => formatDateTimeLocal(new Date()));
  const [timestampTimezone, setTimestampTimezone] = useState("local");
  const [dateTimezone, setDateTimezone] = useState("local");
  const [toast, setToast] = useState("");

  const timestampResult = useMemo(() => timestampToDate(timestamp.trim(), timestampTimezone), [timestamp, timestampTimezone]);
  const dateResult = useMemo(() => dateToTimestamp(date, dateTimezone), [date, dateTimezone]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function copyValue(value: string | number) {
    const result = await copyText(String(value));
    setToast(result.ok ? "已复制" : result.message);
  }

  function fillCurrentTimestamp(unit: "s" | "ms") {
    setTimestamp(String(nowTimestamp(unit)));
  }

  function fillCurrentDate() {
    setDate(formatDateTimeLocal(new Date()));
  }

  const currentSeconds = Math.floor(currentNow / 1000);

  return (
    <ToolLayout title="时间戳转换器" description="Unix 时间戳与可读时间互转，支持多时区换算和实时时钟。">
      <section className="panel tool-panel tool-stack">
        <div className="ts-current">
          <div className="ts-current-item">
            <span className="ts-label">Unix 秒</span>
            <code className="ts-value">{currentSeconds}</code>
            <button className="ts-copy" type="button" onClick={() => copyValue(currentSeconds)}>
              复制
            </button>
          </div>
          <div className="ts-current-item">
            <span className="ts-label">Unix 毫秒</span>
            <code className="ts-value">{currentNow}</code>
            <button className="ts-copy" type="button" onClick={() => copyValue(currentNow)}>
              复制
            </button>
          </div>
          <div className="ts-current-item">
            <span className="ts-label">当前时间</span>
            <code className="ts-value">{new Date(currentNow).toLocaleString("zh-CN")}</code>
          </div>
        </div>

        <div className="ts-convert-grid">
          <section>
            <h3>时间戳 → 日期</h3>
            <div className="ts-input-row">
              <input
                value={timestamp}
                onChange={(event) => setTimestamp(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setTimestamp(event.currentTarget.value.trim());
                }}
                placeholder="输入 Unix 秒或毫秒"
              />
              <select value={timestampTimezone} onChange={(event) => setTimestampTimezone(event.target.value)}>
                {timezoneOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button className="ghost-btn" type="button" onClick={() => fillCurrentTimestamp("s")}>
                当前秒
              </button>
              <button className="ghost-btn" type="button" onClick={() => fillCurrentTimestamp("ms")}>
                当前毫秒
              </button>
            </div>
            {timestampResult && "error" in timestampResult ? (
              <div className="regex-error">{timestampResult.error}</div>
            ) : timestampResult ? (
              <div className="ts-grid">
                <div className="ts-field">
                  <span className="ts-label">UTC 时间</span>
                  <code className="ts-value">{timestampResult.utc}</code>
                </div>
                <div className="ts-field">
                  <span className="ts-label">北京时间</span>
                  <code className="ts-value">{timestampResult.iso}</code>
                </div>
                <div className="ts-field">
                  <span className="ts-label">本地时间</span>
                  <code className="ts-value">{timestampResult.human}</code>
                </div>
                <div className="ts-field">
                  <span className="ts-label">星期</span>
                  <code className="ts-value">{timestampResult.weekDay}</code>
                </div>
                <div className="ts-field">
                  <span className="ts-label">相对时间</span>
                  <code className="ts-value">{timestampResult.relative}</code>
                </div>
                <div className="ts-field">
                  <span className="ts-label">Unix 秒</span>
                  <code className="ts-value">{timestampResult.unixSeconds}</code>
                </div>
                {timestampResult.tzLocal ? (
                  <div className="ts-field">
                    <span className="ts-label">指定时区</span>
                    <code className="ts-value">{timestampResult.tzLocal}</code>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section>
            <h3>日期 → 时间戳</h3>
            <div className="ts-input-row">
              <input
                type="datetime-local"
                step="1"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setDate(event.currentTarget.value);
                }}
              />
              <select value={dateTimezone} onChange={(event) => setDateTimezone(event.target.value)}>
                {timezoneOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button className="ghost-btn" type="button" onClick={fillCurrentDate}>
                现在
              </button>
            </div>
            {dateResult && "error" in dateResult ? (
              <div className="regex-error">{dateResult.error}</div>
            ) : dateResult ? (
              <div className="ts-grid">
                <div className="ts-field">
                  <span className="ts-label">Unix 秒</span>
                  <code className="ts-value">{dateResult.unixSeconds}</code>
                  <button className="ts-copy" type="button" onClick={() => copyValue(dateResult.unixSeconds)}>
                    复制
                  </button>
                </div>
                <div className="ts-field">
                  <span className="ts-label">Unix 毫秒</span>
                  <code className="ts-value">{dateResult.unixMs}</code>
                  <button className="ts-copy" type="button" onClick={() => copyValue(dateResult.unixMs)}>
                    复制
                  </button>
                </div>
                <div className="ts-field">
                  <span className="ts-label">本地时间</span>
                  <code className="ts-value">{dateResult.readable}</code>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </section>
      <div className={`toast ts-toast${toast ? " toast-visible" : " hidden"}`}>{toast}</div>
    </ToolLayout>
  );
}
