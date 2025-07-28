CREATE TABLE "tag_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tag_info_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE INDEX "tag_info_name_idx" ON "tag_info" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tag_info_created_at_idx" ON "tag_info" USING btree ("created_at");