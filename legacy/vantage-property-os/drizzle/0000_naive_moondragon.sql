CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`details` text NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `data_overrides` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`field` text NOT NULL,
	`previous_value` text,
	`new_value` text NOT NULL,
	`source_url` text,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`client_name` text NOT NULL,
	`advisor` text NOT NULL,
	`selected_unit_ids` text NOT NULL,
	`down_percent` integer NOT NULL,
	`term_months` integer NOT NULL,
	`fx_rate` integer NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL
);
