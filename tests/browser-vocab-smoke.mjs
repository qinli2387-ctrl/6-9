import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";

const debugPort = process.env.CHROME_DEBUG_PORT ?? "9223";
const appUrl = process.env.APP_URL ?? "http://127.0.0.1:3001/demo/vocabulary";
const screenshotPath = process.env.SCREENSHOT_PATH ?? "work/vocab-reviewed-mobile.png";

const target = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(appUrl)}`, { method: "PUT" }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const waiting = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !waiting.has(message.id)) return;
  const { resolve, reject } = waiting.get(message.id);
  waiting.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function command(method, params = {}) {
  const id = nextId++;
  const promise = new Promise((resolve, reject) => waiting.set(id, { resolve, reject }));
  socket.send(JSON.stringify({ id, method, params }));
  return promise;
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, timeoutMs = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for: ${expression}`);
}

await command("Runtime.enable");
await command("Page.enable");
await command("Emulation.setDeviceMetricsOverride", { width: 430, height: 900, deviceScaleFactor: 1, mobile: true });
await command("Page.navigate", { url: appUrl });
await waitFor(`document.readyState === "complete" && document.querySelector(".vocab-card h1")?.textContent === "allocate"`);

assert.equal(await evaluate(`document.querySelector(".vocab-card h1").textContent`), "allocate");
await evaluate(`document.querySelector(".vocab-card .level-primary").click()`);
await waitFor(`document.querySelectorAll(".rating-grid button").length === 4`);
assert.match(await evaluate(`document.querySelector(".vocab-answer").textContent`), /分配/);

await evaluate(`document.querySelector(".rating-grid .good").click()`);
await waitFor(`document.querySelector(".vocab-card h1")?.textContent === "significant"`);
assert.match(await evaluate(`document.querySelector(".vocab-progress").textContent`), /1\s*\/\s*3/);

const screenshot = await command("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
await command("Browser.close");
console.log("Vocabulary browser smoke test passed: reveal, four ratings, and next-card progress.");
