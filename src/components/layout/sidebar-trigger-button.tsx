"use client"

import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react"

import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export const SidebarTriggerButton = () => {
  const { state, toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="-ml-1 h-10 w-10"
      onClick={toggleSidebar}
    >
      {state === "expanded" ? (
        <PanelRightOpenIcon className="size-5" />
      ) : (
        <PanelRightCloseIcon className="size-5" />
      )}
    </Button>
  )
}
