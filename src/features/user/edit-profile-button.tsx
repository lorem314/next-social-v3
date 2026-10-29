import { PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export const EditProfileButton = () => {
  return (
    <Button size="icon-sm" variant="outline" aria-label="Invite">
      <PencilIcon />
    </Button>
  )
}
