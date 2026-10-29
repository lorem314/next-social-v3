import * as pg from "drizzle-orm/pg-core"

import userTable from "./user"

const chatTable = pg.pgTable("chats", {
  id: pg.uuid().primaryKey().defaultRandom(),
  title: pg.text().notNull().default("新的对话"),
  createdAt: pg.timestamp("created_at").defaultNow().notNull(),
  updatedAt: pg.timestamp("updated_at").defaultNow().notNull(),
  activeStreamId: pg.uuid("active_stream_id"),
  userId: pg
    .uuid()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
})

export default chatTable
