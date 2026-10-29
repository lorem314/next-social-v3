import * as pg from "drizzle-orm/pg-core"

import userTable from "./user"

const refreshTokenTable = pg.pgTable(
  "refresh_tokens",
  {
    id: pg.serial().primaryKey(),
    value: pg.varchar().notNull(),
    ownerId: pg
      .uuid("owner_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [
    // token 过期时 根据 value 找到对应的 row
    pg.index("value_idx").on(t.value),
  ],
)

export default refreshTokenTable
