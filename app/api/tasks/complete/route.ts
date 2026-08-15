import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dailyTasks, studyEvents } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });

  const payload = (await request.json()) as { taskId?: number; completed?: boolean };
  if (!Number.isInteger(payload.taskId) || typeof payload.completed !== "boolean") {
    return Response.json({ error: "无效的任务请求" }, { status: 400 });
  }

  const db = getDb();
  const [task] = await db.select().from(dailyTasks)
    .where(and(eq(dailyTasks.id, payload.taskId!), eq(dailyTasks.userId, user.userId))).limit(1);
  if (!task) return Response.json({ error: "任务不存在" }, { status: 404 });

  const completedAt = payload.completed ? new Date().toISOString() : null;
  await db.update(dailyTasks).set({ status: payload.completed ? "done" : "todo", completedAt })
    .where(and(eq(dailyTasks.id, task.id), eq(dailyTasks.userId, user.userId)));

  if (payload.completed && task.status !== "done") {
    await db.insert(studyEvents).values({ userId: user.userId, activityType: task.skill, sourceId: task.id, durationMinutes: task.minutes });
  }

  return Response.json({ ok: true });
}
