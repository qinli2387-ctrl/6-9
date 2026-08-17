# 本地开发与 D1 迁移

## 常用命令

```powershell
pnpm install
pnpm lint
pnpm test
pnpm db:verify:sqlite
```

`db:verify:sqlite` 会在内存空库中按顺序执行 `drizzle/*.sql`，然后检查核心表和 `learning_errors` 列。它是快速的 SQL 兼容性回归，不代表 Cloudflare D1 已实际启动。

## Wrangler 本地 D1

项目使用独立的 `wrangler.local.jsonc`，本地数据库名称为 `band-six-local`，不会访问远端数据。

```powershell
pnpm db:migrations:list:local
pnpm db:migrate:local
pnpm db:verify:local
```

- `db:migrate:local`：把尚未执行的迁移应用到 `.wrangler` 下的持久本地 D1。
- `db:verify:local`：清空独立的 `.wrangler/migration-verification` 状态，重放全部迁移并检查表结构。
- `.wrangler` 已被 Git 忽略，不能作为跨设备数据来源。

Windows 上 Wrangler 依赖 `workerd.exe`。如果出现 `write EOF`、缺少 `VCRUNTIME140_1.dll`、缺少 `MSVCP140_ATOMIC_WAIT.dll` 或 runtime access violation，需要先修复 Microsoft Visual C++ 2015–2022 x64 Runtime，再重新运行 D1 验证。不要把 SQLite 回归的通过结果写成 D1 已验证。

## 远端迁移边界

正式数据库操作必须先确认 `.openai/hosting.json` 对应的 Sites 项目归属和可访问状态。当前项目仍返回 `Sites project not found`，因此尚未执行迁移 `0003`、`0004`、`0005` 的远端验收，也未执行跨设备同步测试。

恢复项目后按以下顺序操作：

1. 列出远端未应用迁移。
2. 导出或确认可恢复点。
3. 应用 `0003`、`0004`、`0005`。
4. 使用测试账号完成摸底、产生错题、进入第 3 周复习关。
5. 在第二台设备确认错题状态、FSRS 到期时间和关卡进度同步。
