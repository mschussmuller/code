CREATE TABLE `document_intakes` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`developer` text NOT NULL,
	`document_type` text NOT NULL,
	`source_type` text NOT NULL,
	`file_name` text,
	`source_url` text,
	`r2_key` text,
	`mime_type` text,
	`size_bytes` integer,
	`note` text,
	`status` text NOT NULL,
	`analysis_summary` text NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `missing_data_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`developer` text NOT NULL,
	`field` text NOT NULL,
	`label` text NOT NULL,
	`reason` text NOT NULL,
	`priority` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`created_by` text NOT NULL
);
