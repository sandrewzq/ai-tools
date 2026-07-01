import assert from "node:assert/strict";
import { hexToHsl, hslToHex, readableTextColor } from "../src/shared/color.ts";
import { escapeHtml, formatMs, shorten } from "../src/shared/format.ts";
import { deepMerge, parseJsonObject } from "../src/shared/object.ts";
import { average, percentile, roughTokenEstimate } from "../src/shared/stats.ts";
import { joinUrl } from "../src/shared/url.ts";
import { normalizeErrorMessage, parsePositiveInt } from "../src/shared/validation.ts";

assert.equal(formatMs(125.4), "125 ms");
assert.equal(escapeHtml("<tag>"), "&lt;tag&gt;");
assert.equal(shorten("abcdef", 4), "abc…");
assert.equal(joinUrl("https://example.com/v1/", "/chat"), "https://example.com/v1/chat");
assert.equal(parsePositiveInt("3", "次数"), 3);
assert.equal(normalizeErrorMessage(new DOMException("stop", "AbortError")), "请求已停止");
assert.deepEqual(deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } }), { a: 1, b: { c: 2, d: 3 } });
assert.deepEqual(parseJsonObject('{"a":1}', "配置"), { a: 1 });
assert.equal(average([1, 2, Number.NaN, 3]), 2);
assert.equal(percentile([1, 2, 3], 50), 2);
assert.ok(roughTokenEstimate("hello 世界") > 0);
assert.equal(hslToHex(hexToHsl("#ffffff").h, hexToHsl("#ffffff").s, hexToHsl("#ffffff").l), "#FFFFFF");
assert.equal(readableTextColor("#000000"), "#FFFFFF");

console.log("shared helper tests passed");
