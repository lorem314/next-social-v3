import { createTRPCRouter } from "@/trpc/init"

import { baseProcedure } from "@/trpc/init"
import { test } from "./test"

export const testRouter = createTRPCRouter({
  hello: baseProcedure.query(() => {
    return { test: "Hello", time: new Date() }
  }),
  test,
})
