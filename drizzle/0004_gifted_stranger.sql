CREATE TABLE `skill_baselines` (
	`user_id` text PRIMARY KEY NOT NULL,
	`overall_band` real NOT NULL,
	`listening_score` integer NOT NULL,
	`listening_band` real NOT NULL,
	`listening_weight` integer NOT NULL,
	`reading_score` integer NOT NULL,
	`reading_band` real NOT NULL,
	`reading_weight` integer NOT NULL,
	`writing_score` integer NOT NULL,
	`writing_band` real NOT NULL,
	`writing_weight` integer NOT NULL,
	`speaking_score` integer NOT NULL,
	`speaking_band` real NOT NULL,
	`speaking_weight` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`completed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
