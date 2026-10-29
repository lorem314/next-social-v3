import { after } from "next/server"
import { UI_MESSAGE_STREAM_HEADERS } from "ai"
import { createResumableStreamContext } from "resumable-stream"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { chatTable } from "@/db/schema"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params

  console.log("resume stream for chat", chatId)

  const [chat] = await db
    .select({ activeStreamId: chatTable.activeStreamId })
    .from(chatTable)
    .where(eq(chatTable.id, chatId))
    .limit(1)

  const activeStreamId = chat.activeStreamId

  if (!activeStreamId) {
    return new Response(null, { status: 204 })
  }

  const ctx = createResumableStreamContext({ waitUntil: after })

  const resumedStream = await ctx.resumeExistingStream(activeStreamId)

  if (!resumedStream) {
    return new Response(null, { status: 204 })
  }

  return new Response(resumedStream, { headers: UI_MESSAGE_STREAM_HEADERS })
}
