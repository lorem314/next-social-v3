"use client"

import { Card, CardContent } from "@/components/ui/card"

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"

export default function Page() {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <Card className="mx-auto my-16 max-w-3xl bg-transparent" size="sm">
        <CardContent className="">
          <SimpleEditor />
        </CardContent>
      </Card>
    </div>
  )
}
