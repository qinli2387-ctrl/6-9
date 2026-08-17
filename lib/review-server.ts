import { and, asc, eq, sql } from "drizzle-orm";
import type { Grade } from "ts-fsrs";
import { getDb } from "@/db";
import { learningErrors, vocabCards } from "@/db/schema";
import { ensureStarterVocabulary } from "@/lib/vocabulary";
import { scheduleVocabularyCard, VocabularyReviewConflictError } from "@/lib/vocabulary-scheduler";
import { getLevelLesson } from "@/lib/level-lessons";
import {
  buildReviewLesson,
  reviewSourceId,
  selectReviewSources,
  type ReviewSource,
  type ReviewVocabularyCard,
} from "@/lib/review-lesson";

export class ReviewValidationError extends Error {}

function parseSourceId(value: string) {
  const match = /^(error|vocab):(\d+)$/.exec(value);
  if (!match) throw new ReviewValidationError("复习题目标识无效");
  return { kind: match[1] as "error" | "vocab", id: Number(match[2]) };
}

async function vocabularyPool(userId: string) {
  const db = getDb();
  return db.select({
    id: vocabCards.id,
    word: vocabCards.word,
    meaning: vocabCards.meaning,
    example: vocabCards.example,
  }).from(vocabCards).where(eq(vocabCards.userId, userId)).orderBy(asc(vocabCards.id)).limit(50);
}

export async function loadReviewLessonForUser(userId: string, requestedIds?: string[]) {
  const db = getDb();
  const now = new Date().toISOString();
  await ensureStarterVocabulary(userId);
  const pool = await vocabularyPool(userId);
  let sources: ReviewSource[];

  if (requestedIds) {
    if (requestedIds.length < 1 || requestedIds.length > 5 || new Set(requestedIds).size !== requestedIds.length) {
      throw new ReviewValidationError("复习题目数量无效");
    }
    sources = [];
    for (const requestedId of requestedIds) {
      const parsed = parseSourceId(requestedId);
      if (parsed.kind === "error") {
        const [error] = await db.select().from(learningErrors).where(and(
          eq(learningErrors.id, parsed.id),
          eq(learningErrors.userId, userId),
          eq(learningErrors.status, "open"),
          sql`datetime(${learningErrors.dueAt}) <= datetime(${now})`,
        )).limit(1);
        if (!error) throw new ReviewValidationError("错题已完成或不属于当前账号");
        sources.push({ kind: "error", error });
      } else {
        const [card] = await db.select().from(vocabCards).where(and(
          eq(vocabCards.id, parsed.id),
          eq(vocabCards.userId, userId),
          sql`datetime(${vocabCards.dueAt}) <= datetime(${now})`,
        )).limit(1);
        if (!card) throw new ReviewValidationError("词卡未到期或不属于当前账号");
        sources.push({ kind: "vocabulary", card });
      }
    }
  } else {
    const errors = await db.select().from(learningErrors).where(and(
      eq(learningErrors.userId, userId),
      eq(learningErrors.status, "open"),
      sql`datetime(${learningErrors.dueAt}) <= datetime(${now})`,
    )).orderBy(asc(learningErrors.dueAt), asc(learningErrors.id)).limit(5);
    const dueCards: ReviewVocabularyCard[] = await db.select({
      id: vocabCards.id,
      word: vocabCards.word,
      meaning: vocabCards.meaning,
      example: vocabCards.example,
    }).from(vocabCards).where(and(
      eq(vocabCards.userId, userId),
      sql`datetime(${vocabCards.dueAt}) <= datetime(${now})`,
    )).orderBy(asc(vocabCards.dueAt), asc(vocabCards.id)).limit(5);
    sources = selectReviewSources(errors, dueCards);
  }

  if (sources.length === 0) {
    const fallback = getLevelLesson(3);
    if (!fallback) throw new Error("基础复习关不存在");
    return { lesson: fallback, sources, personalized: false };
  }

  const lesson = buildReviewLesson(sources, pool);
  if (lesson.questions.some((question, index) => question.id !== reviewSourceId(sources[index]))) {
    throw new Error("复习题目顺序校验失败");
  }
  return { lesson, sources, personalized: true };
}

export async function applyReviewAnswers(userId: string, sources: ReviewSource[], answers: number[]) {
  const db = getDb();
  const reviewedAt = new Date();
  const now = reviewedAt.toISOString();
  const pool = await vocabularyPool(userId);

  for (const [index, source] of sources.entries()) {
    const correctIndex = source.kind === "error"
      ? source.error.correctIndex
      : buildReviewLesson([source], pool).questions[0].correctIndex;
    const correct = answers[index] === correctIndex;

    if (source.kind === "error") {
      await db.update(learningErrors).set(correct ? {
        status: "resolved",
        resolvedAt: now,
        updatedAt: now,
      } : {
        status: "open",
        selectedIndex: answers[index],
        occurrenceCount: sql`${learningErrors.occurrenceCount} + 1`,
        dueAt: now,
        lastWrongAt: now,
        resolvedAt: null,
        updatedAt: now,
      }).where(and(eq(learningErrors.id, source.error.id), eq(learningErrors.userId, userId)));
    } else {
      const [saved] = await db.select().from(vocabCards).where(and(
        eq(vocabCards.id, source.card.id),
        eq(vocabCards.userId, userId),
      )).limit(1);
      if (!saved) throw new ReviewValidationError("词卡不存在");
      try {
        await scheduleVocabularyCard(db, userId, saved, (correct ? 3 : 1) as Grade, reviewedAt);
      } catch (error) {
        if (error instanceof VocabularyReviewConflictError) {
          throw new ReviewValidationError(error.message);
        }
        throw error;
      }
    }
  }
}
