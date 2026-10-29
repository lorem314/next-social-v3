import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

const API_KEY = process.env.API_KEY
const WORKSPACE_ID = process.env.WORKSPACE_ID

const provider = createOpenAICompatible({
  apiKey: API_KEY,
  baseURL: `https://${WORKSPACE_ID}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1`,
  name: "dashscope",
})

export const languageModel = provider("qwen3.7-plus")
