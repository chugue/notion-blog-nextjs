CREATE TABLE "notion_record_maps" (
	"id" text PRIMARY KEY NOT NULL,
	"record_map" jsonb NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL
);
