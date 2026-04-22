CREATE TABLE "affiliate_invite_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" text NOT NULL,
	"email" text,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_invite_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "affiliate_invite_token" ADD CONSTRAINT "affiliate_invite_token_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;