import type { getDb } from "@/db";

type Database = ReturnType<typeof getDb>;

export async function completeDailyTask(
  db: Database,
  userId: string,
  taskId: number,
  completedAt: string,
  options: { recordStudyEvent?: boolean } = {},
) {
  const statements: D1PreparedStatement[] = [
    db.$client.prepare(`
      UPDATE learner_profiles
      SET total_xp = total_xp + 10, updated_at = ?
      WHERE user_id = ?
        AND EXISTS (
          SELECT 1 FROM daily_tasks
          WHERE id = ? AND user_id = ? AND status <> 'done' AND xp_awarded = 0
        )
    `).bind(completedAt, userId, taskId, userId),
  ];

  if (options.recordStudyEvent !== false) {
    statements.push(db.$client.prepare(`
      INSERT INTO study_events (user_id, activity_type, source_id, duration_minutes)
      SELECT user_id, skill, id, minutes
      FROM daily_tasks
      WHERE id = ? AND user_id = ? AND status <> 'done'
    `).bind(taskId, userId));
  }

  statements.push(db.$client.prepare(`
    UPDATE daily_tasks
    SET status = 'done', completed_at = ?, xp_awarded = 1
    WHERE id = ? AND user_id = ? AND status <> 'done'
  `).bind(completedAt, taskId, userId));

  const results = await db.$client.batch(statements);
  const completed = (results.at(-1)?.meta.changes ?? 0) === 1;
  const xpEarned = (results[0]?.meta.changes ?? 0) === 1 ? 10 : 0;
  return { completed, xpEarned };
}
