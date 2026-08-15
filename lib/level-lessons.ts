export type LessonQuestion = {
  id: string;
  skill: "规则" | "听力" | "阅读" | "语法" | "写作" | "口语";
  prompt: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type LevelLesson = {
  week: number;
  estimatedMinutes: number;
  briefingTitle: string;
  briefing: string[];
  questions: LessonQuestion[];
};

const lessons: LevelLesson[] = [
  {
    week: 1,
    estimatedMinutes: 8,
    briefingTitle: "先看懂考试，再开始刷题",
    briefing: [
      "雅思由听力、阅读、写作和口语四部分组成。",
      "学术类与培训类的听力、口语相同；阅读和写作不同。",
      "这一关只建立考试地图，不要求你背下所有细节。",
    ],
    questions: [
      {
        id: "w1-q1", skill: "规则", prompt: "雅思完整考试包含哪四项？",
        options: ["词汇、语法、翻译、写作", "听力、阅读、写作、口语", "听写、阅读、作文、面试", "语法、阅读、口译、写作"],
        correctIndex: 1, explanation: "雅思总分由听力、阅读、写作、口语四个单项共同构成。",
      },
      {
        id: "w1-q2", skill: "听力", prompt: "做雅思听力时，题目答案通常怎样出现？",
        options: ["完全随机", "通常按录音信息顺序出现", "先出现最后一题", "只在录音结尾出现"],
        correctIndex: 1, explanation: "听力题的答案通常按录音中的信息顺序出现，可以利用题号预测进度。",
      },
      {
        id: "w1-q3", skill: "规则", prompt: "学术类与培训类雅思，哪两项内容相同？",
        options: ["阅读和写作", "听力和口语", "听力和阅读", "写作和口语"],
        correctIndex: 1, explanation: "两种考试的听力与口语相同，阅读和写作部分不同。",
      },
      {
        id: "w1-q4", skill: "写作", prompt: "学术类写作中，哪项对写作成绩权重更高？",
        options: ["Task 1", "Task 2", "两项完全相同", "只看字数"],
        correctIndex: 1, explanation: "官方说明中，Task 2 对写作成绩的贡献是 Task 1 的两倍。",
      },
      {
        id: "w1-q5", skill: "口语", prompt: "雅思口语考试分为几个部分？",
        options: ["2个", "3个", "4个", "5个"],
        correctIndex: 1, explanation: "口语包含 Part 1、Part 2 和 Part 3，共三个部分。",
      },
    ],
  },
  {
    week: 2,
    estimatedMinutes: 10,
    briefingTitle: "先搭稳句子，再追求复杂",
    briefing: [
      "一个完整英语句子至少需要清楚的主语和谓语。",
      "基础阶段先保证时态与主谓一致，再增加修饰成分。",
      "正确、清楚的简单句，比错误的复杂句更有效。",
    ],
    questions: [
      {
        id: "w2-q1", skill: "语法", prompt: "选择结构完整、表达正确的句子。",
        options: ["Many students studying abroad.", "Many students study abroad.", "Many students abroad study because.", "Study abroad many students."],
        correctIndex: 1, explanation: "“Many students”是主语，“study”是谓语，句子结构完整。",
      },
      {
        id: "w2-q2", skill: "语法", prompt: "补全句子：The number of online learners ___ every year.",
        options: ["increase", "increases", "increasing", "have increase"],
        correctIndex: 1, explanation: "主语中心词是单数 number，因此一般现在时使用 increases。",
      },
      {
        id: "w2-q3", skill: "语法", prompt: "昨天发生的事情，哪一句时态正确？",
        options: ["I attend the class yesterday.", "I attended the class yesterday.", "I attending the class yesterday.", "I have attend yesterday."],
        correctIndex: 1, explanation: "yesterday 表示明确的过去时间，使用一般过去时 attended。",
      },
      {
        id: "w2-q4", skill: "写作", prompt: "哪一句最清楚地表达因果关系？",
        options: ["Public transport is useful, people drive less.", "Because public transport is useful.", "People may drive less because public transport is convenient.", "Public transport convenient and less driving because."],
        correctIndex: 2, explanation: "主句完整，并用 because 清楚连接原因。",
      },
      {
        id: "w2-q5", skill: "口语", prompt: "口语基础阶段，哪种回答更容易继续展开？",
        options: ["Yes.", "No.", "Yes, because it saves me time on weekdays.", "Maybe good."],
        correctIndex: 2, explanation: "给出直接回答后补充原因，能形成自然、可继续发展的答案。",
      },
    ],
  },
  {
    week: 3,
    estimatedMinutes: 9,
    briefingTitle: "复习不是重做，而是找出错误原因",
    briefing: [
      "先判断错误来自知识、定位、理解还是粗心。",
      "同类错误连续出现时，需要降低速度并回到基础规则。",
      "本关混合检查前两周内容，答错后认真看解释。",
    ],
    questions: [
      {
        id: "w3-q1", skill: "听力", prompt: "听力题号已经进入第6题，但你还在等待第4题答案，最合适的做法是？",
        options: ["继续死等第4题", "立即跟上当前题，避免连续漏题", "停止答题", "从头播放录音"],
        correctIndex: 1, explanation: "听力信息通常按题目顺序出现。确认错过后应及时跟上，避免连续失分。",
      },
      {
        id: "w3-q2", skill: "语法", prompt: "选择正确句子。",
        options: ["The graph show a rise.", "The graph shows a rise.", "The graph showing a rise.", "The graph are show a rise."],
        correctIndex: 1, explanation: "主语 The graph 是单数，一般现在时谓语用 shows。",
      },
      {
        id: "w3-q3", skill: "写作", prompt: "写作时间有限时，应该优先保证什么？",
        options: ["使用最长的单词", "每句都写得很复杂", "回应题目并保持结构清楚", "尽可能多写"],
        correctIndex: 2, explanation: "是否回应任务、结构是否清楚，是有效表达的基础；复杂不等于准确。",
      },
      {
        id: "w3-q4", skill: "规则", prompt: "学术类和培训类不同的部分是？",
        options: ["听力与口语", "阅读与写作", "听力与阅读", "四项都完全不同"],
        correctIndex: 1, explanation: "阅读与写作会因考试类型不同而变化。",
      },
      {
        id: "w3-q5", skill: "口语", prompt: "回答“Do you like your hometown?”时，哪一种更完整？",
        options: ["Yes.", "Hometown.", "Yes, I do. It is quiet, and my family lives there.", "I liking it."],
        correctIndex: 2, explanation: "直接回答、给出特点并补充个人原因，形成了清楚的展开。",
      },
    ],
  },
  {
    week: 4,
    estimatedMinutes: 12,
    briefingTitle: "启航岛 Boss：基础生存检查",
    briefing: [
      "Boss关混合考查考试规则、句子结构和基础策略。",
      "达到60分即可过关，80分以上获得两星，满分获得三星。",
      "没有通过也不会失去进度，可以查看解释后再次挑战。",
    ],
    questions: [
      {
        id: "w4-q1", skill: "规则", prompt: "雅思总分包含几个单项？",
        options: ["2个", "3个", "4个", "5个"],
        correctIndex: 2, explanation: "听力、阅读、写作、口语，共四个单项。",
      },
      {
        id: "w4-q2", skill: "语法", prompt: "选择正确句子。",
        options: ["Technology help students.", "Technology helps students.", "Technology helping students.", "Technology are help students."],
        correctIndex: 1, explanation: "Technology 是单数主语，一般现在时使用 helps。",
      },
      {
        id: "w4-q3", skill: "听力", prompt: "听力中漏掉一道题后，优先策略是？",
        options: ["一直回想漏题", "跟上当前录音位置", "放弃剩余题目", "随意填写所有答案"],
        correctIndex: 1, explanation: "及时跟上当前位置可以避免一次失误扩大成连续失分。",
      },
      {
        id: "w4-q4", skill: "写作", prompt: "哪一句包含完整的观点和原因？",
        options: ["I agree.", "Because education is important.", "I agree because public education benefits the whole community.", "Education important community."],
        correctIndex: 2, explanation: "句子先表达立场，再用 because 给出清楚理由。",
      },
      {
        id: "w4-q5", skill: "规则", prompt: "写作 Task 2 与 Task 1 的成绩权重关系是？",
        options: ["Task 1更高", "Task 2约为Task 1的两倍", "完全相同", "只计算Task 2"],
        correctIndex: 1, explanation: "官方考试格式说明 Task 2 对写作成绩的贡献是 Task 1 的两倍。",
      },
    ],
  },
];

export function getLevelLesson(week: number) {
  return lessons.find((lesson) => lesson.week === week) ?? null;
}

export const playableWeeks = new Set(lessons.map((lesson) => lesson.week));
