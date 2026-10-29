import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { TRPCError } from "@trpc/server"
import { DatabaseError } from "pg"
import { DrizzleQueryError } from "drizzle-orm"
import ms from "ms"
import { SignJWT, jwtVerify } from "jose"

import { baseProcedure } from "@/trpc/init"
import { insertUserSchema } from "@/lib/schema/user"
import { refreshTokenTable, userTable } from "@/db/schema"
import { db } from "@/db"
import { config } from "@/config"
import { generateAccessToken, generateRefreshToken } from "@/lib/auth"

const JWT_SECRET = process.env.JWT_SECRET as string
const jwtSecret = new TextEncoder().encode(JWT_SECRET)

export const refresh = baseProcedure.mutation(async ({ ctx }) => {
  console.log("[refresh]")

  const refreshToken = ctx.refreshToken

  if (!refreshToken) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "没有 refreshToken" })
  }

  try {
    const { payload } = await jwtVerify(refreshToken, jwtSecret, {
      algorithms: ["HS256"],
    })

    const userId = payload.authedUserId
    if (typeof userId !== "string") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "无效的 refreshToken",
      })
    }

    // 查库确认用户还在
    const [user] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1)

    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "用户不存在" })
    }

    const accessToken = await generateAccessToken({ authedUserId: user.id })

    return {
      accessToken,
    }
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "refreshToken 无效或已过期",
    })
  }
})
