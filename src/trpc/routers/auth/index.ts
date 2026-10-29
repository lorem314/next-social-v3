import { createTRPCRouter } from "@/trpc/init"

import { signup } from "./signup"
import { login } from "./login"
import { refresh } from "./refresh"
import { protectedProcedure } from "@/trpc/init"

export const authRouter = createTRPCRouter({
  signup,
  login,
  refresh,
  test: protectedProcedure.query(async () => {
    console.log("auth test")

    return { test: "ok", time: new Date() }
  }),
})
