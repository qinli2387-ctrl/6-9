export type SkillKey = "listening" | "reading" | "writing" | "speaking";

export type SpeakingRatings = Record<"fluency" | "vocabulary" | "grammar" | "pronunciation", number>;

export type PlacementSubmission = {
  listeningAnswers?: number[];
  readingAnswers?: number[];
  writingResponse?: string;
  speakingSeconds?: number;
  speakingRatings?: Partial<SpeakingRatings>;
  durationSeconds?: number;
};

export type SkillResult = {
  score: number;
  band: number;
  weight: number;
};

export type PlacementResult = {
  overallBand: number;
  skills: Record<SkillKey, SkillResult>;
};

export class PlacementValidationError extends Error {}

const objectiveKeys = {
  listening: [1, 2, 0],
  reading: [0, 2, 1],
} as const;

const skillOrder: SkillKey[] = ["listening", "reading", "writing", "speaking"];

function bandFromScore(score: number) {
  if (score >= 90) return 6;
  if (score >= 75) return 5.5;
  if (score >= 60) return 5;
  if (score >= 45) return 4.5;
  if (score >= 30) return 4;
  return 3.5;
}

function validateObjectiveAnswers(value: unknown, key: readonly number[], label: string) {
  if (!Array.isArray(value) || value.length !== key.length) {
    throw new PlacementValidationError(`请完成全部${label}题目`);
  }
  if (value.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3)) {
    throw new PlacementValidationError(`${label}答案格式无效`);
  }
  return value as number[];
}

function scoreObjective(answers: number[], key: readonly number[]) {
  const correct = answers.reduce((total, answer, index) => total + (answer === key[index] ? 1 : 0), 0);
  return Math.round((correct / key.length) * 100);
}

