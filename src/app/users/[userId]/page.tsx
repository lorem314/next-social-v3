"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { PencilIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  ItemGroup,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"

import { trpc } from "@/trpc/client"
import { useGlobalStore } from "@/providers/global-store-provider"
import { FollowButton } from "@/features/user/follow-button"
import { EditProfileButton } from "@/features/user/edit-profile-button"

export default function Page() {
  const params = useParams<{ userId: string }>()

  const authedUser = useGlobalStore((state) => state.authedUser)

  const userByIdQuery = trpc.user.byId.useQuery(
    {
      targetUserId: params.userId,
      currentUserId: authedUser?.id || "",
    },
    { enabled: authedUser !== null },
  )

  const isMyself = authedUser?.id === userByIdQuery.data?.user.id

  // console.log("userByIdQuery.data.isFollowed", userByIdQuery.data)

  return (
    <Card className="mx-auto mt-12 max-w-xl">
      {userByIdQuery.isPending ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : userByIdQuery.isError ? (
        "error"
      ) : (
        <CardContent>
          <Item variant="outline">
            <ItemMedia>
              <Avatar className="size-14">
                <AvatarImage src="https://github.com/evilrabbit.png" />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="text-lg">
                {userByIdQuery.data.user.nickname}
              </ItemTitle>
              <ItemDescription>{userByIdQuery.data.user.email}</ItemDescription>
            </ItemContent>
            <ItemActions>
              {isMyself ? (
                <EditProfileButton />
              ) : (
                <FollowButton
                  isFollowed={userByIdQuery.data.isFollowed}
                  userId={userByIdQuery.data.user.id}
                />
              )}
            </ItemActions>
          </Item>

          <ItemGroup className="mt-2.5 grid grid-cols-3">
            {[
              {
                title: "动态",
                value: userByIdQuery.data.user.postsCount,
                href: `/users/${params.userId}/posts`,
              },
              {
                title: "粉丝",
                value: userByIdQuery.data.user.followersCount,
                href: `/users/${params.userId}/followers`,
              },
              {
                title: "关注",
                value: userByIdQuery.data.user.followeesCount,
                href: `/users/${params.userId}/followees`,
              },
            ].map((item, index) => {
              return (
                <Item
                  key={index}
                  variant={"outline"}
                  render={
                    <Link href={item.href}>
                      <ItemContent>
                        <ItemDescription className="text-sm">
                          {item.title}
                        </ItemDescription>
                        <ItemTitle className="self-end font-mono text-2xl">
                          {item.value.toLocaleString()}
                        </ItemTitle>
                      </ItemContent>
                    </Link>
                  }
                />
              )
            })}
          </ItemGroup>
        </CardContent>
      )}
    </Card>
  )
}
