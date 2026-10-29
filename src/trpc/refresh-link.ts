"use client"

import type { TRPCLink } from "@trpc/client"
import { TRPCClientError } from "@trpc/client"
import type { AnyRouter } from "@trpc/server"
import { observable } from "@trpc/server/observable"

import { GlobalStoreApi } from "@/providers/global-store-provider"

let refreshPromise: Promise<string | null> | null = null

async function doRefresh(store: GlobalStoreApi): Promise<string | null> {
  try {
    // 直接用 fetch 调 refresh，避免再走 tRPC link 造成循环
    const res = await fetch("/api/trpc/auth.refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // 不需要手动带 refreshToken，httpOnly cookie 会自动带上
      credentials: "include",
      body: JSON.stringify({}),
    })

    if (!res.ok) {
      store.getState().setAccessToken(null)
      store.getState().setAuthedUser(null)
      return null
    }

    const json = await res.json()
    // tRPC HTTP 响应格式：{ result: { data: { json: { accessToken, authedUser } } } }
    // 如果你用了 superjson，结构可能略有不同，按实际调整
    const data = json?.result?.data?.json ?? json?.result?.data

    if (!data?.accessToken) {
      store.getState().setAccessToken(null)
      store.getState().setAuthedUser(null)
      return null
    }

    // 更新 Zustand
    store.getState().setAccessToken(data.accessToken)
    if (data.authedUser) {
      store.getState().setAuthedUser(data.authedUser)
    }

    return data.accessToken as string
  } catch {
    store.getState().setAccessToken(null)
    store.getState().setAuthedUser(null)
    return null
  } finally {
    refreshPromise = null
  }
}

export function refreshLink<TRouter extends AnyRouter>(
  store: GlobalStoreApi,
): TRPCLink<TRouter> {
  return () => {
    return ({ next, op }) => {
      return observable((observer) => {
        const unsubscribe = next(op).subscribe({
          next(value) {
            observer.next(value)
          },
          async error(err) {
            // 只处理 401
            if (
              err instanceof TRPCClientError &&
              err.data?.code === "UNAUTHORIZED"
            ) {
              console.log("refresh-link 401")

              // 刷新接口本身 401 就不要再刷了，直接失败
              if (op.path === "auth.refresh") {
                observer.error(err)
                return
              }

              // 多个请求同时 401 时，共用一个 refreshPromise
              if (!refreshPromise) {
                refreshPromise = doRefresh(store)
              }

              const newAccessToken = await refreshPromise

              if (!newAccessToken) {
                // 刷新失败，把错误抛给业务
                observer.error(err)
                return
              }

              // 用新 token 重试原请求
              const retryOp = {
                ...op,
                context: {
                  ...op.context,
                  // 可选：标记这是重试，避免无限循环
                },
              }

              next(retryOp).subscribe({
                next(value) {
                  observer.next(value)
                },
                error(retryErr) {
                  observer.error(retryErr)
                },
                complete() {
                  observer.complete()
                },
              })
            } else {
              observer.error(err)
            }
          },
          complete() {
            observer.complete()
          },
        })

        return unsubscribe
      })
    }
  }
}
