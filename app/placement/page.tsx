import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { learnerProfiles, skillBaselines } from "@/db/schema";
import { resultFromBaseline } from "@/lib/placement";
import { PlacementFlow } from "./PlacementFlow";

export const dynamic = "force-dynamic";

export default async function PlacementPage() {
  const user = await requireChatGPTUser("/placement");
  const db = getDb();
  const [profile] = await db.select({ onboardingCompleted: learnerProfiles.onboardingCompleted })
    .from(learnerProfiles).where(eq(learnerProfiles.userId, user.userId)).limit(1);
  if (!profile?.onboardingCompleted) redirect("/onboarding");

  const [baseline] = await db.select().from(skillBaselines)
    .where(eq(skillBaselines.userId, user.userId)).limit(1);

  return (
    <main className="level-shell placement-shell">
      <header className="placement-topbar">
        <a className="level-exit" href="/dashboard" aria-label="退出摸底返回地图">×</a>
        <a className="brand" href="/dashboard"><span className="brand-mark">6</span><span>六分计划</span></a>
        <span className="sync-pill"><span className="status-dot" /> 云端保存</span>
      </header>
      <PlacementFlow initialResult={baseline ? resultFromBaseline(baseline) : null} />
    </main>
  );
}
