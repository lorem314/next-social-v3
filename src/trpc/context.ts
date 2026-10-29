import { cache } from "react"
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone"
import { cookies, headers } from "next/headers"

// export type Context = {
//   accessToken: string | null
//   refreshToken: string | null
//   isServerCall?: boolean
// }

// inner context for server caller
export function createInnerContext(opts?: {
  accessToken?: string | null
  refreshToken?: string | null
  isServerCall?: boolean
}): Context {
  return {
    accessToken: opts?.accessToken ?? null,
    refreshToken: opts?.refreshToken ?? null,
    isServerCall: opts?.isServerCall ?? false,
  }
}

// outer context for http client
export const createTRPCContext = cache(async () => {
  const cookieStore = await cookies()
  const headersList = await headers()

  const authHeader = headersList.get("authorization")
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null

  const refreshToken = cookieStore.get("refresh-token")?.value || null

  console.log("[>>>>] createTRPCContext refreshToken", refreshToken)

  return {
    accessToken,
    refreshToken,
    isServerCall: false,
  }
})

export type Context = Awaited<ReturnType<typeof createTRPCContext>>
