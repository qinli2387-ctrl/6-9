# 开源加速方案（2026-08-17）

## 结论

最快的路径不是迁移到 Moodle、Open edX 或 H5P，而是保留现有 React/Vinext、Cloudflare D1、Drizzle 和 `ts-fsrs` 主干，把开源能力按小模块接入。当前优先级应为：正式云端链路、错题复习闭环、口语转写、写作评分回归、无障碍与离线恢复。

## 采用清单

| 优先级 | 组件或能力 | 对六分计划的帮助 | 接入方式 | 决定 |
| --- | --- | --- | --- | --- |
| P0 | Cloudflare D1 本地开发与 Wrangler migrations | 在正式 Sites 项目恢复前，先稳定复演数据库迁移、用户隔离和失败回滚 | 增加本地 D1 配置与迁移检查脚本；恢复正式项目后再执行 `--remote` | 立即采用 |
| P0 | 现有 `ts-fsrs` | 用同一到期队列驱动普通词卡、错题复习关和未来三消关 | 保留现有库和完整复习日志；错误分类只补充内容来源，不另建调度器 | 继续采用 |
| P1 | 浏览器 `MediaRecorder` + Cloudflare R2 | 完成口语录音、回放和可过期的对象存储，不让大音频进入 D1 | 客户端录音；服务端签发短时 PUT URL；D1 只保存对象键、时长、状态和用户 ID | 立即设计，云端恢复后接入 |
| P1 | Cloudflare Workers AI Whisper | 为口语提供英文转写、时间戳/VTT 和可计算的流利度信号 | R2 音频进入异步转写；转写结果只用于反馈，预估分仍按公开维度显示 | 小样本试验 |
| P1 | Promptfoo | 把写作/口语反馈提示词变成可回归的测试集，防止改提示词后评分漂移 | 用原创或获授权样本建立 JSON/YAML 用例；在 CI 检查结构、证据引用、分数范围和禁用措辞 | 评分模块开始时采用 |
| P1 | axe-core | 自动发现常见 WCAG 2.2 A/AA 问题，覆盖地图、摸底、词卡和答题状态 | 在现有浏览器烟测中注入 `axe.run()`；严重违规使测试失败，人工项保留清单 | 立即采用 |
| P2 | Workbox | 缓存应用壳、原创题目与小音频，改善弱网恢复 | 先做 manifest 和离线只读页面；D1 写操作保持在线并显示可重试状态 | 云端闭环稳定后采用 |
| P2 | LanguageTool | 给写作增加拼写、语法和风格错误信号 | 独立服务或受控 API；只作为反馈特征，不直接映射雅思分数 | 后续评估 |
| P2 | wavesurfer.js | 提升口语录音波形、区间回放和时间定位体验 | 仅在原生 `<audio>` 不够用时加入 | 暂缓 |

## 为什么这些项能加快实现

### 1. 先消除云端链路的不确定性

Cloudflare 官方说明 D1 本地模式使用与全球 D1 相同版本，并与生产数据隔离；Wrangler 还能列出和应用未执行迁移，失败迁移会回滚。本项目已经有 Drizzle SQL，因此只需补齐统一的本地配置和命令，不需要更换 ORM。

预期收益（工程估算）：把每次数据库改动从手工 SQLite 演练升级为可重复命令，后续错题、写作和口语表结构都能沿用。

### 2. 用一条音频链完成口语 MVP

浏览器原生录音避免引入前端录音框架。R2 的预签名 PUT URL 可以让浏览器直传对象，Worker 不需要代理音频字节；Whisper 已有 Cloudflare 托管模型，可直接返回转写文本，并能扩展为 VTT 或分词结果。

第一版只做：录音、回放、上传、转写、文本纠错、语速/停顿提示和按四个公开维度展示“预估反馈”。发音质量不能只靠转写正确率判断，先标为有限信号。

### 3. 把 AI 评分变成测试问题

Promptfoo 是 MIT 许可的本地评测 CLI，可用声明式用例和 CI 比较提示词或模型。它适合检查输出结构、分数边界、理由是否引用作文证据，以及同一篇作文在版本升级后是否发生不可接受漂移。

第一批校准集应包含 20–30 个原创或明确许可样本，覆盖短答、跑题、背模板、拼写密集、衔接词堆砌和高质量答案。官方写作与口语公开描述符只用于评分维度与边界，不复制受限题库。

### 4. 自动化质量检查，减少返工

