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
    completedAt: text("completed_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_daily_tasks_user_date").on(table.userId, table.taskDate),
    uniqueIndex("ux_daily_tasks_user_date_position").on(table.userId, table.taskDate, table.position),
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
    state: integer("state").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    lastReviewAt: text("last_review_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_vocab_cards_user_due").on(table.userId, table.dueAt)],
);

export const vocabReviews = sqliteTable(
  "vocab_reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    cardId: integer("card_id").notNull(),
    rating: integer("rating").notNull(),
    reviewedAt: text("reviewed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_vocab_reviews_card_time").on(table.cardId, table.reviewedAt)],
);
