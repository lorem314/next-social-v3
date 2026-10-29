"use client"

import ReactMarkdown from "react-markdown"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Message, MessageContent, MessageFooter } from "@/components/ui/message"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDownIcon } from "lucide-react"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble"

import { MyUIMessage } from "@/types"

export const ChatMessage = ({ message }: { message: MyUIMessage }) => {
  const isUser = message.role === "user"

  const reasoningParts = message.parts.filter((p) => p.type === "reasoning")
  const isReasoningStreaming = reasoningParts.some(
    (p) => p.state === "streaming",
  )
  const reasoningText = reasoningParts.map((p) => p.text).join("")

  const imageFileParts = message.parts.filter((p) => p.type === "file")

  const generateImageParts = message.parts.filter(
    (p) => p.type === "tool-generateImage",
  )

  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("")

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageContent>
        {reasoningText ? (
          <Collapsible>
            <CollapsibleTrigger
              render={
                <Button variant={"ghost"}>
                  <ChevronsUpDownIcon />
                  {isReasoningStreaming ? (
                    <span>正在思考...</span>
                  ) : (
                    <span>思考过程</span>
                  )}
                </Button>
              }
            />
            <CollapsibleContent className="prose dark:prose-invert">
              <ReactMarkdown>{reasoningText}</ReactMarkdown>
            </CollapsibleContent>
          </Collapsible>
        ) : null}

        {generateImageParts.map((p) => {
          if (p.type !== "tool-generateImage") return null
          switch (p.state) {
            case "input-available":
              return (
                <Marker role="status" key={p.toolCallId}>
                  <MarkerIcon>
                    <Spinner />
                  </MarkerIcon>
                  <MarkerContent className="shimmer">
                    正在生成图片...
                  </MarkerContent>
                </Marker>
              )
            case "output-available":
              const output = p.output as { url: string; prompt: string }
              return (
                <BubbleGroup key={p.toolCallId}>
                  <Bubble variant={"secondary"}>
                    <BubbleContent>
                      <img src={output.url} alt={output.prompt} />
                    </BubbleContent>
                  </Bubble>
                  <Bubble variant={"secondary"}>
                    <BubbleContent>{output.prompt}</BubbleContent>
                  </Bubble>
                </BubbleGroup>
              )

            default:
              return null
          }
        })}

        {isUser
          ? imageFileParts.map((p, index) => {
              return (
                <Bubble key={p.filename}>
                  <BubbleContent>
                    <img src={p.url} alt={p.filename} />
                  </BubbleContent>
                </Bubble>
              )
            })
          : null}

        {text ? (
          isUser ? (
            <Bubble>
              <BubbleContent>{text}</BubbleContent>
            </Bubble>
          ) : (
            <Bubble variant={"secondary"}>
              <BubbleContent className="prose dark:prose-invert">
                <ReactMarkdown>{text}</ReactMarkdown>
              </BubbleContent>
            </Bubble>
          )
        ) : null}

        <MessageFooter>
          {message.metadata?.createdAt?.toLocaleTimeString("zh-CN", {
            timeZone: "UTC",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour12: false,
          })}
        </MessageFooter>
      </MessageContent>
    </Message>
  )
}