axe-core 可在现有测试环境运行 WCAG 2.0/2.1/2.2 规则。Workbox 后续负责预缓存和运行时缓存，但离线写入会增加同步冲突，所以先缓存应用壳与只读材料，云端提交继续要求网络连接。

## 暂不采用

- **完整 LMS（Moodle/Open edX）**：现有产品已有账号、地图、D1 和学习状态，迁移会重写数据模型、部署和 UI，收益低于接入单点能力。
- **H5P 作为运行时基础**：官方 PHP 库是 GPL 且需要实现平台接口，与当前 TypeScript/Cloudflare Worker 架构不匹配。可借鉴题型结构，不嵌入主运行时。
- **完整游戏引擎作为主界面**：写作、口语、报告和无障碍表单更适合 React；Phaser 只保留给未来 2–4 分钟三消关。
- **网上无授权 IELTS 题库或仿站素材**：会制造版权和题目质量风险，不能缩短可发布产品的交付时间。
- **以 LanguageTool 或 Whisper 输出直接换算雅思分数**：两者只能提供部分语言信号，最终仍需按官方公开维度、人工校准样本和清晰的“预估”标签组合。

## 四周执行顺序

### 第 1 周：云端与复习闭环

1. 固化 D1 本地配置、迁移 list/apply 脚本和空库回归。
2. 恢复正式 Sites/D1 项目并应用 `0003`、`0004`。
3. 新增听力/阅读错误分类、错误记录和按 `userId` 查询。
4. 用错误记录和 FSRS 到期卡生成复习关。

### 第 2 周：内容扩展

1. 建立题目 manifest：来源、许可证、技能、题型、难度、答案、解释、错因标签。
2. 加入构建期校验，拒绝缺少来源/答案/解释的题目。
3. 完成第 5–8 周原创内容，并复用同一答题和复习管线。

### 第 3 周：口语 MVP

1. 原生录音与本地回放。
2. R2 短时直传、对象所有权和生命周期策略。
3. Workers AI Whisper 转写与失败重试。
4. 展示转写、可观察信号和按官方维度组织的预估反馈。

### 第 4 周：写作与发布质量

1. 写作 Task 1/2 提交、版本记录和预估反馈。
2. 建立 Promptfoo 校准/回归集。
3. 给公开演示和正式流程加入 axe-core 自动检查。
4. 增加 PWA manifest；Workbox 先缓存应用壳和只读内容。

## 验收指标

- 空 D1 能按顺序应用全部迁移；重复运行结果稳定。
- 同一用户的错误记录能进入复习关，不同用户数据互不可见。
- 口语录音能上传、转写、失败重试并按生命周期删除。
- 写作/口语反馈始终标注“预估”，包含维度、证据和下一步练习，不输出官方成绩声明。
- 提示词回归集可在 CI 重复执行，关键用例无越界分数或结构缺失。
- 核心公开流程没有 axe-core 的 critical/serious 自动违规，键盘与屏幕阅读器关键路径另做人工验收。

## 已核实的官方/上游资料

- Cloudflare D1 local development: https://developers.cloudflare.com/d1/best-practices/local-development/
- Cloudflare D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/
- Cloudflare R2 presigned URLs: https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- Cloudflare Workers AI Whisper: https://developers.cloudflare.com/workers-ai/models/whisper/
- OpenAI Whisper repository (MIT): https://github.com/openai/whisper
- Promptfoo repository (MIT): https://github.com/promptfoo/promptfoo
- axe-core repository (MPL-2.0): https://github.com/dequelabs/axe-core
- Workbox overview: https://developer.chrome.com/docs/workbox/what-is-workbox/
- LanguageTool repository (LGPL-2.1+ core): https://github.com/languagetool-org/languagetool
- wavesurfer.js repository: https://github.com/katspaugh/wavesurfer.js/
- H5P PHP library (GPL-3.0): https://github.com/h5p/h5p-php-library
- IELTS Writing band descriptors: https://ielts.org/cdn/ielts-guides/ielts-writing-band-descriptors.pdf
- IELTS Speaking band descriptors: https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf

## 证据边界

- 上述能力、接口和许可证来自 2026-08-17 检索到的官方文档或上游仓库，接入前仍需锁定具体版本并复查依赖许可证。
- 优先级、四周顺序和预期收益是根据当前仓库结构作出的工程判断，不是上游项目承诺。
- 正式 Sites 项目恢复、远端 D1 迁移、R2 和 Workers AI 的账号权限与实际配额尚未验证。
