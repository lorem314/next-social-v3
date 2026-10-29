"use client"

import { useState, useContext } from "react"
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"

import { makeQueryClient } from "./query-client"
import type { AppRouter } from "./routers/_app"
import { GlobalStoreContext } from "@/providers/global-store-provider"
import { refreshLink } from "./refresh-link"

export const trpc = createTRPCReact<AppRouter>({ abortOnUnmount: true })

let clientQueryClientSingleton: QueryClient

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient()
  }
  return (clientQueryClientSingleton ??= makeQueryClient())
}

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return ""
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
    return "http://localhost:3000"
  })()
  return `${base}/api/trpc`
}

export function TRPCProvider(props: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient()
  // const [queryClient] = useState(() => new QueryClient())
  const store = useContext(GlobalStoreContext)

  if (!store) {
    throw new Error("TRPCProvider must be used within GlobalStoreProvider")
  }

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        refreshLink(store),
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
          headers: () => {
            const accessToken = store.getState().accessToken
            return {
              Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
            }
          },
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
