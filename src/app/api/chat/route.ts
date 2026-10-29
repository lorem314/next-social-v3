// import {
//   streamText,
//   convertToModelMessages,
//   createUIMessageStreamResponse,
//   toUIMessageStream,
//   // tool,
// } from "ai"
// // import { z } from "zod"

// import { languageModel } from "@/lib/ai"

// // const API_KEY = process.env.API_KEY
// // const WORKSPACE_ID = process.env.WORKSPACE_ID

// export async function POST(req: Request) {
//   const { messages, isDeepThink } = await req.json()

//   const result = streamText({
//     model: languageModel,
//     messages: await convertToModelMessages(messages),
//     providerOptions: {
//       dashscope: {
//         enable_thinking: isDeepThink,
//         reasoning_effort: isDeepThink ? "xhigh" : "low",
//       },
//     },
//     // tools: {
//     //   generateImage: tool({
//     //     description: "根据描述生成图片",
//     //     inputSchema: z.object({ prompt: z.string() }),
//     //     execute: async ({ prompt }) => {
//     //       const res = await fetch(
//     //         `https://${WORKSPACE_ID}.cn-beijing.maas.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation`,
//     //         {
//     //           method: "POST",
//     //           headers: {
//     //             "Content-Type": "application/json",
//     //             Authorization: `Bearer ${API_KEY}`,
//     //           },
//     //           body: JSON.stringify({
//     //             model: "qwen-image-2.0",
//     //             input: {
//     //               messages: [
//     //                 {
//     //                   role: "user",
//     //                   content: [
//     //                     {
//     //                       text: prompt,
//     //                     },
//     //                   ],
//     //                 },
//     //               ],
//     //             },
//     //           }),
//     //         },
//     //       )

//     //       if (!res.ok) throw Error("api error")

//     //       const data = await res.json()
//     //       const url = data.output?.choices?.[0]?.message?.content?.[0]?.image

//     //       if (!url) throw Error("no url")

//     //       return { url, prompt }
//     //     },
//     //   }),
//     // },
//   })

//   return createUIMessageStreamResponse({
//     stream: toUIMessageStream({ stream: result.stream }),
//   })
// }
