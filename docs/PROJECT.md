# 六分计划

六分计划是一款面向雅思初学者的 24 周云端学习教练。产品把目标拆成每天 45–90 分钟的任务，并依据正确率、用时、错因和复习结果自动调整后续训练。

## Product rules

- MVP 默认学术类雅思，目标总分 6.0。
- 用户使用 ChatGPT 账号登录，跨手机和电脑读取同一份学习进度。
- 结构化记录保存在云端 D1 数据库；未来的口语录音保存在 R2。
- 词汇复习将使用 ts-fsrs，并完整保存卡片状态与复习日志。
- 新用户先完成短版听、读、写、说摸底；结果只作为初步训练权重，不冒充官方成绩。
- 写作和口语 AI 分数只能标注为预估分，不能冒充官方成绩。
- 题目内容必须来自自有、获授权或允许使用的材料。
- 主学习入口采用可视化闯关地图：24 周分为 6 个世界，每个世界包含普通关、复习关、Boss 模考和宝箱奖励。
- 三消只作为短时练习机制使用，例如词义配对、同义替换和听音选词，不能取代真实雅思题型训练。

## Current architecture

- Responsive PWA-style web app built with React and Vinext.
- Cloudflare Worker runtime provided by Sites.
- D1 via Drizzle ORM for profiles, daily tasks, study events and vocabulary state.
- ChatGPT sign-in supplied by the hosting platform.
- Private Git repository is the intended cross-computer source-code handoff.

## Game loop

完成学习关卡获得 XP 和星星；星星解锁下一关。错题进入复习队列，复习关由 FSRS 到期记录生成。每四周进行一次 Boss 模考，结果决定后续地图分支与训练权重。游戏奖励只用于鼓励完成有效训练，不允许通过重复点击或无效刷题获得进度。

## Data ownership

All learner reads and writes must be filtered with the authenticated `userId`. Secrets are configured only in the hosting platform and are never committed.
