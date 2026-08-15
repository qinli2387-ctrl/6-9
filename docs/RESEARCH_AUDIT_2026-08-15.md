# 产品调研与审计结论（2026-08-15）

## 结论

当前产品已经有可视化地图、云端数据表和四个可玩关卡，但还不是一个能验证“半年达到雅思 6 分”的完整训练系统。下一阶段必须优先完成学习闭环和正式云端运行，再扩充三消表现层。

## 证据边界

- 雅思 6 分目标必须拆成听、读、写、说四个单项。官方格式为四科；学术类听力和阅读各 40 题，官方给出的 6 分参考原始分均为约 23 题。写作和口语必须按官方公开的分项描述评价。
- 间隔学习与主动回忆有稳定研究基础；因此词汇模块采用 FSRS 的四档回忆反馈，而不是“答错后排到队尾”。
- 游戏化研究支持它改善参与度的潜力，但效果取决于学习任务、反馈和挑战设计。地图、XP、星星和三消只能包裹有效训练，不能代替计时阅读、单次播放听力、写作和口语输出。
- 正式产品应满足 WCAG 2.2 的键盘、焦点、对比度、触控目标和减少动画要求，并提供 PWA 安装与基础离线恢复能力。

## 现状审计

### 已有基础

- 24 周、6 个世界的闯关地图和顺序解锁。
- 前 4 周题目、即时反馈、星级和 XP 结算。
- ChatGPT 身份入口以及按 `userId` 隔离的 D1 数据模型。
- 词卡状态和复习日志的数据表骨架。
- 可在手机浏览器打开的独立公开演示。

### 主要缺口（按优先级）

1. **P0：正式云端链路未验收。** 公开演示是独立的浏览器本地进度，并非账号登录后的 D1 正式应用。必须恢复正式部署并完成两台设备的登录、学习、同步验收。
2. **P0：没有真实摸底。** 当前第 1 周是考试常识题，不能判断听说读写起点，也不能证明固定 24 周计划适合个人。
3. **P1：复习闭环未接通。** 词卡表存在但没有调度、到期队列和四档反馈；错题也没有结构化错因。
4. **P1：内容覆盖不足。** 仅前 4 周可玩，且以选择题为主；尚未覆盖官方题型比例、计时练习、写作与口语产出。
5. **P1：进度只显示“做了多少”。** 目前的周数、XP、星星不能代表分数提升，还需要四科能力趋势、到期复习完成率和 Boss 模考结果。
6. **P2：可靠性与用户权利不足。** 还缺数据导出、删除、备份恢复演练、PWA、断网恢复和完整无障碍测试。
7. **P2：三消尚未验证学习价值。** 应先以 2–4 分钟词义、同义替换或搭配回忆为原型，并记录正确率与后续保持率，再决定是否扩大。

## 实施顺序

1. 接通 `ts-fsrs`、四档反馈、到期词卡和完整复习日志。
2. 建立 10–15 分钟的分科摸底，并用结果生成初始训练权重。
3. 把关卡错题按“知识、定位、理解、拼写、时间管理”归类，动态生成复习关。
4. 恢复正式云端部署，完成跨设备 D1 同步、导出和恢复验收。
5. 扩充第二世界和官方题型覆盖；写作/口语只显示“预估分”。
6. 用同一 FSRS 到期队列制作第一版三消词汇关，保持键盘可操作，并保留普通卡片模式。

## 开源采用决定

- `ts-fsrs`（MIT）：直接采用调度库，保存完整卡片状态和日志。
- Phaser 官方 Next.js 模板及 examples（MIT）：只在三消原型阶段采用桥接和动画机制；图像与音频单独核对授权。
- Athena（MIT）：借鉴路线图和关卡状态，不照搬界面或未经审计的业务模块。
- 无明确许可证的 Duolingo/Candy Crush 仿制项目：只观察产品思路，不复制代码或素材。

## 本轮实施范围

本轮先完成第 1 项：首批原创词卡、云端到期队列、FSRS 四档评分、完整调度状态和复习日志。公开演示保持不动，直到正式应用通过构建和浏览器验收。

## 核心资料

- IELTS Academic test format: https://ielts.org/organisations/ielts-for-organisations/test-types/ielts-academic-test/academic-test-format-in-detail
- IELTS scoring in detail: https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail
- IELTS official sample questions: https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test
- IELTS Writing band descriptors: https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf
- IELTS Speaking band descriptors: https://cdn.ielts.org/ielts-guides/ielts-speaking-band-descriptors.pdf
- `ts-fsrs` official repository and documentation: https://github.com/open-spaced-repetition/ts-fsrs
- Spacing and retrieval-practice review: https://doi.org/10.1038/s44159-022-00089-1
- EFL/ESL gamification evidence review: https://doi.org/10.3389/feduc.2024.1395155
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- PWA getting started: https://web.dev/learn/pwa/getting-started
- Phaser official Next.js template: https://github.com/phaserjs/template-nextjs
