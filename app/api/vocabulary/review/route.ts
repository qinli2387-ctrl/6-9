import { and, count, eq, sql } from "drizzle-orm";
import type { Grade } from "ts-fsrs";
import { getDb } from "@/db";
import { dailyTasks, vocabCards } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { completeDailyTask } from "@/lib/task-completion";
import { scheduleVocabularyCard, VocabularyReviewConflictError } from "@/lib/vocabulary-scheduler";

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
  const reviewedAt = new Date();
  const [saved] = await db.select().from(vocabCards)
    .where(and(
      eq(vocabCards.id, payload.cardId!),
      eq(vocabCards.userId, user.userId),
      sql`datetime(${vocabCards.dueAt}) <= datetime(${reviewedAt.toISOString()})`,
    )).limit(1);
  if (!saved) return Response.json({ error: "词卡不存在、未到期或状态已更新" }, { status: 409 });

  let dueAt: string;
  try {
    ({ dueAt } = await scheduleVocabularyCard(
      db,
      user.userId,
      saved,
      payload.rating as Grade,
      reviewedAt,
      { recordStudyEvent: true },
    ));
  } catch (error) {
    if (error instanceof VocabularyReviewConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }

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
      await completeDailyTask(db, user.userId, task.id, reviewedAt.toISOString(), { recordStudyEvent: false });
    }
  }

  return Response.json({ ok: true, dueAt, remainingDue: remaining.value });
}
