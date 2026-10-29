import { createTRPCRouter } from "@/trpc/init"

import listByUserId from "./list-by-user-id"
import listMessageByChatId from "./list-message-by-chat-id"

export const aiChatRouter = createTRPCRouter({
  listByUserId,
  listMessageByChatId,
})
