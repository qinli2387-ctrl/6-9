CREATE TABLE `lesson_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`level_key` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`question_index` integer DEFAULT 0 NOT NULL,
	`answers_json` text DEFAULT '[]' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_lesson_attempts_user_level` ON `lesson_attempts` (`user_id`,`level_key`);--> statement-breakpoint
CREATE INDEX `idx_lesson_attempts_user_status_time` ON `lesson_attempts` (`user_id`,`status`,`updated_at`);