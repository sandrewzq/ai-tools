import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import { chromium } from "playwright";

const root = path.resolve(import.meta.dirname, "..");
const baselinePath = path.join(root, "tests", "visual-baselines.json");
const updateBaselines = process.env.UPDATE_VISUAL_BASELINES === "1";

const cases = [
  {
    name: "home-desktop",
    route: "home",
    viewport: { width: 1366, height: 900 },
    selectors: [".page-shell", ".hero", ".tool-tabs", ".tools-home-panel", ".tool-card"],
  },
  {
    name: "color-palette-desktop",
    route: "color-palette",
    viewport: { width: 1366, height: 900 },
    selectors: [".palette-mode-tabs", ".palette-preview", ".palette-copy-grid"],
  },
  {
    name: "color-palette-mobile",
    route: "color-palette",
    viewport: { width: 390, height: 844 },
    selectors: [".palette-mode-tabs", ".palette-preview", ".palette-copy-grid"],
  },
  {
    name: "json-formatter-desktop",
    route: "json-formatter",
    viewport: { width: 1366, height: 900 },
    action: "json-validate",
    skipFingerprint: true,
    selectors: [".tool-panel", ".json-output", ".json-stats-grid"],
  },
  {
    name: "timestamp-converter-desktop",
    route: "timestamp-converter",
    viewport: { width: 1366, height: 900 },
    selectors: [".ts-current", ".ts-grid", ".ts-copy"],
    maskSelectors: [".ts-current", ".ts-grid"],
  },
];

test("key screens match visual baselines", async () => {
  await withPreview(async (baseUrl) => {
    const browser = await chromium.launch({ headless: true });
    try {
      const current = {};
      for (const item of cases) {
        const page = await browser.newPage({ viewport: item.viewport, isMobile: item.viewport.width < 500 });
        current[item.name] = await captureCase(page, baseUrl, item);
        await page.close();
      }

      if (updateBaselines) {
        await fs.writeFile(baselinePath, `${JSON.stringify({ version: 1, cases: current }, null, 2)}\n`, "utf8");
        return;
      }

      const baseline = JSON.parse(await fs.readFile(baselinePath, "utf8"));
      assert.equal(baseline.version, 1, "visual baseline version should match");

      for (const item of cases) {
        assert.ok(baseline.cases[item.name], `${item.name} should have a visual baseline`);
        compareCase(item, current[item.name], baseline.cases[item.name]);
      }
    } finally {
      await browser.close();
    }
  });
});

async function captureCase(page, baseUrl, item) {
  await page.goto(`${baseUrl}/#${item.route}`, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: "*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;caret-color:transparent!important}",
  });
  await page.locator("h1, h2").first().waitFor({ state: "visible", timeout: 5000 });
  if (item.action === "json-validate") {
    await page.getByRole("button", { name: /校验/ }).click();
  }
  for (const selector of item.selectors) {
    await page.locator(selector).first().waitFor({ state: "visible", timeout: 5000 });
  }

  const screenshot = await page.screenshot({
    animations: "disabled",
    caret: "hide",
    fullPage: false,
    scale: "css",
    type: "png",
    mask: (item.maskSelectors || []).map((selector) => page.locator(selector)),
    maskColor: "#f3efe7",
  });
  const png = PNG.sync.read(screenshot);

  return {
    route: item.route,
    viewport: item.viewport,
    fingerprint: fingerprintPng(png, 24, 16),
    metrics: await captureMetrics(page, item.selectors),
  };
}

async function captureMetrics(page, selectors) {
  return page.evaluate((items) => {
    const rounded = (value) => Math.round(value);
    return Object.fromEntries(
      items.map((selector) => {
        const element = document.querySelector(selector);
        if (!element) return [selector, null];
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return [
          selector,
          {
            box: {
              x: rounded(rect.x),
              y: rounded(rect.y),
              width: rounded(rect.width),
              height: rounded(rect.height),
            },
            colors: {
              backgroundColor: style.backgroundColor,
              color: style.color,
              borderColor: style.borderColor,
            },
          },
        ];
      }),
    );
  }, selectors);
}

