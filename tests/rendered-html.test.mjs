import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { legacyBrowserPolyfill } from "../lib/legacy-browser.ts";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the 六分计划 landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /六分计划/);
  assert.match(html, /把半年的目标/);
  assert.match(html, /云端自动同步/);
  assert.match(html, /typeof Object\.hasOwn/);
  assert.ok(html.indexOf("typeof Object.hasOwn") < html.search(/<script[^>]+type="module"/));
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("polyfills Object.hasOwn before Vinext starts in older browsers", () => {
  const context = vm.createContext({});
  vm.runInContext("Object.hasOwn = undefined", context);
  vm.runInContext(legacyBrowserPolyfill, context);
  assert.equal(vm.runInContext("Object.hasOwn({ answer: 6 }, 'answer')", context), true);
  assert.equal(vm.runInContext("Object.hasOwn({ answer: 6 }, 'missing')", context), false);
});

test("renders the four-skill placement demo without authentication", async () => {
  const response = await render("/demo/placement");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /四科摸底/);
  assert.match(html, /先找到真实起点/);
  assert.match(html, /听一段短对话/);
  assert.doesNotMatch(html, /react-loading-skeleton/);
});

test("renders the review level UI without authentication", async () => {
  const response = await render("/demo/levels/3");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /第一轮复习/);
  assert.match(html, /复习不是重做/);
  assert.match(html, /开始挑战/);
});
