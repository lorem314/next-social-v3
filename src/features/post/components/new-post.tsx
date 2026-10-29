"use client"

import { SendIcon, PlusIcon, PaperclipIcon } from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"

export const NewPost = () => {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>发布动态</CardTitle>
      </CardHeader>
      <CardContent>
        <InputGroup>
          <InputGroupAddon align="block-start" className="border-b">
            <InputGroupButton size="sm" className="" variant="outline">
              <PaperclipIcon />
              上传图片 (0 / 9)
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupTextarea
            placeholder="说点什么吧..."
            className="min-h-24"
          />
          <InputGroupAddon align="block-end" className="border-t">
            <InputGroupText>0 / 2,000</InputGroupText>
            <InputGroupButton size="sm" className="ml-auto" variant="outline">
              <SendIcon />
              发送
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </CardContent>
    </Card>
  )
}
