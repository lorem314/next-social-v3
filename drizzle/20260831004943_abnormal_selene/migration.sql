CREATE TABLE "refresh_tokens" (
	"id" serial PRIMARY KEY,
	"value" varchar NOT NULL,
	"owner_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE INDEX "value_idx" ON "refresh_tokens" ("value");--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE;