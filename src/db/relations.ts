import { defineRelations } from "drizzle-orm"

import * as schema from "./schema"

export const relations = defineRelations(schema, (r) => ({
  userTable: {
    followers: r.many.userTable({
      from: r.userTable.id,
      to: r.userTable.id,
    }),
    followees: r.many.userTable({
      from: r.userTable.id,
      to: r.userTable.id,
    }),
  },

  postTable: {
    user: r.one.userTable({
      from: r.postTable.ownerId,
      to: r.userTable.id,
    }),
    // 一个帖子对应多个点赞记录
    likes: r.many.userLikesTable({
      from: r.postTable.id,
      to: r.userLikesTable.likeableId,
    }),
  },

  commentTable: {
    user: r.one.userTable({
      from: r.commentTable.ownerId,
      to: r.userTable.id,
    }),
    // 一个评论对应多个点赞记录
    likes: r.many.userLikesTable({
      from: r.commentTable.id,
      to: r.userLikesTable.likeableId,
    }),
  },

  userLikesTable: {
    // 点赞的用户（固定的标准外键关联）
    user: r.one.userTable({
      from: r.userLikesTable.userId,
      to: r.userTable.id,
    }),

    // 关联到帖子（逻辑多态外键）
    post: r.one.postTable({
      from: r.userLikesTable.likeableId,
      to: r.postTable.id,
    }),

    // 关联到评论（逻辑多态外键）
    comment: r.one.commentTable({
      from: r.userLikesTable.likeableId,
      to: r.commentTable.id,
    }),
  },

  // userLikesPostTable: {
  //   user: r.one.userTable({
  //     from: r.userLikesPostTable.userId,
  //     to: r.userTable.id,
  //   }),
  //   post: r.one.postTable({
  //     from: r.userLikesPostTable.postId,
  //     to: r.postTable.id,
  //   }),
  // },

  // userLikesCommentTable: {
  //   user: r.one.userTable({
  //     from: r.userLikesCommentTable.userId,
  //     to: r.userTable.id,
  //   }),
  //   comment: r.one.commentTable({
  //     from: r.userLikesCommentTable.commentId,
  //     to: r.commentTable.id,
  //   }),
  // },
}))
