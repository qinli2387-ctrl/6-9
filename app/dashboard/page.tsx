import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dailyTasks, learnerProfiles } from "@/db/schema";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

function dateInShanghai() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function ensureToday(user: { userId: string; email: string; displayName: string }) {
  const db = getDb();
  const today = dateInShanghai();

  await db.insert(learnerProfiles).values({ userId: user.userId, email: user.email, displayName: user.displayName })
    .onConflictDoUpdate({ target: learnerProfiles.userId, set: { email: user.email, displayName: user.displayName } });

  let tasks = await db.select().from(dailyTasks)
    .where(and(eq(dailyTasks.userId, user.userId), eq(dailyTasks.taskDate, today)))
    .orderBy(asc(dailyTasks.position));

  if (tasks.length === 0) {
    await db.insert(dailyTasks).values([
      { userId: user.userId, taskDate: today, skill: "listening", title: "听力精听", detail: "Section 1 · 地址与数字", minutes: 20, position: 1 },
      { userId: user.userId, taskDate: today, skill: "vocabulary", title: "到期词汇复习", detail: "18 个高频词等待复习", minutes: 15, position: 2 },
      { userId: user.userId, taskDate: today, skill: "writing", title: "Task 2 审题训练", detail: "观点类作文 · 只写提纲", minutes: 25, position: 3 },
    ]).onConflictDoNothing();
    tasks = await db.select().from(dailyTasks)
      .where(and(eq(dailyTasks.userId, user.userId), eq(dailyTasks.taskDate, today)))
      .orderBy(asc(dailyTasks.position));
  }

  return tasks;
}

export default async function DashboardPage() {
  const user = await requireChatGPTUser("/dashboard");
  const tasks = await ensureToday(user);
  const completedMinutes = tasks.filter((task) => task.status === "done").reduce((sum, task) => sum + task.minutes, 0);
  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const percent = totalMinutes ? Math.round((completedMinutes / totalMinutes) * 100) : 0;
  const firstName = user.displayName.split(/[\s@]/)[0];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/"><span className="brand-mark">6</span><span>六分计划</span></a>
        <nav className="side-nav" aria-label="学习功能">
          <a className="active" href="/dashboard">今日计划</a>
          <a href="#coming-soon">词汇复习</a>
          <a href="#coming-soon">听力训练</a>
          <a href="#coming-soon">阅读训练</a>
          <a href="#coming-soon">写作批改</a>
          <a href="#coming-soon">口语练习</a>
        </nav>
        <a className="sign-out" href={chatGPTSignOutPath("/")}>退出账号</a>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header"><div><p>第 1 周 · 建立基础</p><h1>{firstName}，今天稳稳前进一点。</h1></div><span className="sync-pill"><span className="status-dot" /> 已同步到云端</span></header>
        <div className="dashboard-grid">
          <section className="today-panel">
            <div className="panel-title"><div><p className="eyebrow">今日训练</p><h2>{tasks.length} 个小任务，共 {totalMinutes} 分钟</h2></div><span>{percent}%</span></div>
            <div className="wide-progress"><span style={{ width: `${percent}%` }} /></div>
            <DashboardClient tasks={tasks} />
          </section>
          <aside className="insight-panel">
            <p className="eyebrow">当前目标</p><strong className="band-number">6.0</strong>
            <p>学术类雅思 · 24 周计划</p>
            <div className="mini-stat"><span>本周学习</span><strong>{completedMinutes} 分钟</strong></div>
            <div className="mini-stat"><span>连续学习</span><strong>1 天</strong></div>
            <div className="coach-note"><span>教练建议</span><p>先完成今天的三个基础任务。完成摸底后，这里的计划会根据你的真实水平自动调整。</p></div>
          </aside>
        </div>
        <section className="coming-panel" id="coming-soon"><p className="eyebrow">接下来</p><h2>摸底测试与 FSRS 词汇复习</h2><p>下一阶段将接入听说读写摸底、错题标签和科学复习排程。</p></section>
      </section>
    </main>
  );
}
