DROP INDEX "page_views_created_at_idx";--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN "date" text NOT NULL;--> statement-breakpoint
CREATE INDEX "page_views_date_idx" ON "page_views" USING btree ("date");