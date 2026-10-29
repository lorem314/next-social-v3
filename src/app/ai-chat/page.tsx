"use client"

import React from "react"
import { useRouter } from "next/navigation"
import {
  BrainIcon,
  PaperclipIcon,
  SendIcon,
  XIcon,
  FileCodeIcon,
  FileTextIcon,
  TableIcon,
  FileIcon,
  type LucideIcon,
} from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Toggle } from "@/components/ui/toggle"

import { cn } from "@/lib/utils"
import { useGlobalStore } from "@/providers/global-store-provider"
import { AiChatFile } from "@/types"
import { formatFileSize } from "@/lib/format"
import { trpc } from "@/trpc/client"

export default function Page() {
  const router = useRouter()
  const utils = trpc.useUtils()

  const authedUser = useGlobalStore((state) => state.authedUser)
  const aiChatFiles = useGlobalStore((state) => state.aiChatFiles)
  const addAiChatFiles = useGlobalStore((state) => state.addAiChatFiles)
  const removeAiChatFile = useGlobalStore((state) => state.removeAiChatFile)

  const messageRef = React.useRef<HTMLTextAreaElement>(null)
  const deepThinkRef = React.useRef<HTMLButtonElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList) return
    const aiChatFileNames = aiChatFiles.map((f) => f.name)
    const newAiChatFiles = Array.from(fileList).filter(
      (newAiChatFile) => !aiChatFileNames.includes(newAiChatFile.name),
    )
    addAiChatFiles(newAiChatFiles)
  }

  const handleRemoveFile = (event: React.MouseEvent<HTMLButtonElement>) => {
    const fileName = event.currentTarget.dataset["fileName"]
    if (!fileName) return
    removeAiChatFile(fileName)
  }

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const isDeepThink =
      deepThinkRef.current?.getAttribute("aria-pressed") === "true"
    const messageNode = messageRef.current
    if (!messageNode) return
    const messageText = messageNode.value
    const trimmedMessageText = messageText.trim()
    if (trimmedMessageText.length === 0) return

    const form = new FormData()
    form.append("message", trimmedMessageText)
    form.append("isDeepThink", isDeepThink ? "true" : "false")

    if (aiChatFiles.length > 0) {
      aiChatFiles.forEach((aiChatFile) => {
        form.append("files", aiChatFile)
      })
    }

    const res = await fetch("/api/ai-chat/start", {
      method: "POST",
      body: form,
    })

    if (!res.ok) {
      console.error("start ai-chat failed", await res.json())
      return
    }

    console.log("create ai-chat stream success")
    const data = (await res.json()) as {
      chatId: string
      chat: { id: string; title: string; createdAt: Date }
    }
    console.log("data", data)
    const { chatId, chat } = data
    // save `message` `isDeepThink` to zustand

    if (authedUser) {
      utils.aiChat.listByUserId.setData(
        { userId: authedUser.id },
        (prevData) => {
          if (!prevData) return prevData
          return { chats: [chat, ...prevData.chats] }
        },
      )
    }

    // route to `/ai-chat/c/[chatId]`
    router.push(`/ai-chat/c/${chatId}`)
  }

  return (
    <div className="flex h-full w-full items-center">
      <Card className="bg-background mx-auto w-full max-w-2xl ring-0">
        <CardHeader>
          <CardTitle className="text-center text-2xl">AI 聊天</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="w-full" onSubmit={handleSubmit}>
            <InputGroup className="rounded-xl">
              <InputGroupAddon align={"block-start"}>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PaperclipIcon />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleChangeFile}
                />
                {aiChatFiles.length > 0 ? (
                  <AttachmentGroup>
                    {aiChatFiles.map((aiChatFile, index) => {
                      return (
                        <FileAttachment
                          key={aiChatFile.name}
                          aiChatFile={aiChatFile}
                          onRemove={handleRemoveFile}
                        />
                      )
                    })}
                  </AttachmentGroup>
                ) : null}
              </InputGroupAddon>
              <InputGroupTextarea ref={messageRef} placeholder="畅所欲问" />
              <InputGroupAddon
                align="block-end"
                className="items-center justify-between"
              >
                <Toggle variant="outline" ref={deepThinkRef}>
                  <BrainIcon />
                  深度思考
                </Toggle>
                <InputGroupButton type="submit" size="sm" variant="outline">
                  <SendIcon />
                  <span>发送</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

const FileAttachment = ({
  aiChatFile,
  onRemove,
}: {
  aiChatFile: File
  onRemove: (event: React.MouseEvent<HTMLButtonElement>) => void
}) => {
  const [objectUrl, setObjectUrl] = React.useState<string | undefined>(
    undefined,
  )

  React.useEffect(() => {
    if (aiChatFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(aiChatFile)
      setObjectUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [aiChatFile])

  return (
    <Attachment>
      <AttachmentMedia variant={objectUrl === undefined ? "icon" : "image"}>
        {aiChatFile.type.startsWith("image/") ? (
          <img src={objectUrl} alt={aiChatFile.name} />
        ) : (
          <FileIcon />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{aiChatFile.name}</AttachmentTitle>
        <AttachmentDescription>
          {aiChatFile.type} - {formatFileSize(aiChatFile.size)}
        </AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction data-file-name={aiChatFile.name} onClick={onRemove}>
          <XIcon />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  )
}
