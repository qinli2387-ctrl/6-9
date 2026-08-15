import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const learnerProfiles = sqliteTable("learner_profiles", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  examType: text("exam_type").notNull().default("academic"),
  targetBand: real("target_band").notNull().default(6),
  examDate: text("exam_date"),
  dailyMinutes: integer("daily_minutes").notNull().default(60),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" }).notNull().default(false),
  currentWeek: integer("current_week").notNull().default(1),
  totalXp: integer("total_xp").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  timezone: text("timezone").notNull().default("Asia/Shanghai"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const dailyTasks = sqliteTable(
  "daily_tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    taskDate: text("task_date").notNull(),
    skill: text("skill").notNull(),
    title: text("title").notNull(),
    detail: text("detail").notNull().default(""),
    minutes: integer("minutes").notNull(),
    status: text("status").notNull().default("todo"),
    position: integer("position").notNull().default(0),
    xpAwarded: integer("xp_awarded", { mode: "boolean" }).notNull().default(false),
    completedAt: text("completed_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_daily_tasks_user_date").on(table.userId, table.taskDate),
    uniqueIndex("ux_daily_tasks_user_date_position").on(table.userId, table.taskDate, table.position),
  ],
);

export const levelProgress = sqliteTable(
  "level_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    levelKey: text("level_key").notNull(),
    status: text("status").notNull().default("locked"),
    stars: integer("stars").notNull().default(0),
    bestScore: real("best_score"),
    attempts: integer("attempts").notNull().default(0),
    completedAt: text("completed_at"),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("ux_level_progress_user_level").on(table.userId, table.levelKey),
    index("idx_level_progress_user_status").on(table.userId, table.status),
  ],
);

export const studyEvents = sqliteTable(
  "study_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    activityType: text("activity_type").notNull(),
    sourceId: integer("source_id"),
    durationMinutes: integer("duration_minutes").notNull().default(0),
    score: real("score"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_study_events_user_time").on(table.userId, table.createdAt)],
);

export const vocabCards = sqliteTable(
  "vocab_cards",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    word: text("word").notNull(),
    meaning: text("meaning").notNull(),
    example: text("example").notNull().default(""),
    dueAt: text("due_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    stability: real("stability").notNull().default(0),
    difficulty: real("difficulty").notNull().default(0),
    elapsedDays: integer("elapsed_days").notNull().default(0),
    scheduledDays: integer("scheduled_days").notNull().default(0),
    learningSteps: integer("learning_steps").notNull().default(0),
    state: integer("state").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    lastReviewAt: text("last_review_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_vocab_cards_user_due").on(table.userId, table.dueAt),
    uniqueIndex("ux_vocab_cards_user_word").on(table.userId, table.word),
  ],
);

export const vocabReviews = sqliteTable(
  "vocab_reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    cardId: integer("card_id").notNull(),
    rating: integer("rating").notNull(),
    state: integer("state").notNull(),
    dueAt: text("due_at").notNull(),
    stability: real("stability").notNull(),
    difficulty: real("difficulty").notNull(),
    elapsedDays: integer("elapsed_days").notNull().default(0),
    lastElapsedDays: integer("last_elapsed_days").notNull().default(0),
    scheduledDays: integer("scheduled_days").notNull().default(0),
    learningSteps: integer("learning_steps").notNull().default(0),
    reviewedAt: text("reviewed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_vocab_reviews_card_time").on(table.cardId, table.reviewedAt),
    index("idx_vocab_reviews_user_time").on(table.userId, table.reviewedAt),
  ],
);
