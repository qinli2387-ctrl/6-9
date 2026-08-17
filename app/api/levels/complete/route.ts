import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { learnerProfiles, levelProgress, studyEvents } from "@/db/schema";
import { getLevelLesson } from "@/lib/level-lessons";
import { recordLearningErrors, type ObjectiveErrorQuestion } from "@/lib/learning-errors";
import { applyReviewAnswers, loadReviewLessonForUser, ReviewValidationError } from "@/lib/review-server";
import type { ReviewSource } from "@/lib/review-lesson";
import { getChatGPTUser } from "@/app/chatgpt-auth";

type CompletePayload = {
  week?: number;
  answers?: number[];
  durationSeconds?: number;
  reviewQuestionIds?: string[];
};

function isCompleted(status: string | undefined) {
  return status === "passed" || status === "mastered";
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });

  let payload: CompletePayload;
  try {
    payload = await request.json() as CompletePayload;
  } catch {
    return Response.json({ error: "提交内容无效" }, { status: 400 });
  }

  const week = payload.week;
  const staticLesson = Number.isInteger(week) ? getLevelLesson(week!) : null;
  if (!staticLesson || !Array.isArray(payload.answers)) {
    return Response.json({ error: "关卡或答案无效" }, { status: 400 });
  }

  const db = getDb();
  const [profile] = await db.select().from(learnerProfiles)
    .where(eq(learnerProfiles.userId, user.userId)).limit(1);
  if (!profile?.onboardingCompleted) {
    return Response.json({ error: "请先完成目标设置" }, { status: 409 });
  }
  if (week! > profile.currentWeek) {
    return Response.json({ error: "请先通过前面的关卡" }, { status: 403 });
  }

  let lesson = staticLesson;
  let reviewSources: ReviewSource[] | null = null;
  if (week === 3) {
    try {
      const review = Array.isArray(payload.reviewQuestionIds)
        ? await loadReviewLessonForUser(user.userId, payload.reviewQuestionIds)
        : await loadReviewLessonForUser(user.userId);
      if (!Array.isArray(payload.reviewQuestionIds) && review.personalized) {
        return Response.json({ error: "复习队列已经更新，请刷新后重试" }, { status: 409 });
      }
      lesson = review.lesson;
      reviewSources = review.personalized ? review.sources : null;
    } catch (reason) {
      if (reason instanceof ReviewValidationError) {
        return Response.json({ error: reason.message }, { status: 409 });
      }
      throw reason;
    }
  } else if (payload.reviewQuestionIds !== undefined) {
    return Response.json({ error: "当前关卡不接受复习题标识" }, { status: 400 });
  }

  if (payload.answers.length !== lesson.questions.length) {
    return Response.json({ error: "答案数量无效" }, { status: 400 });
  }
  if (payload.answers.some((answer, index) => !Number.isInteger(answer) || answer < 0 || answer >= lesson.questions[index].options.length)) {
    return Response.json({ error: "答案格式无效" }, { status: 400 });
  }

  const levelKey = `week-${week}`;
  const [existing] = await db.select().from(levelProgress)
    .where(and(eq(levelProgress.userId, user.userId), eq(levelProgress.levelKey, levelKey))).limit(1);
  const correct = lesson.questions.reduce((total, question, index) => total + (payload.answers![index] === question.correctIndex ? 1 : 0), 0);
  const score = Math.round((correct / lesson.questions.length) * 100);
  const passed = score >= 60;
  const attemptStars = score === 100 ? 3 : score >= 80 ? 2 : passed ? 1 : 0;
  const bestStars = Math.max(existing?.stars ?? 0, attemptStars);
  const bestScore = Math.max(existing?.bestScore ?? 0, score);
  const alreadyCompleted = isCompleted(existing?.status);
  const status = alreadyCompleted
    ? (existing?.status === "mastered" || bestStars === 3 ? "mastered" : "passed")
    : passed ? (attemptStars === 3 ? "mastered" : "passed") : "active";
  const now = new Date().toISOString();

  if (reviewSources) {
    await applyReviewAnswers(user.userId, reviewSources, payload.answers);
  } else {
    const trackable = lesson.questions.flatMap((question, index) => {
      const skill = question.skill === "听力" ? "listening" : question.skill === "阅读" ? "reading" : null;
      if (!skill || !question.errorCategory) return [];
      return [{
        question: {
          id: question.id,
          skill,
          category: question.errorCategory,
          prompt: question.prompt,
          context: question.context,
          options: question.options,
          correctIndex: question.correctIndex,
          explanation: question.explanation,
        } satisfies ObjectiveErrorQuestion,
        answer: payload.answers![index],
      }];
    });
    await recordLearningErrors({
      userId: user.userId,
      sourceType: "level",
      sourceKey: levelKey,
      questions: trackable.map((item) => item.question),
      answers: trackable.map((item) => item.answer),
    });
  }

  if (existing) {
    await db.update(levelProgress).set({
      status,
      stars: bestStars,
      bestScore,
      attempts: sql`${levelProgress.attempts} + 1`,
      completedAt: passed ? (existing.completedAt ?? now) : existing.completedAt,
      updatedAt: now,
    }).where(and(eq(levelProgress.id, existing.id), eq(levelProgress.userId, user.userId)));
  } else {
    await db.insert(levelProgress).values({
      userId: user.userId,
      levelKey,
      status,
      stars: bestStars,
      bestScore,
      attempts: 1,
      completedAt: passed ? now : null,
    });
  }

  const safeDuration = Math.min(7200, Math.max(0, Math.round(payload.durationSeconds ?? 0)));
  await db.insert(studyEvents).values({
    userId: user.userId,
    activityType: "level_attempt",
    sourceId: week,
    durationMinutes: Math.max(1, Math.ceil(safeDuration / 60)),
    score,
  });

  const firstPass = passed && !alreadyCompleted;
  const xpEarned = firstPass ? 20 + attemptStars * 10 + (week! % 4 === 0 ? 20 : 0) : 0;
  let nextWeek = profile.currentWeek;
  if (firstPass) {
    const advancesPlan = week === profile.currentWeek && week! < 24;
    nextWeek = advancesPlan ? week! + 1 : profile.currentWeek;
    await db.update(learnerProfiles).set({
      totalXp: sql`${learnerProfiles.totalXp} + ${xpEarned}`,
      currentWeek: nextWeek,
      updatedAt: now,
    }).where(eq(learnerProfiles.userId, user.userId));

    if (advancesPlan) {
      const nextLevelKey = `week-${nextWeek}`;
      const [savedNext] = await db.select().from(levelProgress)
        .where(and(eq(levelProgress.userId, user.userId), eq(levelProgress.levelKey, nextLevelKey))).limit(1);
      if (!savedNext) {
        await db.insert(levelProgress).values({ userId: user.userId, levelKey: nextLevelKey, status: "active" });
      } else if (savedNext.status === "locked") {
        await db.update(levelProgress).set({ status: "active", updatedAt: now })
          .where(and(eq(levelProgress.id, savedNext.id), eq(levelProgress.userId, user.userId)));
      }
    }
  }

  return Response.json({
    ok: true,
    passed,
    score,
    correct,
    total: lesson.questions.length,
    stars: attemptStars,
    bestStars,
    xpEarned,
    nextWeek,
  });
}
