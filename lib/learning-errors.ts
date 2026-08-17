import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { learningErrors } from "@/db/schema";
import { isErrorCategoryForSkill, type ErrorCategory, type ErrorSkill } from "@/lib/error-taxonomy";

export type ObjectiveErrorQuestion = {
  id: string;
  skill: ErrorSkill;
  category: ErrorCategory;
  prompt: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export async function recordLearningErrors(input: {
  userId: string;
  sourceType: "level" | "placement";
  sourceKey: string;
  questions: ObjectiveErrorQuestion[];
  answers: number[];
}) {
  const db = getDb();
  const now = new Date().toISOString();

  for (const [index, question] of input.questions.entries()) {
    const selectedIndex = input.answers[index];
    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= question.options.length) {
      throw new Error(`题目 ${question.id} 的答案索引无效`);
    }
    if (!isErrorCategoryForSkill(question.skill, question.category)) {
      throw new Error(`题目 ${question.id} 的错因分类与技能不匹配`);
    }
    if (selectedIndex === question.correctIndex) continue;

    await db.insert(learningErrors).values({
      userId: input.userId,
      sourceType: input.sourceType,
      sourceKey: input.sourceKey,
      questionId: question.id,
      skill: question.skill,
      category: question.category,
      prompt: question.prompt,
      context: question.context ?? "",
      optionsJson: JSON.stringify(question.options),
      selectedIndex,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      status: "open",
      occurrenceCount: 1,
      dueAt: now,
      lastWrongAt: now,
      resolvedAt: null,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: [learningErrors.userId, learningErrors.sourceType, learningErrors.questionId],
      set: {
        sourceKey: input.sourceKey,
        skill: question.skill,
        category: question.category,
        prompt: question.prompt,
        context: question.context ?? "",
        optionsJson: JSON.stringify(question.options),
        selectedIndex,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        status: "open",
        occurrenceCount: sql`${learningErrors.occurrenceCount} + 1`,
        dueAt: now,
        lastWrongAt: now,
        resolvedAt: null,
        updatedAt: now,
      },
    });
  }
}
