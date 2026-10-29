import { redirect } from "next/navigation"

import { trpc, HydrateClient } from "@/trpc/server"
import { getAuthedUser, getAuthedUserIdFromRefreshToken } from "@/lib/auth"

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const authedUserId = await getAuthedUserIdFromRefreshToken()

  if (!authedUserId) {
    redirect("/login")
  }

  await trpc.user.byId.prefetch({
    targetUserId: userId,
    currentUserId: authedUserId,
  })

  return <HydrateClient>{children}</HydrateClient>
}
