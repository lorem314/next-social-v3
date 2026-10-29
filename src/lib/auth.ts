import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { eq } from "drizzle-orm"
import { JWTPayload, jwtVerify, SignJWT } from "jose"

import { db } from "@/db"
import { userTable } from "@/db/schema"
import { type GlobalStore } from "@/stores/global-store"
import { config } from "@/config"

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!)

export const getAuthedUser = cache(
  async (): Promise<GlobalStore["authedUser"] | null> => {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refresh-token")?.value

    if (!refreshToken) return null

    try {
      const { payload } = await jwtVerify(refreshToken, jwtSecret, {
        algorithms: ["HS256"],
      })

      const userId = payload.authedUserId
      if (typeof userId !== "string") return null

      console.log("getAuthedUser")
      const [user] = await db
        .select({
          id: userTable.id,
          nickname: userTable.nickname,
          email: userTable.email,
        })
        .from(userTable)
        .where(eq(userTable.id, userId))
        .limit(1)

      return user ?? null
    } catch (e) {
      // token 无效 / 过期 / 签名错误 等都当作未登录
      console.log("[lib/auth.ts] jwtVerify error", e)
      return null
    }
  },
)

export const getAuthedUserIdFromRefreshToken = cache(async () => {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refresh-token")?.value

  if (!refreshToken) return null

  try {
    const { payload } = await jwtVerify(refreshToken, jwtSecret, {
      algorithms: ["HS256"],
    })

    const authedUserId = payload.authedUserId
    if (typeof authedUserId !== "string") return null

    return authedUserId
  } catch (error) {
    return null
  }
})

export async function getUserFromAccessToken(
  accessToken: string | null,
): Promise<{ id: string } | null> {
  if (!accessToken) return null

  try {
    const { payload } = await jwtVerify(accessToken, jwtSecret, {
      algorithms: ["HS256"],
    })

    // console.log("[getUserFromAccessToken] payload", payload)

    const userId = payload.authedUserId
    if (typeof userId !== "string") return null

    console.log("getUserFromAccessToken")
    const [user] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1)

    return user ?? null
  } catch {
    return null
  }
}

export const generateAccessToken = async (payload: JWTPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.ACCESS_TOKEN_EXP)
    .sign(jwtSecret)
}

export const generateRefreshToken = async (payload: JWTPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.REFRESH_TOKEN_EXP)
    .sign(jwtSecret)
}
