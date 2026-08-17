import { eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { learnerProfiles, skillBaselines, studyEvents } from "@/db/schema";
import { PlacementValidationError, scorePlacement, type PlacementSubmission } from "@/lib/placement";
import { listeningQuestions, readingPassage, readingQuestions } from "@/lib/placement-content";
import { recordLearningErrors } from "@/lib/learning-errors";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });

  let payload: PlacementSubmission;
  try {
    payload = await request.json() as PlacementSubmission;
  } catch {
    return Response.json({ error: "提交内容无效" }, { status: 400 });
  }

  const db = getDb();
  const [profile] = await db.select({ onboardingCompleted: learnerProfiles.onboardingCompleted })
    .from(learnerProfiles).where(eq(learnerProfiles.userId, user.userId)).limit(1);
  if (!profile?.onboardingCompleted) {
    return Response.json({ error: "请先完成目标设置" }, { status: 409 });
  }

  try {
    const result = scorePlacement(payload);
    const now = new Date().toISOString();
    await recordLearningErrors({
      userId: user.userId,
      sourceType: "placement",
      sourceKey: "placement-v1",
      questions: [
        ...listeningQuestions.map((question) => ({
          ...question,
          skill: "listening" as const,
          category: question.errorCategory,
        })),
        ...readingQuestions.map((question) => ({
          ...question,
          skill: "reading" as const,
          category: question.errorCategory,
          context: readingPassage,
        })),
      ],
      answers: [...payload.listeningAnswers!, ...payload.readingAnswers!],
    });
    const updatedValues = {
      overallBand: result.overallBand,
      listeningScore: result.skills.listening.score,
      listeningBand: result.skills.listening.band,
      listeningWeight: result.skills.listening.weight,
      readingScore: result.skills.reading.score,
      readingBand: result.skills.reading.band,
      readingWeight: result.skills.reading.weight,
      writingScore: result.skills.writing.score,
      writingBand: result.skills.writing.band,
      writingWeight: result.skills.writing.weight,
      speakingScore: result.skills.speaking.score,
      speakingBand: result.skills.speaking.band,
      speakingWeight: result.skills.speaking.weight,
      completedAt: now,
      updatedAt: now,
    };

    await db.insert(skillBaselines).values({ userId: user.userId, ...updatedValues }).onConflictDoUpdate({
      target: skillBaselines.userId,
      set: updatedValues,
    });

    const duration = Math.min(3600, Math.max(60, Math.round(payload.durationSeconds ?? 0)));
    const averageScore = Math.round(Object.values(result.skills).reduce((sum, skill) => sum + skill.score, 0) / 4);
    await db.insert(studyEvents).values({
      userId: user.userId,
      activityType: "placement_complete",
      durationMinutes: Math.ceil(duration / 60),
      score: averageScore,
    });

    return Response.json({ ok: true, result });
  } catch (error) {
    if (error instanceof PlacementValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
