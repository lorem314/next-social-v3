import { asc, eq } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { protectedProcedure } from "@/trpc/init"
import { uiMessageTable } from "@/db/schema"
import { db } from "@/db"

const listMessageByChatId = protectedProcedure
  .input(z.object({ chatId: z.string() }))
  .query(async ({ input }) => {
    try {
      const { chatId } = input

      const uiMessages = await db
        .select({
          id: uiMessageTable.id,
          role: uiMessageTable.role,
          parts: uiMessageTable.parts,
          createdAt: uiMessageTable.createdAt,
        })
        .from(uiMessageTable)
        .where(eq(uiMessageTable.chatId, chatId))
        .orderBy(asc(uiMessageTable.createdAt))

      // console.log("uiMessages", uiMessages)
      return {
        uiMessages: uiMessages.map((uiMessage) => {
          return {
            id: uiMessage.id,
            role: uiMessage.role,
            parts: uiMessage.parts,
            metadata: {
              createdAt: uiMessage.createdAt,
            },
          }
        }),
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "出错了",
      })
    }
  })

export default listMessageByChatId
