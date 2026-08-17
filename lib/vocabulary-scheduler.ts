import { fsrs, type Grade } from "ts-fsrs";
import { getDb } from "@/db";
import { vocabCards } from "@/db/schema";
import { toFsrsCard } from "@/lib/vocabulary";

const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: true });

export class VocabularyReviewConflictError extends Error {}

export async function scheduleVocabularyCard(
  db: ReturnType<typeof getDb>,
  userId: string,
  saved: typeof vocabCards.$inferSelect,
  rating: Grade,
  reviewedAt: Date,
  options: { recordStudyEvent?: boolean } = {},
) {
  const result = scheduler.next(toFsrsCard(saved), reviewedAt, rating);
  const dueAt = result.card.due.toISOString();
  const versionValues = [saved.id, userId, saved.reps, saved.lastReviewAt] as const;
  const statements: D1PreparedStatement[] = [
    db.$client.prepare(`
      INSERT INTO vocab_reviews (
        user_id, card_id, rating, state, due_at, stability, difficulty,
        elapsed_days, last_elapsed_days, scheduled_days, learning_steps, reviewed_at
      )
      SELECT ?, id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      FROM vocab_cards
      WHERE id = ? AND user_id = ? AND reps = ? AND last_review_at IS ?
    `).bind(
      userId,
      result.log.rating,
      result.log.state,
      result.log.due.toISOString(),
      result.log.stability,
      result.log.difficulty,
      result.log.elapsed_days,
      result.log.last_elapsed_days,
      result.log.scheduled_days,
      result.log.learning_steps,
      result.log.review.toISOString(),
      ...versionValues,
    ),
  ];

  if (options.recordStudyEvent) {
    statements.push(db.$client.prepare(`
      INSERT INTO study_events (user_id, activity_type, source_id, duration_minutes, score)
      SELECT user_id, 'vocabulary_review', id, 0, ?
      FROM vocab_cards
      WHERE id = ? AND user_id = ? AND reps = ? AND last_review_at IS ?
    `).bind(rating, ...versionValues));
  }

  statements.push(db.$client.prepare(`
    UPDATE vocab_cards
    SET due_at = ?, stability = ?, difficulty = ?, elapsed_days = ?,
        scheduled_days = ?, learning_steps = ?, state = ?, reps = ?, lapses = ?,
        last_review_at = ?
    WHERE id = ? AND user_id = ? AND reps = ? AND last_review_at IS ?
  `).bind(
    dueAt,
    result.card.stability,
    result.card.difficulty,
    result.card.elapsed_days,
    result.card.scheduled_days,
    result.card.learning_steps,
    result.card.state,
    result.card.reps,
    result.card.lapses,
    result.card.last_review?.toISOString() ?? reviewedAt.toISOString(),
    ...versionValues,
  ));

  const batch = await db.$client.batch(statements);
  if ((batch.at(-1)?.meta.changes ?? 0) !== 1) {
    throw new VocabularyReviewConflictError("词卡状态已更新，请刷新后重试");
  }

  return { dueAt, rating: result.log.rating };
}
