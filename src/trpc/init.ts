import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { JWTPayload, jwtVerify, SignJWT } from "jose"

import { type Context } from "./context"
import { getUserFromAccessToken, getAuthedUser } from "@/lib/auth"

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!)

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts
    return {
      ...shape,
      data: {
        ...shape.data,
        targetField:
          error.cause &&
          typeof error.cause === "object" &&
          "target" in error.cause
            ? (error.cause as any).target
            : null,
      },
    }
  },
})

const hasLogin = t.middleware(async ({ ctx, next }) => {
  // console.log("[middleware] hasLogin", ctx)
  console.log("[hasLogin] ctx.isServerCall", ctx.isServerCall)

  let authedUserId: string | null = null
  if (ctx.isServerCall) {
    const authedUser = await getAuthedUser()
    if (!authedUser) authedUserId = null
    else authedUserId = authedUser.id
  } else {
    const user = await getUserFromAccessToken(ctx.accessToken)
    if (!user) authedUserId = null
    else authedUserId = user.id
  }

  // const user = await getUserFromAccessToken(ctx.accessToken)
  // console.log("[middleware] user", user)

  if (!authedUserId) {
    console.log("[hasLogin] no user")
    throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" })
  }

  return next({ ctx: { ...ctx, authedUserId } })
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

export const baseProcedure = t.procedure.use(async ({ ctx, next }) => {
  console.log("[>>>>] baseProcedure middleware")
  console.log("[>>>>]   ctx.isServerCall", ctx.isServerCall)
  console.log("[>>>>]   ctx.refreshToken", ctx.refreshToken)

  if (ctx.isServerCall && ctx.refreshToken) {
    try {
      const { payload } = await jwtVerify<{ authedUserId: string }>(
        ctx.refreshToken,
        jwtSecret,
        { algorithms: ["HS256"] },
      )
      console.log("[>>>>]   payload", payload)
      return next({ ctx: { currentUserId: payload.authedUserId } })
    } catch (error: any) {
      if (error.code === "ERR_JWT_EXPIRED") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "AccessToken expired",
        })
      }
    }
  }

  if (ctx.accessToken) {
    try {
      const { payload } = await jwtVerify<{ authedUserId: string }>(
        ctx.accessToken,
        jwtSecret,
        { algorithms: ["HS256"] },
      )
      return next({ ctx: { currentUserId: payload.authedUserId } })
    } catch (error: any) {
      if (error.code === "ERR_JWT_EXPIRED") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "AccessToken expired",
        })
      }
    }
  }

  return next({ ctx })
})

export const protectedProcedure = t.procedure.use(hasLogin)
