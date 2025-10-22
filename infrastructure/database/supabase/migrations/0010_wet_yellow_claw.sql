ALTER TABLE "tag_info" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tag_info" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tag_info" ADD CONSTRAINT "tag_info_name_unique" UNIQUE("name");