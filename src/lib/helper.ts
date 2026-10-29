// export const isAbortError = (error: unknown) => {
//   if (error instanceof DOMException && error.name === "AbortError") return true
//   if (
//     error instanceof TRPCClientError &&
//     error.message.toLowerCase().includes("abort")
//   )
//     return true
//   // fetch 被取消时有时是 Cause 里带 AbortError
//   if (error instanceof Error && error.name === "AbortError") return true
//   return false
// }

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// interface PostgresError {
//   code: string
//   detail?: string
//   constraint?: string
//   table?: string
// }

// export function isPostgresError(obj: unknown): obj is PostgresError {
//   return (
//     typeof obj === "object" &&
//     obj !== null &&
//     "code" in obj &&
//     typeof (obj as Record<string, unknown>).code === "string"
//   )
// }
