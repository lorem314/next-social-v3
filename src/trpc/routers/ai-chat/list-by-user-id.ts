import { desc, eq } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { DatabaseError } from "pg"
import { DrizzleQueryError } from "drizzle-orm"
import ms from "ms"
import { z } from "zod"

import { baseProcedure, protectedProcedure } from "@/trpc/init"
import { refreshTokenTable, userTable, chatTable } from "@/db/schema"
import { db } from "@/db"

const listByUserId = protectedProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    try {
      const { userId } = input

      const chats = await db
        .select({
          id: chatTable.id,
          title: chatTable.title,
          createdAt: chatTable.createdAt,
        })
        .from(chatTable)
        .where(eq(chatTable.userId, userId))
        .orderBy(desc(chatTable.createdAt))

      // console.log("chats", chats.length)

      return { chats }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "出错了",
      })
    }
  })

export default listByUserId