export function scoreWriting(value: string) {
  const response = value.trim();
  const words = response.toLowerCase().match(/[a-z]+(?:['’-][a-z]+)*/g) ?? [];
  if (words.length < 20) throw new PlacementValidationError("写作回答至少需要 20 个英文单词");
  if (response.length > 2000) throw new PlacementValidationError("写作回答过长，请控制在 120 词左右");

  const wordCount = words.length;
  const uniqueRatio = new Set(words).size / wordCount;
  const sentenceCount = response.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0).length;
  const paragraphCount = response.split(/\n\s*\n/).filter((paragraph) => paragraph.trim().length > 0).length;
  const linkingTerms = ["because", "however", "therefore", "for example", "first", "also", "while", "although"];
  const relevantTerms = ["study", "learn", "group", "alone", "prefer", "focus", "idea", "share", "help", "time"];
  const lower = response.toLowerCase();
  const linkingCount = linkingTerms.filter((term) => lower.includes(term)).length;
  const relevantCount = relevantTerms.filter((term) => lower.includes(term)).length;

  const lengthPoints = wordCount >= 80 ? 30 : wordCount >= 60 ? 24 : wordCount >= 40 ? 16 : 8;
  const sentencePoints = sentenceCount >= 5 ? 15 : sentenceCount >= 3 ? 10 : sentenceCount >= 2 ? 5 : 0;
  const linkingPoints = linkingCount >= 3 ? 15 : linkingCount === 2 ? 10 : linkingCount === 1 ? 5 : 0;
  const diversityPoints = uniqueRatio >= 0.7 ? 15 : uniqueRatio >= 0.55 ? 10 : uniqueRatio >= 0.4 ? 5 : 0;
  const relevancePoints = relevantCount >= 4 ? 15 : relevantCount >= 2 ? 10 : relevantCount === 1 ? 5 : 0;
  const paragraphPoints = paragraphCount >= 2 ? 10 : 4;
  return Math.min(100, lengthPoints + sentencePoints + linkingPoints + diversityPoints + relevancePoints + paragraphPoints);
}

function scoreSpeaking(secondsValue: unknown, ratingsValue: PlacementSubmission["speakingRatings"]) {
  const seconds = typeof secondsValue === "number" && Number.isFinite(secondsValue) ? Math.round(secondsValue) : 0;
  if (seconds < 15) throw new PlacementValidationError("请先完成至少 15 秒的口头回答");
  if (!ratingsValue) throw new PlacementValidationError("请完成口语自评");

  const ratings = [ratingsValue.fluency, ratingsValue.vocabulary, ratingsValue.grammar, ratingsValue.pronunciation];
  if (ratings.some((rating) => !Number.isInteger(rating) || rating! < 1 || rating! > 4)) {
    throw new PlacementValidationError("请完成四项口语自评");
  }

  const selfScore = (((ratings as number[]).reduce((sum, rating) => sum + rating, 0) - 4) / 12) * 80;
  const durationScore = seconds >= 45 ? 20 : seconds >= 30 ? 15 : 8;
  return Math.round(selfScore + durationScore);
}

export function calculateTrainingWeights(bands: Record<SkillKey, number>) {
  const deficits = skillOrder.map((skill) => Math.max(0.75, 6.5 - bands[skill]));
  const total = deficits.reduce((sum, value) => sum + value, 0);
  const raw = deficits.map((value) => (value / total) * 100);
  const rounded = raw.map(Math.floor);
  const remainder = 100 - rounded.reduce((sum, value) => sum + value, 0);
  const priority = raw.map((value, index) => ({ index, fraction: value - rounded[index] }))
    .sort((left, right) => right.fraction - left.fraction || left.index - right.index);
  for (let index = 0; index < remainder; index += 1) rounded[priority[index].index] += 1;

  return Object.fromEntries(skillOrder.map((skill, index) => [skill, rounded[index]])) as Record<SkillKey, number>;
}

const taskTemplates: Record<SkillKey, { title: string; detail: string }> = {
  listening: { title: "听力定位训练", detail: "数字、日期与转折信号" },
  reading: { title: "阅读定位训练", detail: "关键词与同义替换" },
  writing: { title: "写作结构训练", detail: "观点、主题句与衔接" },
  speaking: { title: "口语展开训练", detail: "流利度、词汇与清晰表达" },
};

export function buildWeightedDailyTasks(dailyMinutes: number, weights: Record<SkillKey, number>) {
  const priorities = skillOrder.map((skill, index) => ({ skill, weight: weights[skill], index }))
    .sort((left, right) => right.weight - left.weight || left.index - right.index)
    .slice(0, 2);
  const vocabularyMinutes = dailyMinutes <= 30 ? 8 : dailyMinutes <= 45 ? 10 : 15;
  const skillMinutes = Math.max(20, dailyMinutes - vocabularyMinutes);
  const priorityTotal = priorities[0].weight + priorities[1].weight;
  let firstMinutes = Math.round(skillMinutes * (priorities[0].weight / priorityTotal));
  firstMinutes = Math.min(skillMinutes - 10, Math.max(10, firstMinutes));
  const secondMinutes = skillMinutes - firstMinutes;

  return [
    { skill: priorities[0].skill, ...taskTemplates[priorities[0].skill], minutes: firstMinutes, position: 1 },
    { skill: "vocabulary", title: "到期词汇复习", detail: "按 FSRS 队列复习", minutes: vocabularyMinutes, position: 2 },
    { skill: priorities[1].skill, ...taskTemplates[priorities[1].skill], minutes: secondMinutes, position: 3 },
  ];
}

export function scorePlacement(payload: PlacementSubmission): PlacementResult {
  const listeningAnswers = validateObjectiveAnswers(payload.listeningAnswers, objectiveKeys.listening, "听力");
  const readingAnswers = validateObjectiveAnswers(payload.readingAnswers, objectiveKeys.reading, "阅读");
  const writingResponse = typeof payload.writingResponse === "string" ? payload.writingResponse : "";

  const scores: Record<SkillKey, number> = {
    listening: scoreObjective(listeningAnswers, objectiveKeys.listening),
    reading: scoreObjective(readingAnswers, objectiveKeys.reading),
    writing: scoreWriting(writingResponse),
    speaking: scoreSpeaking(payload.speakingSeconds, payload.speakingRatings),
  };
  const bands = Object.fromEntries(skillOrder.map((skill) => [skill, bandFromScore(scores[skill])])) as Record<SkillKey, number>;
  const weights = calculateTrainingWeights(bands);
  const overallBand = Math.round((skillOrder.reduce((sum, skill) => sum + bands[skill], 0) / 4) * 2) / 2;

  return {
    overallBand,
    skills: Object.fromEntries(skillOrder.map((skill) => [skill, {
      score: scores[skill],
      band: bands[skill],
      weight: weights[skill],
    }])) as Record<SkillKey, SkillResult>,
  };
}

export function resultFromBaseline(baseline: {
  overallBand: number;
  listeningScore: number; listeningBand: number; listeningWeight: number;
  readingScore: number; readingBand: number; readingWeight: number;
  writingScore: number; writingBand: number; writingWeight: number;
  speakingScore: number; speakingBand: number; speakingWeight: number;
}): PlacementResult {
  return {
    overallBand: baseline.overallBand,
    skills: {
      listening: { score: baseline.listeningScore, band: baseline.listeningBand, weight: baseline.listeningWeight },
      reading: { score: baseline.readingScore, band: baseline.readingBand, weight: baseline.readingWeight },
      writing: { score: baseline.writingScore, band: baseline.writingBand, weight: baseline.writingWeight },
      speaking: { score: baseline.speakingScore, band: baseline.speakingBand, weight: baseline.speakingWeight },
    },
  };
}
