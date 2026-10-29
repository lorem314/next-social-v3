"use client"

import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroup,
} from "@/components/ui/sidebar"

import { useGlobalStore } from "@/providers/global-store-provider"

export function NavUser() {
  const authedUser = useGlobalStore((state) => state.authedUser)

  return (
    <SidebarGroup className="mt-auto mb-8">
      <SidebarGroupLabel>当前登录用户</SidebarGroupLabel>
      <SidebarMenu>
        {authedUser ? (
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              render={
                <Link href={`/users/${authedUser.id}`}>
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="https://github.com/evilrabbit.png" />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {authedUser.nickname}
                    </span>
                    <span className="truncate text-xs">{authedUser.email}</span>
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        ) : (
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/auth/login">无，去往登录页面</Link>}
            />
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )

  // return (

  //   <SidebarMenu className="mb-8">
  //     {authedUser ? (
  //       <SidebarMenuItem>
  //         <SidebarMenuButton
  //           size="lg"
  //           className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
  //           render={
  //             <Link href={`/users/${authedUser.id}`}>
  //               <Avatar className="h-8 w-8 rounded-lg">
  //                 <AvatarImage src="https://github.com/evilrabbit.png" />
  //                 <AvatarFallback className="rounded-lg">CN</AvatarFallback>
  //               </Avatar>
  //               <div className="grid flex-1 text-left text-sm leading-tight">
  //                 <span className="truncate font-medium">
  //                   {authedUser.nickname}
  //                 </span>
  //                 <span className="truncate text-xs">{authedUser.email}</span>
  //               </div>
  //             </Link>
  //           }
  //         />
  //       </SidebarMenuItem>
  //     ) : (
  //       <SidebarMenuItem>not login</SidebarMenuItem>
  //     )}
  //   </SidebarMenu>
  // )
}
