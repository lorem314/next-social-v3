import * as pg from "drizzle-orm/pg-core"

const userTable = pg.pgTable(
  "users",
  {
    id: pg.uuid().primaryKey().defaultRandom(),
    email: pg.varchar().unique().notNull(),
    nickname: pg.varchar().notNull(),
    about: pg.text(),
    hashedPassword: pg.varchar("hashed_password").notNull(),
    createdAt: pg
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    followersCount: pg.integer("followers_count").default(0).notNull(), // 粉丝
    followeesCount: pg.integer("followees_count").default(0).notNull(), // 关注
    postsCount: pg.integer("posts_count").default(0).notNull(),
    // avatarUrl: pg.varchar(),
    // avatarVersion: pg.integer("avatar_version").default(0).notNull(),
    // avatarContentType: pg.varchar("avatar_content_type"),
  },
  (t) => [
    // 按照粉丝数排序
    pg.index("followers_count_idx").on(t.followersCount.desc()),
    // email index
    pg.index("email_idx").on(t.email),
  ],
)

export default userTable
