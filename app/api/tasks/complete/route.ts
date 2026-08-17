import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dailyTasks } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { completeDailyTask } from "@/lib/task-completion";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });

  const payload = await request.json().catch(() => ({})) as { taskId?: number; completed?: boolean };
  if (!Number.isInteger(payload.taskId) || typeof payload.completed !== "boolean") {
    return Response.json({ error: "无效的任务请求" }, { status: 400 });
  }

  const db = getDb();
  const [task] = await db.select().from(dailyTasks)
    .where(and(eq(dailyTasks.id, payload.taskId!), eq(dailyTasks.userId, user.userId))).limit(1);
  if (!task) return Response.json({ error: "任务不存在" }, { status: 404 });

  if (!payload.completed) {
    await db.update(dailyTasks).set({ status: "todo", completedAt: null })
      .where(and(eq(dailyTasks.id, task.id), eq(dailyTasks.userId, user.userId)));
    return Response.json({ ok: true, xpEarned: 0 });
  }

  const result = await completeDailyTask(db, user.userId, task.id, new Date().toISOString());
  return Response.json({ ok: true, xpEarned: result.xpEarned });
}
