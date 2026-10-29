// import { after } from "next/server"
// import { UI_MESSAGE_STREAM_HEADERS } from "ai"
// import { createResumableStreamContext } from "resumable-stream"
// import { eq } from "drizzle-orm"

// import { db } from "@/db"
// import { chatTable } from "@/db/schema"

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   const { id } = await params

//   const [chat] = await db
//     .select({ activeStreamId: chatTable.activeStreamId })
//     .from(chatTable)
//     .where(eq(chatTable.id, id))
//     .limit(1)

//   if (!chat?.activeStreamId) {
//     return new Response(null, { status: 204 })
//   }

//   const ctx = createResumableStreamContext({ waitUntil: after })
//   const resumed = await ctx.resumeExistingStream(chat.activeStreamId)

//   if (!resumed) {
//     return new Response(null, { status: 204 })
//   }

//   return new Response(resumed, { headers: UI_MESSAGE_STREAM_HEADERS })
// }
