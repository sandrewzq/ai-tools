import assert from "node:assert/strict";
import test from "node:test";
import { collectConsoleErrors, launchBrowser, withPreview } from "./helpers/browser.mjs";

const mojibakePattern =
  /\uFFFD|\u93BC|\u677B|\u5BA6|\u6FB6|\u9428|\u7F02|\u9366|\u9286|\u921D|\u4E41|\u4E44|\u4E31|\u4E33|\u20AC|\u2469|\u93CD|\u6D93|\u934F|\u93C8|\u9422|\u53D9|\u6D63|\u7039|\u93C3/;

const routes = [
  "home",
  "speed-test",
  "color-palette",
  "prompt-templates",
  "text-chunker",
  "text-differ",
  "token-calculator",
  "json-formatter",
  "regex-tester",
  "encoding-converter",
  "timestamp-converter",
  "curl-converter",
  "qr-generator",
  "uuid-generator",
  "hash-generator",
  "jwt-debugger",
  "cron-parser",
  "color-converter",
  "yaml-formatter",
  "xml-formatter",
  "url-parser",
  "csv-converter",
];

const routeChecks = {
  "color-palette": async (page) => {
    await expectVisible(page, ".palette-mode-tabs");
    await expectVisible(page, ".palette-preview");
    await expectVisible(page, ".palette-copy-grid");
  },
  "prompt-templates": async (page) => {
    await expectVisible(page, ".prompt-card");
    await expectVisible(page, ".fav-btn");
    await page.locator(".copy-btn").first().click();
    await expectVisible(page, ".prompt-toast");
  },
  "text-chunker": async (page) => {
    await page.locator("textarea").first().fill("第一段\n\n第二段");
    await page.getByRole("button", { name: /开始分块/ }).click();
    await expectVisible(page, ".chunker-config-row");
    await expectVisible(page, ".chunk-card");
    await expectVisible(page, ".chunk-stats");
  },
  "token-calculator": async (page) => {
    await page.locator("textarea").first().fill("你好 world");
    await expectVisible(page, ".token-stats-grid");
    await expectVisible(page, ".token-detail-row");
  },
  "json-formatter": async (page) => {
    await page.getByRole("button", { name: /校验/ }).click();
    await expectVisible(page, ".json-output");
    await expectVisible(page, ".json-stats-grid");
    await expectVisible(page, ".json-toggle");
  },
  "regex-tester": async (page) => {
    await page.locator("input").first().fill("(?<name>\\w+)=(\\d+)");
    await page.locator("textarea").first().fill("a=1 b=2");
    await expectVisible(page, ".regex-stats");
    await expectVisible(page, ".regex-match-item");
    await expectVisible(page, ".regex-groups");
  },
  "encoding-converter": async (page) => {
    await page.locator("#enc-base64-encode").click();
    await expectVisible(page, "#enc-base64-encode");
    await expectVisible(page, ".encoding-output");
  },
  "timestamp-converter": async (page) => {
    await expectVisible(page, ".ts-current");
    await expectVisible(page, ".ts-grid");
    await expectVisible(page, ".ts-copy");
  },
  "curl-converter": async (page) => {
    await page.getByRole("button", { name: /示例/ }).click();
    await expectVisible(page, ".curl-input-row");
    await expectVisible(page, ".curl-summary");
    await expectVisible(page, ".curl-output-panel");
  },
  "qr-generator": async (page) => {
    await page.locator("textarea").first().fill("https://example.com");
    await expectVisible(page, ".qr-body");
    await expectVisible(page, ".qr-canvas");
    await expectVisible(page, ".qr-info");
  },
  "uuid-generator": async (page) => {
    await expectVisible(page, ".uuid-row");
    await expectVisible(page, ".uuid-copy-btn");
  },
  "hash-generator": async (page) => {
    await expectVisible(page, ".hash-result-row");
    await expectVisible(page, ".hash-copy-btn");
  },
  "jwt-debugger": async (page) => {
    await expectVisible(page, ".jwt-code-panel");
    await expectVisible(page, ".jwt-sig");
    await expectVisible(page, ".jwt-verify-hint");
  },
  "cron-parser": async (page) => {
    await expectVisible(page, ".cron-example-btn");
    await expectVisible(page, ".cron-summary-card");
    await expectVisible(page, ".cron-fields-grid");
  },
  "color-converter": async (page) => {
    await expectVisible(page, ".color-converter-swatch");
    await expectVisible(page, ".color-format-card");
    await expectVisible(page, ".color-copy-btn");
  },
  "yaml-formatter": async (page) => {
    await expectVisible(page, ".devtool-stats-grid");
    await expectVisible(page, ".yaml-output");
    await expectVisible(page, ".yaml-json-output");
  },
  "xml-formatter": async (page) => {
    await expectVisible(page, ".devtool-stats-grid");
    await expectVisible(page, ".xml-output");
    await expectVisible(page, ".xml-tree-output");
  },
  "url-parser": async (page) => {
    await expectVisible(page, ".url-part-row");
    await expectVisible(page, ".devtool-table");
    await expectVisible(page, ".url-json-output");
    await expectVisible(page, ".url-rebuilt-output");
  },
  "csv-converter": async (page) => {
    await expectVisible(page, ".devtool-stats-grid");
    await expectVisible(page, ".devtool-table");
    await expectVisible(page, ".csv-json-output");
    await expectVisible(page, ".csv-table-output");
  },
};

test("desktop routes render without console errors, mojibake, or missing legacy surfaces", async () => {
  await withPreview(async (baseUrl) => {
    const { browser, errors } = await launchBrowser();
    try {
      const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
      collectConsoleErrors(page, errors);

      for (const route of routes) {
        await page.goto(`${baseUrl}/#${route}`, { waitUntil: "networkidle" });
        await expectVisible(page, "h1, h2");
        const bodyText = await page.locator("body").innerText();
        assert.ok(bodyText.trim().length > 40, `${route} should render meaningful text`);
        assert.ok(!mojibakePattern.test(bodyText), `${route} should not render mojibake text`);

        if (routeChecks[route]) {
          await routeChecks[route](page);
        }
      }

      assert.deepEqual(errors, [], "browser console should not report errors");
    } finally {
      await browser.close();
    }
  });
});

test("mobile routes fit the viewport without horizontal overflow", async () => {
  await withPreview(async (baseUrl) => {
    const { browser, errors } = await launchBrowser();
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
      collectConsoleErrors(page, errors);

      for (const route of routes) {
        await page.goto(`${baseUrl}/#${route}`, { waitUntil: "networkidle" });
        await expectVisible(page, "h1, h2");
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        assert.ok(overflow <= 2, `${route} should not overflow mobile viewport by ${overflow}px`);
      }

      assert.deepEqual(errors, [], "browser console should not report errors");
    } finally {
      await browser.close();
    }
  });
});

async function expectVisible(page, selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout: 5000 });
  assert.ok(await locator.isVisible(), `${selector} should be visible`);
}
