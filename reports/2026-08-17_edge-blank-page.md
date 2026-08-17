# Edge 空白页兼容修复报告

日期：2026-08-17

## 现象

- 用户在 Edge 打开 `http://localhost:3000/demo` 时只看到页面背景，没有内容。
- 本地端口正常监听，HTTP 响应为 200，HTML 长度约 40 KB，因此不是服务停止或路由 404。

## 根因

- Vite 开发日志捕获到客户端异常：`TypeError: Object.hasOwn is not a function`。
- 异常来自 Vinext 的 `slot.js`，说明当前 Edge JavaScript 运行时缺少 `Object.hasOwn`，客户端初始化在渲染前终止。

## 修复

- 新增 `lib/legacy-browser.ts`，仅在 `Object.hasOwn` 缺失时用 `Object.prototype.hasOwnProperty.call` 补齐。
- Worker 对 HTML 响应使用 `HTMLRewriter` 将补丁前置到 `<head>`；纯 Node 渲染测试使用等价字符串注入。
- 补丁位于 Vinext 客户端模块之前，不依赖 React 完成初始化。

## 验证

- polyfill 在移除 `Object.hasOwn` 的独立 VM 环境中通过真假属性测试。
- 最终开发响应：HTTP 200，polyfill 索引 51，Vinext client entry 索引 551，执行顺序正确。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- 真实本地 D1 迁移与隔离验证：通过。
- Vinext 五阶段构建：通过。
- 自动回归：12/12 通过。

## 失败与处理

- 第一版把补丁放在 React `<head>`，构建 HTML 中 Vinext 异步模块仍排在它前面，顺序断言失败，未保留该实现。
- 第二版直接使用 `HTMLRewriter`，纯 Node 测试环境没有该 Cloudflare 全局，3 个渲染测试失败；增加等价 Node 回退后重跑为 12/12。

## 未验证

- 需要用户在原 Edge 标签中按 `Ctrl+F5` 重新载入，确认该具体浏览器实例不再显示空白。
