"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronRightIcon,
  ChevronDownIcon,
  BotMessageSquareIcon,
  MessageSquarePlusIcon,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"

import { trpc } from "@/trpc/client"
import { useGlobalStore } from "@/providers/global-store-provider"

export const SidebarNav = () => {
  const pathname = usePathname()

  const authedUser = useGlobalStore((state) => state.authedUser)

  return (
    <SidebarGroup className="py-0">
      <SidebarGroupLabel>AI 聊天</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname === "/ai-chat"}
            tooltip={"新建聊天"}
            render={
              <Link href="/ai-chat">
                <MessageSquarePlusIcon />
                <span>新建聊天</span>
              </Link>
            }
          />
        </SidebarMenuItem>
        {authedUser ? (
          <ChatList userId={authedUser.id} pathname={pathname} />
        ) : null}
      </SidebarMenu>
    </SidebarGroup>
  )
}

const ChatList = ({
  userId,
  pathname,
}: {
  userId: string
  pathname: string
}) => {
  const [isOpen, setIsOpen] = React.useState(true)

  const listAiChatQuery = trpc.aiChat.listByUserId.useQuery(
    { userId },
    // { staleTime: 1000 * 60 },
  )

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      render={
        <SidebarMenuItem>
          <CollapsibleTrigger
            render={
              <SidebarMenuButton tooltip={"聊天历史"}>
                <BotMessageSquareIcon />
                <span className="p-0">聊天历史</span>
                {isOpen ? (
                  <ChevronDownIcon className="ml-auto" />
                ) : (
                  <ChevronRightIcon className="ml-auto" />
                )}
              </SidebarMenuButton>
            }
          />
          <CollapsibleContent>
            {listAiChatQuery.isPending ? (
              <div className="mt-2 flex justify-center">
                <Spinner />
              </div>
            ) : listAiChatQuery.isError ? (
              "error"
            ) : (
              listAiChatQuery.data?.chats.map((chat) => {
                const href = `/ai-chat/c/${chat.id}`
                return (
                  <SidebarMenuSub key={chat.id}>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={pathname === href}
                        render={<Link href={href}>{chat.title}</Link>}
                      />
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )
              })
            )}

            {/* <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  render={<Link href="/">SidebarMenuSubLink</Link>}
                />
              </SidebarMenuSubItem>
            </SidebarMenuSub> */}
          </CollapsibleContent>
        </SidebarMenuItem>
      }
    />
  )
}
