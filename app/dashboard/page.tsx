import { and, asc, count, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { dailyTasks, learnerProfiles, learningErrors, lessonAttempts, levelProgress, skillBaselines, vocabCards } from "@/db/schema";
import { buildWeightedDailyTasks, resultFromBaseline, type SkillKey, type SkillResult } from "@/lib/placement";
import { ensureStarterVocabulary } from "@/lib/vocabulary";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import { DashboardClient } from "./DashboardClient";
import { LevelMap } from "./LevelMap";

export const dynamic = "force-dynamic";

function dateInShanghai() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatExamDate(value: string | null) {
  if (!value) return "待确定";
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(new Date(`${value}T12:00:00Z`));
}

async function loadDashboard(user: { userId: string; email: string; displayName: string }) {
  const db = getDb();
  const today = dateInShanghai();

  await db.insert(learnerProfiles).values({ userId: user.userId, email: user.email, displayName: user.displayName })
    .onConflictDoUpdate({ target: learnerProfiles.userId, set: { email: user.email, displayName: user.displayName } });

  const [profile] = await db.select().from(learnerProfiles)
    .where(eq(learnerProfiles.userId, user.userId)).limit(1);
  if (!profile.onboardingCompleted) redirect("/onboarding");

  const [baseline] = await db.select().from(skillBaselines)
    .where(eq(skillBaselines.userId, user.userId)).limit(1);

  let tasks = await db.select().from(dailyTasks)
    .where(and(eq(dailyTasks.userId, user.userId), eq(dailyTasks.taskDate, today)))
    .orderBy(asc(dailyTasks.position));

  if (tasks.length === 0) {
    const taskValues = baseline ? buildWeightedDailyTasks(profile.dailyMinutes, {
      listening: baseline.listeningWeight,
      reading: baseline.readingWeight,
      writing: baseline.writingWeight,
      speaking: baseline.speakingWeight,
    }) : [
      { userId: user.userId, taskDate: today, skill: "listening", title: "听力精听", detail: "Section 1 · 地址与数字", minutes: 20, position: 1 },
      { userId: user.userId, taskDate: today, skill: "vocabulary", title: "到期词汇复习", detail: "18个高频词等待复习", minutes: 15, position: 2 },
      { userId: user.userId, taskDate: today, skill: "writing", title: "Task 2 审题训练", detail: "观点类作文 · 只写提纲", minutes: 25, position: 3 },
    ];
    await db.insert(dailyTasks).values(taskValues.map((task) => ({ ...task, userId: user.userId, taskDate: today }))).onConflictDoNothing();
    tasks = await db.select().from(dailyTasks)
      .where(and(eq(dailyTasks.userId, user.userId), eq(dailyTasks.taskDate, today)))
      .orderBy(asc(dailyTasks.position));
  }

  const progress = await db.select({
    levelKey: levelProgress.levelKey,
    status: levelProgress.status,
    stars: levelProgress.stars,
  }).from(levelProgress).where(eq(levelProgress.userId, user.userId));

  const [activeAttempt] = await db.select({
    levelKey: lessonAttempts.levelKey,
    questionIndex: lessonAttempts.questionIndex,
  }).from(lessonAttempts).where(and(
    eq(lessonAttempts.userId, user.userId),
    eq(lessonAttempts.status, "active"),
  )).orderBy(sql`${lessonAttempts.updatedAt} DESC`).limit(1);

  await ensureStarterVocabulary(user.userId);
  const [dueResult] = await db.select({ value: count() }).from(vocabCards).where(and(
    eq(vocabCards.userId, user.userId),
    sql`datetime(${vocabCards.dueAt}) <= datetime(${new Date().toISOString()})`,
  ));
  const [dueErrorResult] = await db.select({ value: count() }).from(learningErrors).where(and(
    eq(learningErrors.userId, user.userId),
    eq(learningErrors.status, "open"),
    sql`datetime(${learningErrors.dueAt}) <= datetime(${new Date().toISOString()})`,
  ));
  const vocabularyDetail = dueResult.value > 0 ? `${dueResult.value}个词等待复习` : "今日到期词卡已完成";
  tasks = tasks.map((task) => task.skill === "vocabulary" ? { ...task, detail: vocabularyDetail } : task);

  const resumeWeek = activeAttempt ? Number(activeAttempt.levelKey.replace("week-", "")) : null;
  return {
    profile,
    tasks,
    progress,
    baseline,
    dueVocabulary: dueResult.value,
    dueErrors: dueErrorResult.value,
    resumeAttempt: activeAttempt && resumeWeek !== null && Number.isInteger(resumeWeek) ? {
      week: resumeWeek,
      questionIndex: activeAttempt.questionIndex,
    } : null,
  };
}

export default async function DashboardPage() {
  const user = await requireChatGPTUser("/dashboard");
  const { profile, tasks, progress, baseline, dueVocabulary, dueErrors, resumeAttempt } = await loadDashboard(user);
  const completedMinutes = tasks.filter((task) => task.status === "done").reduce((sum, task) => sum + task.minutes, 0);
  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const percent = totalMinutes ? Math.round((completedMinutes / totalMinutes) * 100) : 0;
  const firstName = user.displayName.split(/[\s@]/)[0];
  const placement = baseline ? resultFromBaseline(baseline) : null;
  const skillLabels: Record<SkillKey, string> = { listening: "听力", reading: "阅读", writing: "写作", speaking: "口语" };
  const placementSkills = placement ? Object.entries(placement.skills) as Array<[SkillKey, SkillResult]> : [];
  const prioritySkill = [...placementSkills].sort((left, right) => right[1].weight - left[1].weight)[0]?.[0] ?? null;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/"><span className="brand-mark">6</span><span>六分计划</span></Link>
        <nav className="side-nav" aria-label="学习功能">
          <a className="active" href="/dashboard">闯关地图</a>
          <a href="#today">今日训练</a>
          <a href="/vocabulary">词汇复习</a>
          <a href="/placement">四科摸底</a>
          <a href="#future">错题本</a>
          <a href="/onboarding">目标设置</a>
        </nav>
        <a className="sign-out" href={chatGPTSignOutPath("/")}>退出账号</a>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header journey-header">
          <div><p>第 {profile.currentWeek} 周 · {profile.examType === "general" ? "培训类" : "学术类"}雅思</p><h1>{firstName}，今天继续向六分前进。</h1></div>
          <span className="sync-pill"><span className="status-dot" /> 已同步到云端</span>
        </header>

        <section className="journey-stats" aria-label="学习进度概览">
          <div><span>当前关卡</span><strong>第 {profile.currentWeek} 周</strong></div>
          <div><span>累计经验</span><strong>{profile.totalXp} XP</strong></div>
          <div><span>连续学习</span><strong>{profile.streakDays || 1} 天</strong></div>
          <div><span>预计考试</span><strong>{formatExamDate(profile.examDate)}</strong></div>
        </section>

        {resumeAttempt && resumeAttempt.week <= profile.currentWeek && (
          <section className="resume-panel">
            <div>
              <p className="eyebrow">继续学习</p>
              <h2>第 {resumeAttempt.week} 周 · 第 {resumeAttempt.questionIndex + 1} 题</h2>
              <p>进度已保存到云端，换设备也能从这里继续。</p>
            </div>
            <Link className="level-primary" href={`/levels/${resumeAttempt.week}`}>继续关卡</Link>
          </section>
        )}

        <div className="journey-grid">
          <LevelMap currentWeek={profile.currentWeek} progress={progress} />
          <aside className="journey-rail">
            <section className="today-panel" id="today">
              <div className="panel-title"><div><p className="eyebrow">今日训练</p><h2>{tasks.length}个任务 · {totalMinutes}分钟</h2></div><span>{percent}%</span></div>
              <div className="wide-progress"><span style={{ width: `${percent}%` }} /></div>
              <DashboardClient tasks={tasks} />
            </section>
            <section className="insight-panel">
              <p className="eyebrow">{placement ? "四科训练权重" : "本周目标"}</p>
              <strong className="band-number">{placement ? placement.overallBand.toFixed(1) : "6.0"}</strong>
              <p>{placement ? "初步起点估计 · 后续持续校准" : `每天 ${profile.dailyMinutes} 分钟 · 完成本周基础关`}</p>
              {placement ? (
                <div className="skill-weight-list">
                  {placementSkills.map(([skill, value]) => (
                    <div key={skill}><span>{skillLabels[skill]}</span><i><b style={{ width: `${value.weight}%` }} /></i><strong>{value.weight}%</strong></div>
                  ))}
                </div>
              ) : <a className="placement-rail-link" href="/placement">完成四科摸底</a>}
              <div className="mini-stat"><span>今日已学习</span><strong>{completedMinutes}分钟</strong></div>
              <div className="mini-stat"><span>下一次解锁</span><strong>完成今日任务</strong></div>
              <div className="coach-note"><span>教练建议</span><p>{prioritySkill ? `当前优先补强${skillLabels[prioritySkill]}，新生成的每日任务会按这组权重分配。` : "先完成四科摸底，再按真实起点分配每天的训练时间。"}</p></div>
            </section>
            <section className="coming-panel rail-coming vocab-entry" id="future">
              <p className="eyebrow">智能复习</p>
              <h2>{dueErrors > 0 ? `${dueErrors} 道错题、${dueVocabulary} 个词待复习` : dueVocabulary > 0 ? `${dueVocabulary} 个词今天到期` : "今天的复习队列已清空"}</h2>
              <p>{dueErrors > 0 ? "第 3 周复习关会混合听读错题和 FSRS 到期词汇，并在答题后更新队列。" : "用“忘记、困难、记得、简单”反馈真实回忆情况，FSRS 会自动计算下次复习时间。"}</p>
              <a className="level-primary" href={profile.currentWeek >= 3 ? "/levels/3" : "/vocabulary"}>{profile.currentWeek >= 3 ? "进入个性化复习关" : dueVocabulary > 0 ? "开始词汇复习" : "查看复习计划"}</a>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
