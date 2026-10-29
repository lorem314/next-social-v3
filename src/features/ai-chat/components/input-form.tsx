"use client"

import React from "react"
import {
  BrainIcon,
  FileIcon,
  PaperclipIcon,
  SendIcon,
  XIcon,
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
import { Button } from "@/components/ui/button"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Toggle } from "@/components/ui/toggle"
import { formatFileSize } from "@/lib/format"

export const InputForm = ({
  messageRef,
  deepThinkRef,
  fileInputRef,
  files,
  handleChangeFile,
  handleRemoveFile,
}: {
  messageRef: React.RefObject<HTMLTextAreaElement | null>
  deepThinkRef: React.RefObject<HTMLButtonElement | null>
  fileInputRef: React.RefObject<HTMLInputElement | null>
  files: File[]
  handleChangeFile: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveFile: (event: React.MouseEvent<HTMLButtonElement>) => void
}) => {
  return (
    <InputGroup className="rounded-xl p-2">
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
        {files.length > 0 ? (
          <AttachmentGroup>
            {files.map((file, index) => {
              return (
                <FileAttachment
                  key={file.name}
                  file={file}
                  onRemove={handleRemoveFile}
                />
              )
            })}
          </AttachmentGroup>
        ) : null}
      </InputGroupAddon>
      <InputGroupTextarea
        ref={messageRef}
        placeholder="畅所欲问"
        className="no-scrollbar max-h-64"
      />
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
  )
}

const FileAttachment = ({
  file,
  onRemove,
}: {
  file: File
  onRemove: (event: React.MouseEvent<HTMLButtonElement>) => void
}) => {
  const [objectUrl, setObjectUrl] = React.useState<string | undefined>(
    undefined,
  )

  React.useEffect(() => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setObjectUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  return (
    <Attachment>
      <AttachmentMedia variant={objectUrl === undefined ? "icon" : "image"}>
        {file.type.startsWith("image/") ? (
          <img src={objectUrl} alt={file.name} />
        ) : (
          <FileIcon />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{file.name}</AttachmentTitle>
        <AttachmentDescription>
          {file.type} - {formatFileSize(file.size)}
        </AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction data-file-name={file.name} onClick={onRemove}>
          <XIcon />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  )
}
