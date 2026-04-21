ALTER TABLE "affiliate" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "affiliate" ADD COLUMN "applied_at" timestamp;--> statement-breakpoint
ALTER TABLE "affiliate" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "affiliate" ADD COLUMN "tos_accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "affiliate" ADD COLUMN "tos_accepted_ip" text;--> statement-breakpoint
ALTER TABLE "affiliate" ADD COLUMN "signup_ip" text;