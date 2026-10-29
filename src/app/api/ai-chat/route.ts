import { randomUUID } from "crypto"
import { after } from "next/server"
import { createResumableStreamContext } from "resumable-stream"
import { eq } from "drizzle-orm"

import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
} from "ai"

import { languageModel } from "@/lib/ai"
import { uploadDataUrlToS3, type UploadedFile } from "@/lib/s3"
import { db } from "@/db"
import { chatTable, uiMessageTable } from "@/db/schema"
import { getRedisPublisher, getRedisSubscriber } from "@/lib/redis"

type ReqJson = {
  messages: UIMessage[]
  isDeepThink: boolean
  chatId: string
}

export async function POST(req: Request) {
  const { messages, isDeepThink, chatId } = (await req.json()) as ReqJson

  const lastMessage = messages.at(-1)
  const fileParts = lastMessage?.parts.filter((part) => part.type === "file")
  let uploaded: UploadedFile[] = []
  if (fileParts) {
    uploaded = await Promise.all(
      fileParts.map((part) => {
        return uploadDataUrlToS3(
          part.url,
          part.filename || "random file name",
          { chatId },
        )
      }),
    )
  }
  const textPart = lastMessage?.parts.find((part) => part.type === "text")

  const parts: UIMessage["parts"] = [
    ...uploaded.map(
      (f) =>
        ({
          type: "file",
          mediaType: f.mediaType,
          url: f.url,
          filename: f.filename,
        }) as UIMessage["parts"][number],
    ),
    ...(textPart
      ? ([{ type: "text", text: textPart.text }] as UIMessage["parts"])
      : []),
  ]

  if (parts.length === 0) {
    return Response.json({ error: "消息不能为空" }, { status: 400 })
  }

  try {
    // save user message to db
    await db
      .insert(uiMessageTable)
      .values({ id: lastMessage?.id, chatId, role: "user", parts })
  } catch (error) {
    return new Response(JSON.stringify({ error: "保存消息失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const streamId = randomUUID()
  console.log("streamId", streamId)

  const result = streamText({
    model: languageModel,
    messages: await convertToModelMessages(messages),
    providerOptions: {
      dashscope: {
        enable_thinking: isDeepThink,
        reasoning_effort: isDeepThink ? "xhigh" : "low",
      },
    },
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      generateMessageId: () => randomUUID(),
      onEnd: async ({ responseMessage }) => {
        // detect file part
        console.log("[/api/ai-chat] POST onEnd insert uiMessageTable")
        await db
          .insert(uiMessageTable)
          .values({
            id: responseMessage.id,
            chatId,
            role: responseMessage.role,
            parts: responseMessage.parts,
          })
          .onConflictDoUpdate({
            target: uiMessageTable.id,
            set: { parts: responseMessage.parts },
          })
        console.log("[/api/ai-chat] POST onEnd set activeStreamId to null")
        await db
          .update(chatTable)
          .set({ activeStreamId: null, updatedAt: new Date() })
          .where(eq(chatTable.id, chatId))
      },
    }),
    async consumeSseStream({ stream }) {
      const ctx = createResumableStreamContext({
        waitUntil: after,
        publisher: getRedisPublisher(),
        subscriber: getRedisSubscriber(),
      })
      await ctx.createNewResumableStream(streamId, () => stream)
      await db
        .update(chatTable)
        .set({ activeStreamId: streamId, updatedAt: new Date() })
        .where(eq(chatTable.id, chatId))
    },
  })
}