function fingerprintPng(png, cellsX, cellsY) {
  const cells = [];
  const cellWidth = png.width / cellsX;
  const cellHeight = png.height / cellsY;

  for (let cy = 0; cy < cellsY; cy += 1) {
    for (let cx = 0; cx < cellsX; cx += 1) {
      const startX = Math.floor(cx * cellWidth);
      const endX = Math.min(png.width, Math.ceil((cx + 1) * cellWidth));
      const startY = Math.floor(cy * cellHeight);
      const endY = Math.min(png.height, Math.ceil((cy + 1) * cellHeight));
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          const index = (png.width * y + x) << 2;
          r += png.data[index];
          g += png.data[index + 1];
          b += png.data[index + 2];
          count += 1;
        }
      }

      cells.push([Math.round(r / count), Math.round(g / count), Math.round(b / count)]);
    }
  }

  return { width: png.width, height: png.height, cellsX, cellsY, cells };
}

function compareCase(item, current, baseline) {
  const { name } = item;
  assert.deepEqual(current.viewport, baseline.viewport, `${name} viewport should match baseline`);
  if (!item.skipFingerprint) {
    assert.equal(current.fingerprint.width, baseline.fingerprint.width, `${name} screenshot width should match baseline`);
    assert.equal(current.fingerprint.height, baseline.fingerprint.height, `${name} screenshot height should match baseline`);

    const diffs = current.fingerprint.cells.map((cell, index) => colorDistance(cell, baseline.fingerprint.cells[index]));
    const avgDelta = diffs.reduce((sum, value) => sum + value, 0) / diffs.length;
    const changedRatio = diffs.filter((value) => value > 30).length / diffs.length;
    assert.ok(avgDelta <= 18, `${name} average visual delta ${avgDelta.toFixed(2)} should stay within baseline`);
    assert.ok(changedRatio <= 0.18, `${name} changed visual cells ${(changedRatio * 100).toFixed(1)}% should stay within baseline`);
  }

  for (const [selector, metric] of Object.entries(current.metrics)) {
    assert.ok(baseline.metrics[selector], `${name} ${selector} should exist in baseline`);
    compareBox(name, selector, metric.box, baseline.metrics[selector].box);
    compareCssColor(name, selector, "backgroundColor", metric.colors.backgroundColor, baseline.metrics[selector].colors.backgroundColor);
    compareCssColor(name, selector, "borderColor", metric.colors.borderColor, baseline.metrics[selector].colors.borderColor);
  }
}

function compareBox(name, selector, current, baseline) {
  for (const key of ["x", "width", "height"]) {
    const delta = Math.abs(current[key] - baseline[key]);
    const tolerance = key === "height" ? Math.max(24, Math.round(baseline[key] * 0.12)) : 16;
    assert.ok(delta <= tolerance, `${name} ${selector} ${key} changed by ${delta}px`);
  }
}

function compareCssColor(name, selector, property, current, baseline) {
  const parsedCurrent = parseRgb(current);
  const parsedBaseline = parseRgb(baseline);
  if (!parsedCurrent || !parsedBaseline) {
    assert.equal(current, baseline, `${name} ${selector} ${property} should match baseline`);
    return;
  }
  const delta = colorDistance(parsedCurrent, parsedBaseline);
  assert.ok(delta <= 8, `${name} ${selector} ${property} color delta ${delta.toFixed(2)} should stay within baseline`);
}

function parseRgb(value) {
  const match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(value);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

function colorDistance(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

async function withPreview(callback) {
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const viteBin = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
  const child = spawn(process.execPath, [viteBin, "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: new URL("..", import.meta.url),
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, BROWSER: "none" },
  });

  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  try {
    await waitForUrl(baseUrl, child, () => output);
    await callback(baseUrl);
  } finally {
    child.kill();
    await Promise.race([once(child, "exit"), new Promise((resolve) => setTimeout(resolve, 2000))]);
  }
}

async function getFreePort() {
  const server = http.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  server.close();
  await once(server, "close");
  return port;
}

async function waitForUrl(url, child, readOutput) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`preview server exited early:\n${readOutput()}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`preview server did not start:\n${readOutput()}`);
}
