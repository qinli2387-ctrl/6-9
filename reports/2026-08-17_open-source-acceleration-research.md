# 开源加速调研报告

日期：2026-08-17

## 基线

- 当前应用已经具备 React/Vinext、D1/Drizzle、FSRS、前四周关卡和四科摸底。
- 正式 Sites 项目仍返回 `Sites project not found`，远端 D1 写入和跨设备同步尚未验收。
- 主要开发缺口是错误复习闭环、第 5–8 周内容、写作提交、口语录音转写和发布质量。

## 本次变化

- 检索 Cloudflare、OpenAI、Promptfoo、Deque、Chrome、LanguageTool、wavesurfer.js、H5P 和 IELTS 的官方文档或上游仓库。
- 新增 `docs/OPEN_SOURCE_ACCELERATION_2026-08-17.md`，给出采用、试验和暂缓清单。
- 将开源能力映射到当前技术栈，并形成四周实施顺序和验收指标。

## 验证

- 已验证：D1 本地环境与迁移命令、R2 预签名上传、Workers AI Whisper、Promptfoo、axe-core 和 Workbox 的公开能力。
- 已验证：Whisper、Promptfoo、axe-core、LanguageTool core、H5P PHP library 与 `ts-fsrs` 的上游许可证信息。
- 根据代码判断：保留现有主干、按小模块接入的工作量和风险低于迁移到完整 LMS。
- 尚未验证：正式 Cloudflare 项目权限、R2/Workers AI 绑定、付费配额、真实音频延迟和写作评分一致性。

## 测试

- 本轮只修改 Markdown 文档，没有运行应用构建或自动化测试。
- 上一轮已验证的 `pnpm test`、`pnpm lint`、SQLite 迁移演练和桌面/手机浏览器烟测基线不受本轮影响。

## 失败与审查发现

- 没有发现值得替换当前 React/Vinext/D1/FSRS 主干的开源整套产品。
- H5P 的 PHP/GPL 集成边界与当前 Worker 架构不匹配。
- LanguageTool 和 Whisper 都只覆盖评分信号的一部分，直接映射雅思分数会产生误导。
- 离线写入会引入 D1 同步冲突，Workbox 第一阶段只应缓存应用壳和只读内容。

## 安全与隐私

- R2 预签名 URL 应限制对象键、方法和有效期，并视为 bearer token。
- 音频对象、转写和评分记录必须按认证 `userId` 校验；D1 不保存音频字节。
- 需要定义录音保留期、删除流程和失败上传清理策略。
- Promptfoo 配置和自定义断言按本地代码对待，CI 使用最小权限密钥。

## 未解决项与下一步

1. 恢复正式 Sites/D1 项目并应用迁移 `0003`、`0004`。
2. 实现错误分类和由错误/到期词卡生成的复习关。
3. 扩充第 5–8 周原创内容。
4. 再进入 R2 + Whisper 口语 MVP 和 Promptfoo 写作评分回归。
