import * as pg from "drizzle-orm/pg-core"

import userTable from "./user"
import commentTable from "./comment"

const userLikesCommentTable = pg.pgTable(
  "user_likes_comment",
  {
    id: pg.serial().primaryKey(),
    userId: pg
      .uuid("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    commentId: pg
      .uuid("comment_id")
      .references(() => commentTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // userId 最近点赞的 commentId
    pg.index("user_id_comment_id_idx").on(t.userId, t.commentId),
    // 防止重复
    pg.unique("user_likes_comment_uniq").on(t.userId, t.commentId),
  ],
)

export default userLikesCommentTable
