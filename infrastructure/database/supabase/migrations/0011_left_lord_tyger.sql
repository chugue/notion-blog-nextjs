ALTER TABLE "tag_info" RENAME TO "tag_filter_item";--> statement-breakpoint
ALTER TABLE "tag_filter_item" DROP CONSTRAINT "tag_info_name_unique";--> statement-breakpoint
DROP INDEX "tag_info_id_idx";--> statement-breakpoint
DROP INDEX "tag_info_name_idx";--> statement-breakpoint
CREATE INDEX "tag_filter_item_name_idx" ON "tag_filter_item" USING btree ("name");--> statement-breakpoint
ALTER TABLE "tag_filter_item" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "tag_filter_item" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "tag_filter_item" ADD CONSTRAINT "tag_filter_item_name_unique" UNIQUE("name");