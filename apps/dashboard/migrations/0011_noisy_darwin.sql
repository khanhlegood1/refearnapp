CREATE TABLE IF NOT EXISTS "appsumo_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"tier" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"redeemed_at" timestamp,
	CONSTRAINT "appsumo_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appsumo_keys" ADD CONSTRAINT "appsumo_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appsumo_keys_key_idx" ON "appsumo_keys" USING btree ("key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appsumo_keys_user_id_idx" ON "appsumo_keys" USING btree ("user_id");