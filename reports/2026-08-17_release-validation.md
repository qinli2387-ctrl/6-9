# 本地发布前验证报告

日期：2026-08-17

## 基线

- 动态错题复习已完成实现，但本机此前不能启动 `workerd`，因此真实 D1 和正式页面尚未完成端到端验收。
- Vite 开发服务器会扫描仓库内旧浏览器验证目录，可能因锁定的 Cookies 文件退出。

## 变化

- 安装微软官方 VC++ x64 运行库并确认 `workerd` 可启动；安装包 SHA-256：`843068991DAAA1F73AD9F6239BCE4D0F6A07A51F18C37EA2A867E9BECA71295C`。
- `ensureStarterVocabulary` 改为每批 6 张词卡写入，避免 D1 绑定参数上限；唯一索引保持重试幂等。
- Vite 忽略 `work/**`、`.wrangler/**`，不再监听运行产物和被锁定文件。
- 新增 `scripts/verify-local-app.mjs`、`pnpm test:app:local`，覆盖认证、失败路径、定位、周关卡、复习、FSRS 和跨用户隔离。
- 新增仅监听本机回环地址的 `scripts/serve-authenticated-preview.mjs`，用于浏览器给正式认证页面注入固定验证账号。

## 已验证

- `pnpm typecheck`：通过。
- `pnpm lint`：通过；生成的 Cloudflare 类型文件已排除，避免无关警告。
- `pnpm db:verify:local`：通过，验证 9 张 D1 业务表、20 个 `learning_errors` 字段、6 个迁移和双用户隔离夹具。
- `pnpm test`：Vinext 构建通过，11/11 自动化测试通过。
- `pnpm test:app:local`：通过未登录 401、非法参数 400、跨用户复习题 409、定位写入、周 1/2 晋级、周 3 个性化复习、错题解决、FSRS 调度和用户隔离。
- 浏览器：正式 `/levels/3` 认证页面在 1365×900 与 390×844 通过；题目选择后确认按钮启用，答对反馈包含错因说明，底部确认按钮可见，无横向溢出，控制台无错误或警告。

## 未解决项

- 正式 Sites 项目仍返回 `Sites project not found`，本轮没有执行远端迁移、生产发布或跨设备验收。
- 只有第 1–4 周有可玩内容；写作/口语仍是初步估计，不是官方成绩。

## 下一步

1. 恢复正式 Sites/D1 后应用迁移并做两台设备同步验收。
2. 扩充第 5–8 周原创题目和错因元数据。
3. 在正式云链路可用后实现 MediaRecorder、R2 和 Whisper 口语 MVP。
