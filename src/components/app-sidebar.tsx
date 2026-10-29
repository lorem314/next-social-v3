import Link from "next/link"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  HomeIcon,
  SquareTextIcon,
  BotMessageSquareIcon,
  CodeIcon,
  Code2Icon,
  CodeXmlIcon,
  MessageSquarePlusIcon,
} from "lucide-react"

import { Logo } from "./layout/logo"
import { SidebarNav as AIChatSidebarNav } from "@/features/ai-chat/components/sidebar-nav"
import { NavUser } from "./layout/nav-user"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <>
          {/* 
        <SidebarGroup>
          <SidebarGroupLabel>AI 聊天</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"新建聊天"}
                render={
                  <Link href="/">
                    <MessageSquarePlusIcon />
                    <span>新建聊天</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
            <Collapsible
              render={
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton tooltip={"聊天历史"}>
                        <BotMessageSquareIcon />
                        <SidebarMenuButton className="p-0">
                          聊天历史
                        </SidebarMenuButton>
                      </SidebarMenuButton>
                    }
                  />
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          render={<Link href="/">SidebarMenuSubLink</Link>}
                        />
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              }
            ></Collapsible>
          </SidebarMenu>
        </SidebarGroup> 
        */}
        </>

        <SidebarGroup className="py-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"首页"}
                render={
                  <Link href="/">
                    <HomeIcon />
                    <span>首页</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="py-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"动态"}
                render={
                  <Link href="/posts">
                    <SquareTextIcon />
                    <span>动态</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <AIChatSidebarNav />

        <NavUser />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
