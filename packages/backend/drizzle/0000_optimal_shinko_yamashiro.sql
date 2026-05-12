CREATE TABLE "pool_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pool_id" bigserial NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pool" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"symbol" varchar NOT NULL,
	"address" varchar NOT NULL,
	"name" varchar NOT NULL,
	"image_url" varchar NOT NULL,
	CONSTRAINT "pool_address_unique" UNIQUE("address")
);
