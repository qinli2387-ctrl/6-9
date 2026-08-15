import { count, eq } from "drizzle-orm";
import type { Card } from "ts-fsrs";
import { getDb } from "@/db";
import { vocabCards } from "@/db/schema";

const starterVocabulary = [
  ["allocate", "分配；拨出", "The city allocated more funds to public transport."],
  ["decline", "下降；减少", "The chart shows a gradual decline in car use."],
  ["significant", "显著的；重要的", "There was a significant rise in online learning."],
  ["whereas", "然而；而", "Urban populations grew, whereas rural populations fell."],
  ["contribute", "促成；贡献", "Regular exercise can contribute to better health."],
  ["sustainable", "可持续的", "The council is investing in sustainable energy."],
  ["proportion", "比例；部分", "A large proportion of students travelled by bus."],
  ["approximately", "大约", "Approximately one third of respondents chose option A."],
  ["evidence", "证据；依据", "The writer provides evidence to support the claim."],
  ["factor", "因素", "Cost is an important factor in this decision."],
  ["benefit", "益处；使受益", "Public parks benefit both residents and visitors."],
  ["alternative", "替代方案；可供选择的", "Cycling is a practical alternative to driving."],
] as const;

export async function ensureStarterVocabulary(userId: string) {
  const db = getDb();
  const [result] = await db.select({ value: count() }).from(vocabCards)
    .where(eq(vocabCards.userId, userId));
  if (result.value > 0) return;

  await db.insert(vocabCards).values(starterVocabulary.map(([word, meaning, example]) => ({
    userId,
    word,
    meaning,
    example,
  }))).onConflictDoNothing();
}

export function toFsrsCard(card: typeof vocabCards.$inferSelect): Card {
  return {
    due: new Date(card.dueAt),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays,
    scheduled_days: card.scheduledDays,
    learning_steps: card.learningSteps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.lastReviewAt ? new Date(card.lastReviewAt) : undefined,
  };
}
