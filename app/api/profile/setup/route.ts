import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { learnerProfiles, levelProgress } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";

const allowedMinutes = new Set([30, 45, 60, 90]);

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });

  const payload = await request.json() as { examType?: string; examDate?: string; dailyMinutes?: number };
  const date = typeof payload.examDate === "string" ? new Date(`${payload.examDate}T12:00:00Z`) : null;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());

  if (!['academic', 'general'].includes(payload.examType ?? "")) {
    return Response.json({ error: "请选择考试类型" }, { status: 400 });
  }
  if (!date || Number.isNaN(date.getTime()) || payload.examDate! <= today) {
    return Response.json({ error: "考试日期需要晚于今天" }, { status: 400 });
  }
  if (!allowedMinutes.has(payload.dailyMinutes ?? 0)) {
    return Response.json({ error: "请选择每天学习时间" }, { status: 400 });
  }

  const db = getDb();
  await db.insert(learnerProfiles).values({
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    examType: payload.examType!,
    examDate: payload.examDate!,
    dailyMinutes: payload.dailyMinutes!,
    onboardingCompleted: true,
  }).onConflictDoUpdate({
    target: learnerProfiles.userId,
    set: {
      email: user.email,
      displayName: user.displayName,
      examType: payload.examType!,
      examDate: payload.examDate!,
      dailyMinutes: payload.dailyMinutes!,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    },
  });

  const [existingFirstLevel] = await db.select({ id: levelProgress.id }).from(levelProgress)
    .where(eq(levelProgress.userId, user.userId)).limit(1);
  if (!existingFirstLevel) {
    await db.insert(levelProgress).values({ userId: user.userId, levelKey: "week-1", status: "active" });
  }

  return Response.json({ ok: true });
}
