ALTER TABLE `vocab_cards` ADD `elapsed_days` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `vocab_cards` ADD `scheduled_days` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `vocab_cards` ADD `learning_steps` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `ux_vocab_cards_user_word` ON `vocab_cards` (`user_id`,`word`);--> statement-breakpoint
ALTER TABLE `vocab_reviews` ADD `state` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `vocab_reviews` ADD `due_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `vocab_reviews` ADD `stability` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `vocab_reviews` ADD `difficulty` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `vocab_reviews` ADD `elapsed_days` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `vocab_reviews` ADD `last_elapsed_days` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `vocab_reviews` ADD `scheduled_days` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `vocab_reviews` ADD `learning_steps` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_vocab_reviews_user_time` ON `vocab_reviews` (`user_id`,`reviewed_at`);
