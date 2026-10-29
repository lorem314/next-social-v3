import * as pg from "drizzle-orm/pg-core"

import userTable from "./user"
import postTable from "./post"

const userLikesPostTable = pg.pgTable(
  "user_likes_post",
  {
    id: pg.serial().primaryKey(),
    userId: pg
      .uuid("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    postId: pg
      .uuid("post_id")
      .references(() => postTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // ... 等 999 人点赞
    pg.index("post_id_created_at_idx").on(t.postId, t.createdAt.desc()),

    // userId 最近点赞的 postId
    pg.index("user_id_post_id_idx").on(t.userId, t.postId),

    // 防止重复
    pg.unique("user_likes_post_uniq").on(t.userId, t.postId),
  ],
)

export default userLikesPostTable
