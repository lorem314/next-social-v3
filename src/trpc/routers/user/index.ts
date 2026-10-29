import { createTRPCRouter } from "@/trpc/init"

import byId from "./by-id"
import follow from "./follow"
import unfollow from "./unfollow"

export const userRouter = createTRPCRouter({
  byId,
  follow,
  unfollow,
})
