import * as pg from "drizzle-orm/pg-core"

import userTable from "./user"

const userFollowsUserTable = pg.pgTable(
  "user_follows_user",
  {
    id: pg.serial().primaryKey(),
    followerId: pg
      .uuid("follower_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    followeeId: pg
      .uuid("followee_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // 获取 userId 的所有关注 按时间降序
    pg.index("follower_id_created_at_idx").on(t.followerId, t.createdAt),
    // 获取 userId 的所有粉丝 按时间降序
    pg.index("followee_id_created_at_idx").on(t.followeeId, t.createdAt),
    // 防止重复
    pg.unique("user_follows_user_uniq").on(t.followerId, t.followeeId),
  ],
)

export default userFollowsUserTable
