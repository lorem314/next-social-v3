"use client"

import React from "react"
import { useParams } from "next/navigation"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"

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
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Spinner } from "@/components/ui/spinner"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

import { ChatMessage } from "@/features/ai-chat/components/chat-message"
import { InputForm } from "@/features/ai-chat/components/input-form"
import { trpc } from "@/trpc/client"

export default function Page() {
  const params = useParams<{ chatId: string }>()

  const listMessageByChatIdQuery = trpc.aiChat.listMessageByChatId.useQuery({
    chatId: params.chatId,
  })

  return listMessageByChatIdQuery.isPending ? (
    <div className="mx-auto mt-8 flex max-w-3xl justify-center">
      <Spinner />
    </div>
  ) : listMessageByChatIdQuery.isError ? (
    <div className="mx-auto mt-8 flex max-w-3xl justify-center">error</div>
  ) : (
    <>
      {/* <div className="mx-auto max-w-xl">
        <pre>
          {JSON.stringify(
            { data: listMessageByChatIdQuery.data },
            undefined,
            2,
          )}
        </pre>
      </div> */}
      <Inner
        chatId={params.chatId}
        initialMessages={
          listMessageByChatIdQuery.data.uiMessages as MyUIMessage[]
        }
      />
    </>
  )
}

const Inner = ({
  chatId,
  initialMessages,
}: {
  chatId: string
  initialMessages: MyUIMessage[]
}) => {
  const { messages, status, sendMessage } = useChat<MyUIMessage>({
    generateId: () => crypto.randomUUID(),
    id: chatId,
    messages: initialMessages,
    resume: true,
    transport: new DefaultChatTransport({
      api: "/api/ai-chat",
      prepareReconnectToStreamRequest: ({ id }) => {
        return {
          api: `/api/ai-chat/${id}/stream`,
        }
      },
    }),
  })

  const inputFormContainerRef = React.useRef<HTMLDivElement | null>(null)
  const messageScrollerButtonContainerRef = React.useRef<HTMLDivElement | null>(
    null,
  )
  const messageScrollerContentContainerRef =
    React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const inputFormContainerNode = inputFormContainerRef.current
    const messageScrollerButtonContainerNode =
      messageScrollerButtonContainerRef.current
    const messageScrollerContentContainerNode =
      messageScrollerContentContainerRef.current
    if (
      !inputFormContainerNode ||
      !messageScrollerButtonContainerNode ||
      !messageScrollerContentContainerNode
    )
      return

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        let height = 0
        if (entry.borderBoxSize && entry.borderBoxSize[0]) {
          height = entry.borderBoxSize[0].blockSize
        } else {
          height = entry.contentRect.height
        }
        // console.log("height", height)
        const value = `${height + 16}px`
        messageScrollerButtonContainerNode.style.bottom = value
        messageScrollerContentContainerNode.style.paddingBottom = value
      }
    })

    resizeObserver.observe(inputFormContainerNode)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const messageRef = React.useRef<HTMLTextAreaElement>(null)
  const deepThinkRef = React.useRef<HTMLButtonElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [files, setFiles] = React.useState<File[]>([])
  const handleChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList) return
    setFiles((prevFiles) => {
      const prevFileNames = prevFiles.map((f) => f.name)
      const newFiles = Array.from(fileList).filter(
        (newFile) => !prevFileNames.includes(newFile.name),
      )
      return [...prevFiles, ...newFiles]
    })
  }
  const handleRemoveFile = (event: React.MouseEvent<HTMLButtonElement>) => {
    const fileName = event.currentTarget.dataset["fileName"]
    if (!fileName) return
    setFiles((prevFiles) =>
      prevFiles.filter((prevFile) => prevFile.name !== fileName),
    )
  }

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const isDeepThink =
      deepThinkRef.current?.getAttribute("aria-pressed") === "true"

    const messageNode = messageRef.current
    if (!messageNode) return

    const messageText = messageNode.value
    const trimmedMessageText = messageText.trim()
    if (trimmedMessageText.length === 0) return

    console.log({ text: trimmedMessageText })
    console.log({ isDeepThink })

    const dt = new DataTransfer()
    if (files.length > 0) {
      files.forEach((file) => dt.items.add(file))
    }

    console.log("files.length", files.length)
    sendMessage(
      {
        text: trimmedMessageText,
        files: dt.items.length !== 0 ? dt.files : undefined,
      },
      { body: { isDeepThink, chatId } },
    )

    messageNode.value = ""
    setFiles([])
  }

  const isSubmitted = status === "submitted"

  return (
    <MessageScroller>
      <MessageScrollerViewport className="dark:style-[color-scheme:dark] dark:scrollbar-color-[hsl(var(--muted-foreground)/0.4)_transparent] [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 scroll-fade-none no-scrollbar scrollbar-thin pb-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <MessageScrollerContent
          ref={messageScrollerContentContainerRef}
          className="mx-auto max-w-3xl px-4 pt-10 pb-0"
        >
          {messages.map((message) => (
            <MessageScrollerItem
              key={message.id}
              messageId={message.id}
              scrollAnchor={message.role === "user"}
            >
              <ChatMessage message={message} />
            </MessageScrollerItem>
          ))}

          {isSubmitted ? (
            <Marker role="status">
              <MarkerIcon>
                <Spinner />
              </MarkerIcon>
              <MarkerContent className="shimmer">AI 正在处理...</MarkerContent>
            </Marker>
          ) : null}
        </MessageScrollerContent>
      </MessageScrollerViewport>

      <div
        ref={inputFormContainerRef}
        className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-4xl px-6"
      >
        <div
          className="flex justify-end pb-4"
          ref={messageScrollerButtonContainerRef}
        >
          <MessageScrollerButton className="static! translate-x-0!" />
        </div>

        <div className="bg-background pb-6">
          <form className="w-full" onSubmit={handleSubmit}>
            <InputForm
              messageRef={messageRef}
              deepThinkRef={deepThinkRef}
              fileInputRef={fileInputRef}
              files={files}
              handleChangeFile={handleChangeFile}
              handleRemoveFile={handleRemoveFile}
            />
          </form>
        </div>
      </div>
    </MessageScroller>
  )
}

type MyUIMessage = UIMessage<{ createdAt?: Date }>
