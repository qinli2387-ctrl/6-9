import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const debugPort = process.env.CHROME_DEBUG_PORT ?? "9224";
const appUrl = process.env.APP_URL ?? "http://127.0.0.1:4310/demo/placement";
const outputDir = process.env.SCREENSHOT_DIR ?? "work";

await mkdir(outputDir, { recursive: true });
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json());
const target = targets.find((item) => item.type === "page");
if (!target) throw new Error("No debuggable Chrome page was found");
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
socket.addEventListener("close", () => {
  for (const { reject } of waiting.values()) reject(new Error("Chrome debugging connection closed"));
  waiting.clear();
});

function command(method, params = {}) {
  const id = nextId++;
  const promise = new Promise((resolve, reject) => waiting.set(id, { resolve, reject }));
  socket.send(JSON.stringify({ id, method, params }));
  return promise;
}

async function evaluate(expression) {
  const response = await command("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
}

async function waitFor(expression, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for: ${expression}`);
}

async function screenshot(name) {
  const image = await command("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(`${outputDir}/${name}`, Buffer.from(image.data, "base64"));
}

await command("Runtime.enable");
await command("Page.enable");
await command("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
if (await evaluate("location.href") !== appUrl) {
  const navigation = await command("Page.navigate", { url: appUrl });
  if (navigation.errorText && navigation.errorText !== "net::ERR_ABORTED") {
    throw new Error(`Chrome navigation failed: ${navigation.errorText}`);
  }
}
await waitFor(`document.readyState === "complete" && Boolean(document.querySelector(".placement-intro h1"))`);
assert.match(await evaluate(`document.querySelector(".placement-intro h1").textContent`), /真实起点/);
assert.equal(await evaluate(`document.querySelectorAll(".placement-skill-preview > div").length`), 4);
await screenshot("placement-desktop-intro.png");

await command("Emulation.setDeviceMetricsOverride", { width: 430, height: 900, deviceScaleFactor: 1, mobile: true });
await evaluate(`document.querySelector(".placement-intro .level-primary").click()`);
await waitFor(`document.querySelector(".placement-card h1")?.textContent === "听力定位"`);
await waitFor(`document.querySelector(".placement-audio").readyState >= 1`);

await evaluate(`{
  const picks = [1, 2, 0];
  [...document.querySelectorAll(".placement-question")].forEach((question, index) => question.querySelectorAll("label")[picks[index]].click());
}`);
await evaluate(`document.querySelector(".placement-actions .level-primary").click()`);
await waitFor(`document.querySelector(".placement-card h1")?.textContent === "阅读理解"`);

await evaluate(`{
  const picks = [0, 2, 1];
  [...document.querySelectorAll(".placement-question")].forEach((question, index) => question.querySelectorAll("label")[picks[index]].click());
}`);
await evaluate(`document.querySelector(".placement-actions .level-primary").click()`);
await waitFor(`Boolean(document.querySelector(".placement-writing textarea"))`);

const writing = "I prefer studying in a small group because classmates can explain difficult ideas. For example, when I miss an answer, another student may show me the key sentence. Group study also gives me a regular schedule and keeps me motivated. However, I still review vocabulary alone after each meeting. Therefore, I can share ideas first and then check whether I understand the lesson without help. This balance makes my study time focused, useful, and enjoyable every week.";
await evaluate(`{
  const textarea = document.querySelector(".placement-writing textarea");
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
  setter.call(textarea, ${JSON.stringify(writing)});
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}`);
await waitFor(`document.querySelector(".placement-word-count span")?.textContent !== "0 词"`);
await evaluate(`document.querySelector(".placement-actions .level-primary").click()`);
await waitFor(`Boolean(document.querySelector(".placement-speaking"))`);

await evaluate(`document.querySelector(".speaking-timer button").click()`);
await waitFor(`document.querySelector(".speaking-timer strong")?.textContent === "0:15"`, 20000);
await evaluate(`document.querySelector(".speaking-timer button").click()`);
await evaluate(`[...document.querySelectorAll(".speaking-rubrics fieldset")].forEach((field) => field.querySelectorAll("label")[2].click())`);
await evaluate(`document.querySelector(".placement-actions .level-primary").click()`);
await waitFor(`Boolean(document.querySelector(".placement-result"))`, 10000);

assert.equal(await evaluate(`document.querySelectorAll(".placement-results-grid section").length`), 4);
assert.match(await evaluate(`document.querySelector(".placement-disclaimer").textContent`), /不是官方雅思成绩/);
assert.equal(await evaluate(`[...document.querySelectorAll(".placement-results-grid section > small")].reduce((sum, item) => sum + Number(item.textContent.match(/([0-9]+)%/)[1]), 0)`), 100);
assert.equal(await evaluate(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`), true);
await evaluate(`window.scrollTo(0, 0)`);
await screenshot("placement-mobile-result.png");

await command("Browser.close");
console.log("Placement browser smoke test passed: desktop intro, mobile four-skill flow, result weights, and overflow.");
