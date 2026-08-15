CREATE TABLE `level_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`level_key` text NOT NULL,
	`status` text DEFAULT 'locked' NOT NULL,
	`stars` integer DEFAULT 0 NOT NULL,
	`best_score` real,
	`attempts` integer DEFAULT 0 NOT NULL,
	`completed_at` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_level_progress_user_level` ON `level_progress` (`user_id`,`level_key`);--> statement-breakpoint
CREATE INDEX `idx_level_progress_user_status` ON `level_progress` (`user_id`,`status`);--> statement-breakpoint
ALTER TABLE `daily_tasks` ADD `xp_awarded` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `onboarding_completed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `current_week` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `total_xp` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `streak_days` integer DEFAULT 0 NOT NULL;