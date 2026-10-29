import * as pg from "drizzle-orm/pg-core"

import chatTable from "./chat"

export const roleEnum = pg.pgEnum("ai_chat_message_role_enum", [
  "user",
  "assistant",
  "system",
])

const uiMessageTable = pg.pgTable("ui-messages", {
  id: pg.uuid().primaryKey().defaultRandom(),
  role: roleEnum().notNull(),
  parts: pg.jsonb().notNull(),

  createdAt: pg.timestamp("created_at").defaultNow().notNull(),
  chatId: pg
    .uuid("chat_id")
    .notNull()
    .references(() => chatTable.id, { onDelete: "cascade" }),
})

export default uiMessageTable
