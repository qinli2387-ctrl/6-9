export type LevelKind = "lesson" | "review" | "boss";

export type PlanLevel = {
  week: number;
  key: string;
  title: string;
  focus: string;
  kind: LevelKind;
};

export type PlanWorld = {
  number: number;
  name: string;
  subtitle: string;
  className: string;
  levels: PlanLevel[];
};

const levelContent: Array<Omit<PlanLevel, "week" | "key">> = [
  { title: "认识雅思", focus: "题型与高频场景", kind: "lesson" },
  { title: "句子地基", focus: "核心语法与听音", kind: "lesson" },
  { title: "第一轮复习", focus: "错因回收", kind: "review" },
  { title: "起点挑战", focus: "四科基础小测", kind: "boss" },
  { title: "信息定位", focus: "数字、日期与地点", kind: "lesson" },
  { title: "阅读寻路", focus: "关键词与同义替换", kind: "lesson" },
  { title: "薄弱点复习", focus: "听读错题回炉", kind: "review" },
  { title: "定位挑战", focus: "限时听读小测", kind: "boss" },
  { title: "段落逻辑", focus: "主旨与段落结构", kind: "lesson" },
  { title: "写作骨架", focus: "观点与主题句", kind: "lesson" },
  { title: "表达复习", focus: "词汇与句型巩固", kind: "review" },
  { title: "结构挑战", focus: "阅读与写作小测", kind: "boss" },
  { title: "听力跟速", focus: "Section 2–3", kind: "lesson" },
  { title: "口语展开", focus: "Part 1–2", kind: "lesson" },
  { title: "输出复习", focus: "录音与作文订正", kind: "review" },
  { title: "表达挑战", focus: "说写联合小测", kind: "boss" },
  { title: "长文攻坚", focus: "难句与段落匹配", kind: "lesson" },
  { title: "完整写作", focus: "Task 1 与 Task 2", kind: "lesson" },
  { title: "高频错题复习", focus: "FSRS 到期内容", kind: "review" },
  { title: "半程模考", focus: "四科计时训练", kind: "boss" },
  { title: "速度稳定", focus: "限时策略与取舍", kind: "lesson" },
  { title: "考场表达", focus: "口语连贯与写作检查", kind: "lesson" },
  { title: "考前回收", focus: "个人错题与词汇", kind: "review" },
  { title: "六分终局", focus: "完整模拟考试", kind: "boss" },
];

const worldMeta = [
  ["启航岛", "建立习惯，摸清真实起点", "world-mint"],
  ["定位森林", "听懂信息，快速找到答案", "world-leaf"],
  ["逻辑山谷", "看懂结构，说清楚观点", "world-sand"],
  ["表达港湾", "让口语和写作稳定输出", "world-coral"],
  ["冲刺高原", "提升速度，补齐薄弱环节", "world-blue"],
  ["六分之巅", "适应考场，完成最后冲刺", "world-violet"],
] as const;

export const planWorlds: PlanWorld[] = worldMeta.map(([name, subtitle, className], index) => ({
  number: index + 1,
  name,
  subtitle,
  className,
  levels: levelContent.slice(index * 4, index * 4 + 4).map((level, levelIndex) => {
    const week = index * 4 + levelIndex + 1;
    return { ...level, week, key: `week-${week}` };
  }),
}));

