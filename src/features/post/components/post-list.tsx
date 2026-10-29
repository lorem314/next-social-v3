"use client"

import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { HeartIcon, DotIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  ItemGroup,
} from "@/components/ui/item"
import { cn } from "@/lib/utils"

export const PostList = () => {
  return (
    <div className="mx-auto space-y-6">
      {Array(10)
        .fill(null)
        .map((item, index) => {
          return (
            <Card key={index} className="">
              <CardHeader>
                <Item variant="outline">
                  <ItemMedia>
                    <Avatar className="size-12">
                      <AvatarImage src="https://github.com/evilrabbit.png" />
                      <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="flex items-center">
                      <span className="text-lg">user001</span>
                      <DotIcon size={12} />
                      <span className="text-muted-foreground">
                        发布于 3 天前
                      </span>
                    </ItemTitle>
                    <ItemDescription>User Email</ItemDescription>
                  </ItemContent>
                  {/* <ItemActions>
                    <Button size="icon-sm" variant="outline">
                      plus
                    </Button>
                  </ItemActions> */}
                </Item>
              </CardHeader>

              <CardContent
                className={cn(
                  "prose dark:prose-invert max-w-full space-y-0 px-10",
                  "gap-0",
                  "[&_h2]:mb-2",
                )}
              >
                <ReactMarkdown>
                  {
                    "## This is a header \n this is a paragraph. this is a paragraph. this is a paragraph. this is a paragraph. this is a paragraph. this is a paragraph. this is a paragraph."
                  }
                </ReactMarkdown>
              </CardContent>

              <CardFooter className="justify-around gap-4">
                <Link
                  href="/posts/postId"
                  className={buttonVariants({ variant: "link" })}
                >
                  评论(891)
                </Link>
                <Button variant={"outline"}>
                  <HeartIcon className="fill-red-500 stroke-red-400" />
                  赞(99)
                </Button>
              </CardFooter>
            </Card>
          )
        })}
    </div>
  )
}
