import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { TRPCError } from "@trpc/server"
import { DatabaseError } from "pg"
import { DrizzleQueryError } from "drizzle-orm"
import ms from "ms"
import { SignJWT } from "jose"

import { baseProcedure } from "@/trpc/init"
import { insertUserSchema } from "@/lib/schema/user"
import { refreshTokenTable, userTable } from "@/db/schema"
import { db } from "@/db"
import { config } from "@/config"
import { generateAccessToken, generateRefreshToken } from "@/lib/auth"

const JWT_SECRET = process.env.JWT_SECRET as string
const jwtSecret = new TextEncoder().encode(JWT_SECRET)

export const login = baseProcedure
  .input(
    insertUserSchema.pick({
      email: true,
      password: true,
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const [user] = await db
      .select({
        id: userTable.id,
        nickname: userTable.nickname,
        email: userTable.email,
        hashedPassword: userTable.hashedPassword,
      })
      .from(userTable)
      .where(eq(userTable.email, input.email))
      .limit(1)

    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "邮箱未被注册",
        cause: { target: "email" },
      })
    }

    const match = await bcrypt.compare(input.password, user.hashedPassword)
    if (!match) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "密码不正确",
        cause: { target: "password" },
      })
    }

    const payload = { authedUserId: user.id }
    const accessToken = await generateAccessToken(payload)
    const refreshToken = await generateRefreshToken(payload)

    await db.insert(refreshTokenTable).values({
      value: refreshToken,
      ownerId: user.id,
    })

    const cookieStore = await cookies()
    cookieStore.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ms(config.REFRESH_TOKEN_EXP) / 1000,
    })

    return {
      accessToken,
      authedUser: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
      },
    }
  })
