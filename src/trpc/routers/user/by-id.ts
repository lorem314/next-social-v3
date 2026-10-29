import { eq } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { baseProcedure } from "@/trpc/init"
import { db } from "@/db"
import { userTable, userFollowsUserTable } from "@/db/schema"

const byId = baseProcedure
  .input(z.object({ targetUserId: z.string(), currentUserId: z.string() }))
  .query(async (opts) => {
    const userId = opts.input.targetUserId
    const currentUserId = opts.input.currentUserId

    try {
      const user = await db.query.userTable.findFirst({
        columns: {
          id: true,
          email: true,
          nickname: true,
          about: true,
          createdAt: true,
          followersCount: true,
          followeesCount: true,
          postsCount: true,
        },
        where: { id: userId },
        extras: {
          isFollowed: (table, { sql }) => {
            if (!currentUserId) return sql<boolean>`false`
            return sql<boolean>`
              EXISTS (
                SELECT 1
                FROM ${userFollowsUserTable}
                WHERE ${userFollowsUserTable.followerId} = ${currentUserId}
                  AND ${userFollowsUserTable.followeeId} = ${table.id}
              )
            `
          },
        },
      })

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" })
      }

      const { isFollowed, ...rest } = user

      return {
        user: rest,
        isFollowed,
      }
    } catch (error) {
      console.error("error", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "获取用户数据失败",
      })
    }
  })

export default byId
