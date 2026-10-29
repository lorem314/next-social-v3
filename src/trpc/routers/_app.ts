import { z } from "zod"
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import { createCallerFactory } from "@trpc/server/unstable-core-do-not-import"

import { baseProcedure, createTRPCRouter } from "../init"

import { testRouter } from "./test"
import { authRouter } from "./auth"
import { userRouter } from "./user"
import { aiChatRouter } from "./ai-chat"

export const appRouter = createTRPCRouter({
  test0: baseProcedure.query(() => {
    return { message: "Hello World! baseProcedure", time: new Date() }
  }),
  test: testRouter,

  auth: authRouter,
  user: userRouter,
  aiChat: aiChatRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

export type RouterOutputs = inferRouterOutputs<AppRouter>
export type RouterInputs = inferRouterInputs<AppRouter>

createCallerFactory
