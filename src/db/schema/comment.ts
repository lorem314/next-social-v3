import * as pg from "drizzle-orm/pg-core"

import userTable from "./user"
import postTable from "./post"

const commentTable = pg.pgTable(
  "comments",
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
    postId: pg
      .uuid("post_id")
      .references(() => postTable.id, { onDelete: "cascade" })
      .notNull(),
    parentId: pg
      .uuid("parent_id")
      .references((): pg.AnyPgColumn => commentTable.id, {
        onDelete: "cascade",
      }),
  },
  (t) => [
    // 按时间倒序 获取 post/comment 的子 comment
    pg
      .index("post_id_parent_id_created_at_idx")
      .on(t.postId, t.parentId, t.createdAt.desc()),

    // 按点赞数倒序 获取 post/comment 的子 comment
    pg
      .index("post_id_parent_id_likes_count_idx")
      .on(t.postId, t.parentId, t.likesCount.desc()),
  ],
)

export default commentTable
