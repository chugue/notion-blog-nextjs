CREATE TABLE "page_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notion_page_id" text NOT NULL,
	"pathname" text NOT NULL,
	"view_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_views_notion_page_id_unique" UNIQUE("notion_page_id")
);
--> statement-breakpoint
CREATE TABLE "site_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"total_visits" integer DEFAULT 0 NOT NULL,
	"daily_visits" integer DEFAULT 0 NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_metrics_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE INDEX "page_views_notion_page_id_idx" ON "page_views" USING btree ("notion_page_id");--> statement-breakpoint
CREATE INDEX "page_views_pathname_idx" ON "page_views" USING btree ("pathname");--> statement-breakpoint
CREATE INDEX "page_views_created_at_idx" ON "page_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "site_metrics_date_idx" ON "site_metrics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "site_metrics_created_at_idx" ON "site_metrics" USING btree ("created_at");