import { and, asc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { learnerProfiles, vocabCards } from "@/db/schema";
import { ensureStarterVocabulary } from "@/lib/vocabulary";
import { VocabReview } from "./VocabReview";

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const user = await requireChatGPTUser("/vocabulary");
  const db = getDb();
  const [profile] = await db.select().from(learnerProfiles)
    .where(eq(learnerProfiles.userId, user.userId)).limit(1);
  if (!profile?.onboardingCompleted) redirect("/onboarding");

  await ensureStarterVocabulary(user.userId);
  const now = new Date().toISOString();
  const dueCards = await db.select({
    id: vocabCards.id,
    word: vocabCards.word,
    meaning: vocabCards.meaning,
    example: vocabCards.example,
  }).from(vocabCards).where(and(
    eq(vocabCards.userId, user.userId),
    sql`datetime(${vocabCards.dueAt}) <= datetime(${now})`,
  )).orderBy(asc(vocabCards.dueAt)).limit(20);

  return (
    <main className="level-shell vocab-shell">
      <header className="vocab-topbar">
        <a className="level-exit" href="/dashboard" aria-label="退出词汇复习返回地图">×</a>
        <a className="brand" href="/dashboard"><span className="brand-mark">6</span><span>六分计划</span></a>
        <span className="sync-pill"><span className="status-dot" /> 云端同步</span>
      </header>
      <VocabReview initialCards={dueCards} />
    </main>
  );
}
