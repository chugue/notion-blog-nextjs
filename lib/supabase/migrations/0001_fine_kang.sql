ALTER TABLE "page_views" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "site_metrics" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "site_metrics" ALTER COLUMN "total_visits" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "site_metrics" ALTER COLUMN "daily_visits" SET NOT NULL;