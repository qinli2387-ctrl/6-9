CREATE TABLE `learning_errors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`source_type` text NOT NULL,
	`source_key` text NOT NULL,
	`question_id` text NOT NULL,
	`skill` text NOT NULL,
	`category` text NOT NULL,
	`prompt` text NOT NULL,
	`context` text DEFAULT '' NOT NULL,
	`options_json` text NOT NULL,
	`selected_index` integer NOT NULL,
	`correct_index` integer NOT NULL,
	`explanation` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`occurrence_count` integer DEFAULT 1 NOT NULL,
	`due_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_wrong_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`resolved_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_learning_errors_user_source_question` ON `learning_errors` (`user_id`,`source_type`,`question_id`);--> statement-breakpoint
CREATE INDEX `idx_learning_errors_user_status_due` ON `learning_errors` (`user_id`,`status`,`due_at`);--> statement-breakpoint
CREATE INDEX `idx_learning_errors_user_skill_category` ON `learning_errors` (`user_id`,`skill`,`category`);