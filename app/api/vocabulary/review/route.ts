import { and, count, eq, sql } from "drizzle-orm";
import type { Grade } from "ts-fsrs";
import { getDb } from "@/db";
import { dailyTasks, learnerProfiles, studyEvents, vocabCards } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { scheduleVocabularyCard } from "@/lib/vocabulary-scheduler";

type ReviewPayload = { cardId?: number; rating?: number };

function dateInShanghai() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });

  const payload = await request.json().catch(() => ({})) as ReviewPayload;
  if (!Number.isInteger(payload.cardId) || ![1, 2, 3, 4].includes(payload.rating ?? 0)) {
    return Response.json({ error: "复习记录无效" }, { status: 400 });
  }

  const db = getDb();
  const [saved] = await db.select().from(vocabCards)
    .where(and(eq(vocabCards.id, payload.cardId!), eq(vocabCards.userId, user.userId))).limit(1);
  if (!saved) return Response.json({ error: "词卡不存在" }, { status: 404 });

  const reviewedAt = new Date();
  const { dueAt } = await scheduleVocabularyCard(db, user.userId, saved, payload.rating as Grade, reviewedAt);

  await db.insert(studyEvents).values({
    userId: user.userId,
    activityType: "vocabulary_review",
    sourceId: saved.id,
    durationMinutes: 0,
    score: payload.rating,
  });

  const [remaining] = await db.select({ value: count() }).from(vocabCards).where(and(
    eq(vocabCards.userId, user.userId),
    sql`datetime(${vocabCards.dueAt}) <= datetime(${reviewedAt.toISOString()})`,
  ));

  if (remaining.value === 0) {
    const today = dateInShanghai();
    const [task] = await db.select().from(dailyTasks).where(and(
      eq(dailyTasks.userId, user.userId),
      eq(dailyTasks.taskDate, today),
      eq(dailyTasks.skill, "vocabulary"),
    )).limit(1);
    if (task && task.status !== "done") {
      await db.update(dailyTasks).set({
        status: "done",
        completedAt: reviewedAt.toISOString(),
        xpAwarded: true,
      }).where(and(eq(dailyTasks.id, task.id), eq(dailyTasks.userId, user.userId)));
      if (!task.xpAwarded) {
        await db.update(learnerProfiles).set({
          totalXp: sql`${learnerProfiles.totalXp} + 10`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        }).where(eq(learnerProfiles.userId, user.userId));
      }
    }
  }

  return Response.json({ ok: true, dueAt, remainingDue: remaining.value });
}
