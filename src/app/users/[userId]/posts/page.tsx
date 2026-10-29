"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import { NewPost } from "@/features/post/components/new-post"
import { PostList } from "@/features/post/components/post-list"

export default function Page() {
  return (
    // <div className="mx-auto mt-12 max-w-2xl space-y-6">
    <ScrollArea className={"h-svh"}>
      <div className="mx-auto my-16 max-w-2xl space-y-8">
        <NewPost />
        <Separator />
        <PostList />
      </div>
    </ScrollArea>
    // </div>
  )
}
