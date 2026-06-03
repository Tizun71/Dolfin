CREATE TABLE "agent_action" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"action_type" varchar NOT NULL,
	"action_label" text NOT NULL,
	"protocol" varchar NOT NULL,
	"asset_symbol" varchar,
	"asset_address" varchar,
	"amount_raw" bigint NOT NULL,
	"amount_usd" numeric,
	"transaction_hash" varchar,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "agent_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"smart_account" varchar NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"session_key" text,
	"policy" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"smart_account" varchar NOT NULL,
	"wallet" varchar NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" varchar DEFAULT 'running' NOT NULL,
	"error" text,
	"advice" text,
	"risk_level" varchar,
	"risk_score" numeric,
	"portfolio_snapshot" jsonb
);
--> statement-breakpoint
DROP TABLE "strategy_instance" CASCADE;--> statement-breakpoint
DROP TABLE "strategy" CASCADE;--> statement-breakpoint
ALTER TABLE "agent_action" ADD CONSTRAINT "agent_action_run_id_agent_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."agent_run"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_config" ADD CONSTRAINT "agent_config_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_run" ADD CONSTRAINT "agent_run_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_action_run_idx" ON "agent_action" USING btree ("run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agent_config_user_smart_account_unique" ON "agent_config" USING btree ("user_id","smart_account");--> statement-breakpoint
CREATE INDEX "agent_run_user_started_idx" ON "agent_run" USING btree ("user_id","smart_account","started_at");