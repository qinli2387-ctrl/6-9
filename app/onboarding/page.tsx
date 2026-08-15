import { eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db";
import { learnerProfiles } from "@/db/schema";
import { requireChatGPTUser } from "../chatgpt-auth";
import { OnboardingForm } from "./OnboardingForm";

export const dynamic = "force-dynamic";

function defaultExamDate() {
  const date = new Date();
  date.setDate(date.getDate() + 24 * 7);
  return date.toISOString().slice(0, 10);
}

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default async function OnboardingPage() {
  const user = await requireChatGPTUser("/onboarding");
  const db = getDb();

  await db.insert(learnerProfiles).values({
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
  }).onConflictDoUpdate({
    target: learnerProfiles.userId,
    set: { email: user.email, displayName: user.displayName },
  });

  const [profile] = await db.select().from(learnerProfiles)
    .where(eq(learnerProfiles.userId, user.userId)).limit(1);

  return (
    <main className="onboarding-shell">
      <Link className="brand onboarding-brand" href="/">
        <span className="brand-mark">6</span><span>六分计划</span>
      </Link>
      <section className="onboarding-card">
        <div className="onboarding-copy">
          <p className="eyebrow">第 1 步 · 建立你的路线</p>
          <h1>{profile.onboardingCompleted ? "调整学习目标" : "先告诉我，你准备怎么学。"}</h1>
          <p>系统会据此生成24周路线。之后每周根据正确率、用时和错题自动调整训练重点。</p>
          <ol className="setup-preview" aria-label="计划生成步骤">
            <li><span>1</span>确定考试类型与日期</li>
            <li><span>2</span>安排每天可用时间</li>
            <li><span>3</span>进入第一周基础关</li>
          </ol>
        </div>
        <OnboardingForm
          initialExamType={profile.examType}
          initialExamDate={profile.examDate ?? defaultExamDate()}
          initialDailyMinutes={profile.dailyMinutes}
          editing={profile.onboardingCompleted}
          minimumExamDate={tomorrow()}
        />
      </section>
    </main>
  );
}
