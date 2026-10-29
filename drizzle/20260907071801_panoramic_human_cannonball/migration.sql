CREATE TYPE "ai_chat_message_role_enum" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TABLE "chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text DEFAULT '新的对话' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"active_stream_id" uuid,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ui-messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"role" "ai_chat_message_role_enum" NOT NULL,
	"parts" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"chat_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ui-messages" ADD CONSTRAINT "ui-messages_chat_id_chats_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE;