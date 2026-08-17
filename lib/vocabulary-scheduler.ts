import { and, eq } from "drizzle-orm";
import { fsrs, type Grade } from "ts-fsrs";
import { getDb } from "@/db";
import { vocabCards, vocabReviews } from "@/db/schema";
import { toFsrsCard } from "@/lib/vocabulary";

const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: true });

export async function scheduleVocabularyCard(
  db: ReturnType<typeof getDb>,
  userId: string,
  saved: typeof vocabCards.$inferSelect,
  rating: Grade,
  reviewedAt: Date,
) {
  const result = scheduler.next(toFsrsCard(saved), reviewedAt, rating);
  const dueAt = result.card.due.toISOString();

  await db.update(vocabCards).set({
    dueAt,
    stability: result.card.stability,
    difficulty: result.card.difficulty,
    elapsedDays: result.card.elapsed_days,
    scheduledDays: result.card.scheduled_days,
    learningSteps: result.card.learning_steps,
    state: result.card.state,
    reps: result.card.reps,
    lapses: result.card.lapses,
    lastReviewAt: result.card.last_review?.toISOString() ?? reviewedAt.toISOString(),
  }).where(and(eq(vocabCards.id, saved.id), eq(vocabCards.userId, userId)));

  await db.insert(vocabReviews).values({
    userId,
    cardId: saved.id,
    rating: result.log.rating,
    state: result.log.state,
    dueAt: result.log.due.toISOString(),
    stability: result.log.stability,
    difficulty: result.log.difficulty,
    elapsedDays: result.log.elapsed_days,
    lastElapsedDays: result.log.last_elapsed_days,
    scheduledDays: result.log.scheduled_days,
    learningSteps: result.log.learning_steps,
    reviewedAt: result.log.review.toISOString(),
  });

  return { dueAt, rating: result.log.rating };
}
