import { getErrorCategoryLabel, isErrorCategoryForSkill } from "./error-taxonomy.ts";
import type { LevelLesson, LessonQuestion } from "@/lib/level-lessons";

export type ReviewErrorRecord = {
  id: number;
  skill: string;
  category: string;
  prompt: string;
  context: string;
  optionsJson: string;
  correctIndex: number;
  explanation: string;
};

export type ReviewVocabularyCard = {
  id: number;
  word: string;
  meaning: string;
  example: string;
};

export type ReviewSource =
  | { kind: "error"; error: ReviewErrorRecord }
  | { kind: "vocabulary"; card: ReviewVocabularyCard };

const fallbackMeanings = ["显著的；重要的", "因素", "证据；依据", "替代方案；可供选择的"];

export function reviewSourceId(source: ReviewSource) {
  return source.kind === "error" ? `error:${source.error.id}` : `vocab:${source.card.id}`;
}

export function selectReviewSources(errors: ReviewErrorRecord[], cards: ReviewVocabularyCard[], limit = 5) {
  const errorLimit = cards.length > 0 ? Math.min(3, limit) : limit;
  const selected: ReviewSource[] = errors.slice(0, errorLimit).map((error) => ({ kind: "error", error }));
  selected.push(...cards.slice(0, limit - selected.length).map((card) => ({ kind: "vocabulary", card } as const)));
  if (selected.length < limit) {
    selected.push(...errors.slice(errorLimit, errorLimit + limit - selected.length).map((error) => ({ kind: "error", error } as const)));
  }
  return selected;
}

function errorQuestion(error: ReviewErrorRecord): LessonQuestion {
  const options = JSON.parse(error.optionsJson) as unknown;
  if (!Array.isArray(options) || options.length < 2 || options.some((option) => typeof option !== "string")) {
    throw new Error(`错题 ${error.id} 的选项数据无效`);
  }
  if (!Number.isInteger(error.correctIndex) || error.correctIndex < 0 || error.correctIndex >= options.length) {
    throw new Error(`错题 ${error.id} 的答案数据无效`);
  }
  if (!isErrorCategoryForSkill(error.skill, error.category)) {
    throw new Error(`错题 ${error.id} 的错因分类无效`);
  }
  const skill = error.skill === "reading" ? "阅读" : "听力";
  const label = getErrorCategoryLabel(error.skill, error.category);
  return {
    id: `error:${error.id}`,
    skill,
    prompt: error.prompt,
    context: error.context || undefined,
    options,
    correctIndex: error.correctIndex,
    explanation: `错因：${label}。${error.explanation}`,
  };
}

function vocabularyQuestion(card: ReviewVocabularyCard, pool: ReviewVocabularyCard[]): LessonQuestion {
  const candidates = [card.meaning, ...pool.filter((item) => item.id !== card.id).map((item) => item.meaning), ...fallbackMeanings];
  const unique = [...new Set(candidates)].slice(0, 4);
  const shift = Math.abs(card.id) % unique.length;
  const options = [...unique.slice(shift), ...unique.slice(0, shift)];
  return {
    id: `vocab:${card.id}`,
    skill: "阅读",
    prompt: `“${card.word}”最合适的中文意思是？`,
    context: card.example || undefined,
    options,
    correctIndex: options.indexOf(card.meaning),
    explanation: `${card.word}：${card.meaning}。${card.example}`,
  };
}

export function buildReviewLesson(sources: ReviewSource[], vocabularyPool: ReviewVocabularyCard[]): LevelLesson {
  if (sources.length === 0) throw new Error("当前没有到期复习内容");
  const errorCount = sources.filter((source) => source.kind === "error").length;
  const vocabCount = sources.length - errorCount;
  return {
    week: 3,
    estimatedMinutes: Math.max(5, sources.length * 2),
    briefingTitle: "只复习当前真正到期的内容",
    briefing: [
      `${errorCount} 道听读错题，${vocabCount} 个 FSRS 到期词汇。`,
      "错题会标出具体错因；答对后从当前错题队列移除。",
      "词汇答对按“记得”更新，答错按“忘记”进入下一次调度。",
    ],
    questions: sources.map((source) => source.kind === "error" ? errorQuestion(source.error) : vocabularyQuestion(source.card, vocabularyPool)),
  };
}
