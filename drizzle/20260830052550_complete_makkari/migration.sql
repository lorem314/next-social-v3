CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"nickname" varchar NOT NULL,
	"email" varchar NOT NULL UNIQUE,
	"hashed_password" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
