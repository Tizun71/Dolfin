ALTER TABLE "pool_history" ALTER COLUMN "pool_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "strategy" ALTER COLUMN "logs" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "strategy" ALTER COLUMN "logs" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "strategy" ADD COLUMN "enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "wallet_address" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "strategy" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_wallet_address_unique" UNIQUE("wallet_address");--> statement-breakpoint
DROP TYPE "public"."strategy_status";