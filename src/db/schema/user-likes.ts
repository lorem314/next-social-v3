import * as pg from "drizzle-orm/pg-core"

import userTable from "./user"

export const likeableTypeEnum = pg.pgEnum("likeable_type", ["post", "comment"])

const userLikesTable = pg.pgTable(
  "user_likes",
  {
    id: pg.serial().primaryKey(),
    userId: pg
      .uuid("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    likeableType: likeableTypeEnum("likeable_type").notNull(),
    likeableId: pg.uuid("likeable_id").notNull(), // postId / commentId
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // likeableId 的最近点赞用户
    pg.index("likeable_id_created_at_idx").on(t.likeableId, t.createdAt),

    // userId 的最近点赞
    pg.index("user_id_created_at_idx").on(t.userId, t.createdAt),

    // 防止重复
    pg.unique("user_likes_uniq").on(t.userId, t.likeableType, t.likeableId),
  ],
)

export default userLikesTable
