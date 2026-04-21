ALTER TABLE "affiliate_invoice" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "affiliate_invoice" ADD COLUMN "suspicion_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "affiliate_invoice" ADD COLUMN "suspicion_reasons" text[];--> statement-breakpoint
ALTER TABLE "affiliate_invoice" ADD COLUMN "hold_until" timestamp;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "is_private" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "program_type" text DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "minimum_payout_threshold" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "tos_url" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "hold_period_days" integer DEFAULT 45 NOT NULL;