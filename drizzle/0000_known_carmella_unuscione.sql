CREATE TABLE `materials` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`object_key` text NOT NULL,
	`status` text DEFAULT 'ready' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`material_id` text,
	`title` text NOT NULL,
	`subject` text DEFAULT 'General' NOT NULL,
	`cards_json` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE no action
);
