import { type UIMessage } from "ai"

export type AiChatFile = {
  id: string
  url: string
  file: File
}

export type MyUIMessage = UIMessage<{ createdAt?: Date }>
