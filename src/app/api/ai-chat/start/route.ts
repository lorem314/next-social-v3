import { randomUUID } from "crypto"
import { after } from "next/server"
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai"
import { createResumableStreamContext } from "resumable-stream"
import { asc, eq } from "drizzle-orm"

import { uploadFilesToS3, type UploadedFile } from "@/lib/s3"
import { getAuthedUser } from "@/lib/auth"
import { db } from "@/db"
import { chatTable, uiMessageTable } from "@/db/schema"
import { languageModel } from "@/lib/ai"
import { getRedisPublisher, getRedisSubscriber } from "@/lib/redis"

export const maxDuration = 60

export async function POST(req: Request) {
  console.log("Start a new chat")

  const form = await req.formData()
  const message = form.get("message") as string | null
  const isDeepThink = form.get("isDeepThink") === "true" ? true : false
  const files = form.getAll("files") as File[] | null

  console.log("message", message)
  console.log("isDeepThink", isDeepThink)
  console.log("files", files)

  // get userId
  const authedUser = await getAuthedUser()
  console.log("authedUser", authedUser)
  if (!authedUser) {
    return Response.json({ error: "请先登录" }, { status: 400 })
  }
  const userId = authedUser.id

  const chatId = randomUUID()
  const messageId = randomUUID()

  let uploaded: UploadedFile[] = []
  try {
    if (files && files.length > 0) {
      uploaded = await uploadFilesToS3(files, { chatId })
    }
  } catch (error) {
    console.error("uploadFilesToS3 failed", error)
    return Response.json({ error: "保存图片失败" }, { status: 400 })
  }

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
    ...(message
      ? ([{ type: "text", text: message }] as UIMessage["parts"])
      : []),
  ]

  if (parts.length === 0) {
    return Response.json({ error: "消息不能为空" }, { status: 400 })
  }

  // ---------- 2) 先写库：chat + user message ----------
  try {
    const chat = await db.transaction(async (tx) => {
      // check if exist
      const [isExisting] = await tx
        .select({ id: chatTable.id })
        .from(chatTable)
        .where(eq(chatTable.id, chatId))
        .limit(1)

      if (isExisting) {
        await tx
          .update(chatTable)
          .set({ activeStreamId: null, updatedAt: new Date() })
          .where(eq(chatTable.id, chatId))
        throw "chatId 已存在"
      }

      const newChat = await tx
        .insert(chatTable)
        .values({
          id: chatId,
          userId,
          title: message ? message.slice(0, 30) : "新的对话",
          activeStreamId: null,
        })
        .returning({
          id: chatTable.id,
          title: chatTable.title,
          createdAt: chatTable.createdAt,
        })

      await tx.insert(uiMessageTable).values({
        id: messageId,
        chatId,
        role: "user",
        parts,
      })

      return newChat
    })

    // ---------- 3) 后台开流（不阻塞响应）----------
    after(async () => {
      try {
        await runChatGeneration(chatId, {
          isDeepThink,
          files: files ?? [],
          message,
          currentMessageId: messageId,
        })
      } catch (error) {
        console.error("runChatGeneration failed", error)
        await db
          .update(chatTable)
          .set({ activeStreamId: null, updatedAt: new Date() })
          .where(eq(chatTable.id, chatId))
      }
    })

    return Response.json({
      chatId,
      chat,
      uploaded,
    })
  } catch (error) {
    return Response.json({ message: error }, { status: 400 })
  }
}

async function runChatGeneration(
  chatId: string,
  options: {
    isDeepThink?: boolean
    files?: File[]
    message?: string | null
    currentMessageId?: string
  },
) {
  const { isDeepThink, files = [], message, currentMessageId } = options

  console.log("runChatGeneration")

  const rows = await db
    .select()
    .from(uiMessageTable)
    .where(eq(uiMessageTable.chatId, chatId))
    .orderBy(asc(uiMessageTable.createdAt))
  console.log("find uiMessages")

  const historicalMessages: UIMessage[] = rows
    .filter((m) => m.id !== currentMessageId)
    .map((m) => ({
      id: m.id,
      role: m.role as UIMessage["role"],
      parts: m.parts as UIMessage["parts"],
    }))

  const filePartsFromFrontend =
    files.length > 0 ? await filesToDataUrlParts(files) : []

  const currentUserParts: UIMessage["parts"] = [
    ...filePartsFromFrontend,
    ...(message
      ? ([{ type: "text", text: message }] as UIMessage["parts"])
      : []),
  ]

  const currentUserMessage: UIMessage = {
    id: currentMessageId ?? randomUUID(),
    role: "user",
    parts: currentUserParts,
  }

  const uiMessagesForModel: UIMessage[] = [
    ...historicalMessages,
    currentUserMessage,
  ]
  //

  const streamId = randomUUID()
  console.log("streamId", streamId)

  try {
    const result = streamText({
      model: languageModel,
      messages: await convertToModelMessages(uiMessagesForModel),
      providerOptions: {
        dashscope: {
          enable_thinking: isDeepThink,
          reasoning_effort: isDeepThink ? "xhigh" : "low",
        },
      },
    })
    console.log("after streamText")

    const uiMessagesFromDb: UIMessage[] = rows.map((m) => ({
      id: m.id,
      role: m.role as UIMessage["role"],
      parts: m.parts as UIMessage["parts"],
      metadata: { createdAt: m.createdAt },
    }))

    const streamResponse = createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        originalMessages: uiMessagesFromDb,
        generateMessageId: () => randomUUID(),
        onEnd: async ({ responseMessage }) => {
          console.log("onEnd parts", responseMessage.parts)
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
          console.log("after insert to uiMessageTable")
          await db
            .update(chatTable)
            .set({ activeStreamId: null, updatedAt: new Date() })
            .where(eq(chatTable.id, chatId))
          console.log("after set activeStreamId to null")
        },
      }),
      async consumeSseStream({ stream }) {
        console.log("consumeSseStream start")
        const ctx = createResumableStreamContext({
          waitUntil: after,
          publisher: getRedisPublisher(),
          subscriber: getRedisSubscriber(),
        })
        await ctx.createNewResumableStream(streamId, () => stream)
        console.log(`set ${chatId} activeStreamId to`, streamId)
        await db
          .update(chatTable)
          .set({ activeStreamId: streamId, updatedAt: new Date() })
          .where(eq(chatTable.id, chatId))
        console.log("consumeSseStream end")
      },
    })
    console.log("after streamResponse")

    if (streamResponse.body) {
      await streamResponse.body.pipeTo(
        new WritableStream({
          write() {},
        }),
      )
    }
  } catch (error) {
    console.error("streamText or createUIMessageStreamResponse error", error)
  } finally {
    console.log("runChatGeneration finally")
    await db
      .update(chatTable)
      .set({ activeStreamId: null, updatedAt: new Date() })
      .where(eq(chatTable.id, chatId))
  }
}

async function filesToDataUrlParts(files: File[]): Promise<UIMessage["parts"]> {
  return Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const base64 = buffer.toString("base64")
      const mediaType = file.type || "application/octet-stream"
      return {
        type: "file" as const,
        mediaType,
        url: `data:${mediaType};base64,${base64}`,
        filename: file.name || "file",
      }
    }),
  )
}
