CREATE TABLE "tag_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "tag_info_id_idx" ON "tag_info" USING btree ("id");--> statement-breakpoint
CREATE INDEX "tag_info_name_idx" ON "tag_info" USING btree ("name");