import { Card } from "@/components/ui/card"
import { MessageScrollerProvider } from "@/components/ui/message-scroller"

import { trpc, HydrateClient } from "@/trpc/server"

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = await params
  await trpc.aiChat.listMessageByChatId.prefetch({ chatId })

  return (
    <div className="relative flex flex-col gap-4">
      <Card className="bg-background mx-auto h-svh w-full gap-0 rounded-none p-0 ring-0">
        <div className="flex-1 overflow-hidden">
          <MessageScrollerProvider autoScroll>
            <HydrateClient>{children}</HydrateClient>
          </MessageScrollerProvider>
        </div>
      </Card>
    </div>
  )
}
