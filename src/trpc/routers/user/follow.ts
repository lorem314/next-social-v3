import { eq, sql } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { protectedProcedure } from "@/trpc/init"
import { db } from "@/db"
import { userTable, userFollowsUserTable } from "@/db/schema"

const follow = protectedProcedure
  .input(z.object({ userId: z.string() }))
  .mutation(async (opts) => {
    console.log("follow")
    console.log("opts.ctx.authedUserId", opts.ctx.authedUserId)
    console.log("opts.input.userId", opts.input.userId)

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(userTable)
          .set({ followersCount: sql`${userTable.followersCount} + 1` })
          .where(eq(userTable.id, opts.input.userId))
        await tx
          .update(userTable)
          .set({ followeesCount: sql`${userTable.followeesCount} + 1` })
          .where(eq(userTable.id, opts.ctx.authedUserId))
        await tx.insert(userFollowsUserTable).values({
          followerId: opts.ctx.authedUserId,
          followeeId: opts.input.userId,
        })
      })
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "关注失败",
      })
    }
  })

export default follow
