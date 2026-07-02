import http from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const projectRoot = new URL("../..", import.meta.url);

export async function launchBrowser(options = {}) {
  const { localChromeFallback = true } = options;
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (localChromeFallback ? localChromePath() : undefined);
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  return { browser, errors: [] };
}

export function collectConsoleErrors(page, errors) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
}

export async function withPreview(callback) {
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const viteBin = fileURLToPath(new URL("../../node_modules/vite/bin/vite.js", import.meta.url));
  const child = spawn(process.execPath, [viteBin, "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: projectRoot,
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

function localChromePath() {
  return process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : undefined;
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
