import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

import { useGlobalStore } from "@/providers/global-store-provider"
import { trpc } from "@/trpc/client"

export const FollowButton = ({
  isFollowed,
  userId,
}: {
  isFollowed: boolean
  userId: string
}) => {
  const authedUser = useGlobalStore((state) => state.authedUser)

  const utils = trpc.useUtils()

  const followMutation = trpc.user.follow.useMutation({
    onError(error, variables, onMutateResult, context) {
      console.error("FollowButton error")
    },
    onSuccess(data, variables, onMutateResult, context) {
      if (!authedUser?.id) return
      utils.user.byId.setData(
        { targetUserId: userId, currentUserId: authedUser?.id },
        (prevData) => {
          if (!prevData) return prevData
          const prevUser = prevData.user
          return {
            ...prevData,
            isFollowed: true,
            user: {
              ...prevUser,
              followersCount: prevUser.followersCount + 1,
            },
          }
        },
      )
    },
  })

  const unfollowMutation = trpc.user.unfollow.useMutation({
    onError(error, variables, onMutateResult, context) {
      console.error("FollowButton error")
    },
    onSuccess(data, variables, onMutateResult, context) {
      if (!authedUser?.id) return
      utils.user.byId.setData(
        { targetUserId: userId, currentUserId: authedUser?.id },
        (prevData) => {
          if (!prevData) return prevData
          const prevUser = prevData.user
          return {
            ...prevData,
            isFollowed: false,
            user: { ...prevUser, followersCount: prevUser.followersCount - 1 },
          }
        },
      )
    },
  })

  const handleClickFollow = async () => {
    await followMutation.mutateAsync({ userId })
  }

  const handleClickUnfollow = async () => {
    await unfollowMutation.mutateAsync({ userId })
  }

  return authedUser ? (
    isFollowed ? (
      <Button
        variant="secondary"
        onClick={handleClickUnfollow}
        disabled={unfollowMutation.isPending}
      >
        {unfollowMutation.isPending ? <Spinner /> : null}
        取消关注
      </Button>
    ) : (
      <Button onClick={handleClickFollow} disabled={followMutation.isPending}>
        {followMutation.isPending ? <Spinner /> : null}
        关注
      </Button>
    )
  ) : (
    <Link href="/auth/login">登录后可关注</Link>
  )
}
