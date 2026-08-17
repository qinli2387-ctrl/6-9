import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { learnerProfiles, lessonAttempts } from "@/db/schema";
import { getLevelLesson } from "@/lib/level-lessons";
import { loadReviewLessonForUser } from "@/lib/review-server";
import { getChatGPTUser } from "@/app/chatgpt-auth";

type AttemptPayload = {
  action?: "start" | "save";
  week?: number;
  attemptId?: number;
  version?: number;
  questionIndex?: number;
  answers?: number[];
  questionIds?: string[];
};

function parseAnswers(value: string): number[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) && parsed.every((item) => Number.isInteger(item)) ? parsed as number[] : [];
  } catch {
    return [];
  }
}

function parseQuestionIds(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : [];
  } catch {
    return [];
  }
}

function hasSameQuestionIds(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function responseFor(attempt: typeof lessonAttempts.$inferSelect) {
  return {
    ok: true,
    attempt: {
      id: attempt.id,
      week: Number(attempt.levelKey.replace("week-", "")),
      questionIndex: attempt.questionIndex,
      answers: parseAnswers(attempt.answersJson),
      questionIds: parseQuestionIds(attempt.questionIdsJson),
      version: attempt.version,
      status: attempt.status,
      updatedAt: attempt.updatedAt,
    },
  };
}

async function getContext(payload: AttemptPayload) {
  const week = payload.week;
  if (!Number.isInteger(week) || week! < 1 || week! > 24) {
    return { error: Response.json({ error: "关卡无效" }, { status: 400 }) };
  }
  const user = await getChatGPTUser();
  if (!user) return { error: Response.json({ error: "请先登录" }, { status: 401 }) };
  const lesson = week === 3 ? (await loadReviewLessonForUser(user.userId)).lesson : getLevelLesson(week!);
  if (!lesson) return { error: Response.json({ error: "这一关还未开放" }, { status: 404 }) };
  const db = getDb();
  const [profile] = await db.select().from(learnerProfiles)
    .where(eq(learnerProfiles.userId, user.userId)).limit(1);
  if (!profile?.onboardingCompleted) return { error: Response.json({ error: "请先完成目标设置" }, { status: 409 }) };
  if (week! > profile.currentWeek) return { error: Response.json({ error: "请先通过前面的关卡" }, { status: 403 }) };
  return { week: week!, user, db, lesson };
}

export async function POST(request: Request) {
  let payload: AttemptPayload;
  try {
    payload = await request.json() as AttemptPayload;
  } catch {
    return Response.json({ error: "提交内容无效" }, { status: 400 });
  }
  if (payload.action !== "start") return Response.json({ error: "会话操作无效" }, { status: 400 });
  const context = await getContext(payload);
  if ("error" in context) return context.error;
  const { db, user, week } = context;
  const expectedQuestionIds = context.lesson.questions.map((question) => question.id);
  if (!Array.isArray(payload.questionIds) || !hasSameQuestionIds(payload.questionIds, expectedQuestionIds)) {
    return Response.json({ error: "关卡内容已经更新，请刷新后重试" }, { status: 409 });
  }
  const levelKey = `week-${week}`;
  const [existing] = await db.select().from(lessonAttempts)
    .where(and(eq(lessonAttempts.userId, user.userId), eq(lessonAttempts.levelKey, levelKey))).limit(1);
  const now = new Date().toISOString();

  if (existing?.status === "active" && hasSameQuestionIds(parseQuestionIds(existing.questionIdsJson), expectedQuestionIds)) {
    return Response.json(responseFor(existing));
  }

  if (existing) {
    await db.update(lessonAttempts).set({
      status: "active",
      questionIndex: 0,
      answersJson: "[]",
      questionIdsJson: JSON.stringify(expectedQuestionIds),
      version: sql`${lessonAttempts.version} + 1`,
      startedAt: now,
      updatedAt: now,
      completedAt: null,
    }).where(and(eq(lessonAttempts.id, existing.id), eq(lessonAttempts.userId, user.userId)));
  } else {
    await db.insert(lessonAttempts).values({
      userId: user.userId,
      levelKey,
      status: "active",
      questionIndex: 0,
      answersJson: "[]",
      questionIdsJson: JSON.stringify(expectedQuestionIds),
      version: 1,
      startedAt: now,
      updatedAt: now,
    }).onConflictDoNothing({ target: [lessonAttempts.userId, lessonAttempts.levelKey] });
  }
  const [attempt] = await db.select().from(lessonAttempts)
    .where(and(eq(lessonAttempts.userId, user.userId), eq(lessonAttempts.levelKey, levelKey))).limit(1);
  return Response.json(responseFor(attempt));
}

export async function PATCH(request: Request) {
  let payload: AttemptPayload;
  try {
    payload = await request.json() as AttemptPayload;
  } catch {
    return Response.json({ error: "提交内容无效" }, { status: 400 });
  }
  if (payload.action !== "save") return Response.json({ error: "会话操作无效" }, { status: 400 });
  const context = await getContext(payload);
  if ("error" in context) return context.error;
  const { db, user, week, lesson } = context;
  const expectedQuestionIds = lesson.questions.map((question) => question.id);
  if (!Array.isArray(payload.questionIds) || !hasSameQuestionIds(payload.questionIds, expectedQuestionIds)) {
    return Response.json({ error: "关卡内容已经更新，请刷新后重试" }, { status: 409 });
  }
  if (!Number.isInteger(payload.attemptId) || !Number.isInteger(payload.version)) {
    return Response.json({ error: "会话版本无效" }, { status: 400 });
  }
  const questionIndex = payload.questionIndex;
  const answers = payload.answers;
  if (!Number.isInteger(questionIndex) || questionIndex! < 0 || questionIndex! >= lesson.questions.length) {
    return Response.json({ error: "题目位置无效" }, { status: 400 });
  }
  if (!Array.isArray(answers) || answers.length !== questionIndex || answers.some((answer, index) => !Number.isInteger(answer) || answer < 0 || answer >= lesson.questions[index].options.length)) {
    return Response.json({ error: "答案进度无效" }, { status: 400 });
  }
  const levelKey = `week-${week}`;
  const now = new Date().toISOString();
  const changed = await db.update(lessonAttempts).set({
    questionIndex: questionIndex!,
    answersJson: JSON.stringify(answers),
    version: sql`${lessonAttempts.version} + 1`,
    updatedAt: now,
  }).where(and(
    eq(lessonAttempts.id, payload.attemptId!),
    eq(lessonAttempts.userId, user.userId),
    eq(lessonAttempts.levelKey, levelKey),
    eq(lessonAttempts.status, "active"),
    eq(lessonAttempts.questionIdsJson, JSON.stringify(expectedQuestionIds)),
    eq(lessonAttempts.version, payload.version!),
  )).returning();
  if (changed.length === 0) {
    const [latest] = await db.select().from(lessonAttempts)
      .where(and(eq(lessonAttempts.id, payload.attemptId!), eq(lessonAttempts.userId, user.userId))).limit(1);
    return Response.json({ error: "学习进度已在其他设备更新，请刷新后继续", latest: latest ? responseFor(latest).attempt : null }, { status: 409 });
  }
  return Response.json(responseFor(changed[0]));
}
