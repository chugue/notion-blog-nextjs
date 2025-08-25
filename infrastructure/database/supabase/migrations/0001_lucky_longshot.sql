CREATE TABLE "visitor_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_hash" text NOT NULL,
	"user_agent" text NOT NULL,
	"date" text NOT NULL,
	"visited_pathnames" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "visitor_info_ip_hash_unique" UNIQUE("ip_hash")
);
--> statement-breakpoint
CREATE INDEX "visitor_info_ip_hash_idx" ON "visitor_info" USING btree ("ip_hash");--> statement-breakpoint
CREATE INDEX "visitor_info_user_agent_idx" ON "visitor_info" USING btree ("user_agent");--> statement-breakpoint
CREATE INDEX "visitor_info_date_idx" ON "visitor_info" USING btree ("date");--> statement-breakpoint
CREATE INDEX "visitor_info_visited_pathnames_idx" ON "visitor_info" USING btree ("visited_pathnames");