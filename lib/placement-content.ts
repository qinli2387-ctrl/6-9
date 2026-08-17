import type { ErrorCategory } from "@/lib/error-taxonomy";

export type ObjectiveQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  errorCategory: ErrorCategory;
};

export type SpeakingRatingKey = "fluency" | "vocabulary" | "grammar" | "pronunciation";

export type SpeakingRubric = {
  key: SpeakingRatingKey;
  label: string;
  options: string[];
};

export const listeningQuestions: ObjectiveQuestion[] = [
  {
    id: "listening-1",
    prompt: "周六英语工作坊几点开始？",
    options: ["9:00", "9:15", "9:30", "9:45"],
    correctIndex: 1,
    explanation: "录音先提到九点开门，随后明确说明工作坊九点十五分开始。",
    errorCategory: "distractor",
  },
  {
    id: "listening-2",
    prompt: "工作坊在哪个房间？",
    options: ["Room 4", "Room 40", "Room 14", "Room 41"],
    correctIndex: 2,
    explanation: "录音中的房间号是 Room 14，需要区分相近数字。",
    errorCategory: "detail",
  },
  {
    id: "listening-3",
    prompt: "参加者需要自己带什么？",
    options: ["笔记本", "词典", "证件照", "笔记本电脑"],
    correctIndex: 0,
    explanation: "材料会提供，但参加者需要自带用于记录的笔记本。",
    errorCategory: "distractor",
  },
];

export const readingPassage = `Riverside Library has introduced quiet study hours on weekdays from 8:00 to 10:00 in the morning. During this period, visitors must keep phones on silent and move group discussions to the collaboration rooms on the second floor.

The library tested the change after students reported that it was difficult to concentrate before morning classes. In the first month, the use of individual study seats rose by 18 percent, while complaints about noise fell. The library will continue the trial for three months before deciding whether to make the hours permanent. Students can still reserve collaboration rooms online up to seven days in advance.`;

export const readingQuestions: ObjectiveQuestion[] = [
  {
    id: "reading-1",
    prompt: "图书馆设置安静学习时段的主要原因是什么？",
    options: ["帮助学生减少干扰", "延长周末开放时间", "减少座位数量", "推广线上课程"],
    correctIndex: 0,
    explanation: "学生反映早课前难以集中注意力，因此主要目的是减少干扰。",
    errorCategory: "inference",
  },
  {
    id: "reading-2",
    prompt: "小组讨论应该在哪里进行？",
    options: ["一楼入口", "个人学习区", "二楼协作室", "图书馆外面"],
    correctIndex: 2,
    explanation: "第一段明确要求把小组讨论移到二楼协作室。",
    errorCategory: "location",
  },
  {
    id: "reading-3",
    prompt: "图书馆计划试行这项安排多久？",
    options: ["一个月", "三个月", "七天", "一个学期"],
    correctIndex: 1,
    explanation: "第二段说明图书馆会继续试行三个月，再决定是否长期实施。",
    errorCategory: "location",
  },
];

export const writingPrompt = {
  title: "短写作",
  prompt: "Some students prefer studying alone, while others prefer studying in groups. Which do you prefer and why?",
  guidance: "请用英文写 80–120 词。先表达选择，再用理由和例子展开。",
};

export const speakingPrompt = {
  title: "60 秒口头回答",
  prompt: "Describe one English skill you want to improve. Explain why it matters to you and how you plan to practise it.",
  guidance: "准备后直接开口回答。计时只保存在当前页面，本轮不录音、不上传声音。",
};

export const speakingRubrics: SpeakingRubric[] = [
  { key: "fluency", label: "流利度", options: ["经常中断", "能说短句", "基本连续", "连续且自然"] },
  { key: "vocabulary", label: "词汇", options: ["词汇很少", "够表达大意", "有一定变化", "用词灵活准确"] },
  { key: "grammar", label: "语法", options: ["错误影响理解", "简单句为主", "能尝试复杂句", "句式多样稳定"] },
  { key: "pronunciation", label: "发音清晰度", options: ["较难听懂", "部分可懂", "大多清楚", "清楚且节奏自然"] },
];

export const placementStepLabels = ["准备", "听力", "阅读", "写作", "口语"] as const;
