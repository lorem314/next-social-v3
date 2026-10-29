import * as pg from "drizzle-orm/pg-core"

import userTable from "./user"

const postTable = pg.pgTable(
  "posts",
  {
    id: pg.uuid().primaryKey().defaultRandom(),
    content: pg.text(),
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    likesCount: pg.integer("likes_count").default(0).notNull(),
    commentsCount: pg.integer("comments_count").default(0).notNull(),
    ownerId: pg
      .uuid("owner_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [
    // 查询所有 posts 按时间降序
    pg.index("created_at_idx").on(t.createdAt.desc()),

    // 查询 ownerId 的所有 posts  按时间降序 /users/[userId]/posts 页面
    pg.index("owner_id_created_at_idx").on(t.ownerId, t.createdAt.desc()),

    // 热门帖子索引（点赞数降序 + 时间降序）
    pg
      .index("likes_count_created_at_idx")
      .on(t.likesCount.desc(), t.createdAt.desc()),
  ],
)

export default postTable
