CREATE TYPE "public"."strategy_status" AS ENUM('initializing', 'running', 'waiting', 'executing', 'error', 'stopped');--> statement-breakpoint
CREATE TABLE "strategy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"status" "strategy_status" DEFAULT 'initializing' NOT NULL,
	"logs" json DEFAULT '[]'::json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "strategy" ADD CONSTRAINT "strategy_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;