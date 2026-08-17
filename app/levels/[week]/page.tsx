import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { learnerProfiles, lessonAttempts, levelProgress } from "@/db/schema";
import { getLevelLesson } from "@/lib/level-lessons";
import { loadReviewLessonForUser } from "@/lib/review-server";
import { planWorlds } from "@/lib/learning-plan";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { LevelSession } from "./LevelSession";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ week: string }> };

export default function LevelPage({ params }: PageProps) {
  return <LevelRoute params={params} />;
}

async function LevelRoute({ params }: PageProps) {
  const { week: weekValue } = await params;
  const week = Number(weekValue);
  if (!Number.isInteger(week) || week < 1 || week > 24) redirect("/dashboard");

  const user = await requireChatGPTUser(`/levels/${week}`);
  const db = getDb();
  const [profile] = await db.select().from(learnerProfiles)
    .where(eq(learnerProfiles.userId, user.userId)).limit(1);
  if (!profile?.onboardingCompleted) redirect("/onboarding");
  if (week > profile.currentWeek) redirect("/dashboard");

  const level = planWorlds.flatMap((world) => world.levels).find((item) => item.week === week)!;
  const world = planWorlds.find((item) => item.levels.some((worldLevel) => worldLevel.week === week))!;
  const review = week === 3 ? await loadReviewLessonForUser(user.userId) : null;
  const lesson = review?.lesson ?? getLevelLesson(week);
  const [saved] = await db.select().from(levelProgress)
    .where(and(eq(levelProgress.userId, user.userId), eq(levelProgress.levelKey, level.key))).limit(1);
  const [savedAttempt] = await db.select().from(lessonAttempts)
    .where(and(eq(lessonAttempts.userId, user.userId), eq(lessonAttempts.levelKey, level.key), eq(lessonAttempts.status, "active"))).limit(1);
  let resumeAttempt: { id: number; questionIndex: number; answers: number[]; questionIds: string[]; version: number } | undefined;
  if (savedAttempt) {
    try {
      const answers = JSON.parse(savedAttempt.answersJson) as unknown;
      const questionIds = JSON.parse(savedAttempt.questionIdsJson) as unknown;
      const expectedQuestionIds = lesson?.questions.map((question) => question.id) ?? [];
      const sameQuestions = Array.isArray(questionIds) && questionIds.length === expectedQuestionIds.length && questionIds.every((id, index) => id === expectedQuestionIds[index]);
      if (sameQuestions && Array.isArray(questionIds) && Array.isArray(answers) && answers.length === savedAttempt.questionIndex && answers.every((answer) => Number.isInteger(answer))) {
        resumeAttempt = { id: savedAttempt.id, questionIndex: savedAttempt.questionIndex, answers: answers as number[], questionIds: questionIds as string[], version: savedAttempt.version };
      }
    } catch {
      resumeAttempt = undefined;
    }
  }

  if (!lesson) {
    return (
      <main className="level-shell level-coming-shell">
        <section className="level-coming-card">
          <span className="coming-lock">锁</span>
          <p className="eyebrow">第 {week} 周 · {world.name}</p>
          <h1>{level.title}</h1>
          <p>这一关正在制作中。你已经走到当前开发边界，前面的成绩和星级都已安全保存。</p>
          <a className="setup-submit" href="/dashboard">返回闯关地图</a>
        </section>
      </main>
    );
  }

  return (
    <LevelSession
      week={week}
      worldName={world.name}
      title={level.title}
      focus={level.focus}
      kind={level.kind}
      lesson={lesson}
      bestStars={saved?.stars ?? 0}
      bestScore={saved?.bestScore ?? 0}
      resumeAttempt={resumeAttempt}
      personalizedReview={review?.personalized ?? false}
    />
  );
}
