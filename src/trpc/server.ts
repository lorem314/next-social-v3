import { cache } from "react"
import { createHydrationHelpers } from "@trpc/react-query/rsc"

import { createCallerFactory } from "./init"
import { createTRPCContext, createInnerContext } from "./context"
import { makeQueryClient } from "./query-client"
import { appRouter, AppRouter } from "./routers/_app"

const createCaller = createCallerFactory(appRouter)

// const getContext = cache(() => createTRPCContext())
// export const caller = async () => createCaller(await getContext())

/** 给 createHydrationHelpers：传入「会返回 ctx 的函数」 */
// const getCaller = createCaller(createTRPCContext)

// const getCaller = createCaller({
//   ...(await createTRPCContext()),
//   isServerCall: true,
// })
// 注意：createTRPCContext 必须是 () => Promise<Context> 或 () => Context
// 且内部自己用 headers()，不要依赖 Request 参数

const getCaller = createCaller(
  createInnerContext({
    accessToken: null, // 或你自己传入的值
    refreshToken: null,
    isServerCall: true, // 标记这是服务端调用
  }),
)

export const getQueryClient = cache(makeQueryClient)

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  getCaller,
  getQueryClient,
)
