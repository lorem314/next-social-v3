"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { useGlobalStore } from "@/providers/global-store-provider"

import { trpc } from "@/trpc/client"

export default function Page() {
  const authedUser = useGlobalStore((state) => state.authedUser)
  const accessToken = useGlobalStore((state) => state.accessToken)

  const testQuery = trpc.auth.test.useQuery(undefined, { enabled: false })

  const handleClick = async () => {
    const res = await testQuery.refetch()
    console.log("res", res)
  }

  return (
    <Card className="mx-auto w-full max-w-7xl">
      <CardHeader>
        <CardTitle>测试</CardTitle>
        <CardDescription>
          测试用户登录后，发送需要登录后才可发送的请求时是否正确
        </CardDescription>
      </CardHeader>

      <CardContent className="prose dark:prose-invert w-full max-w-full">
        <pre className="">
          {JSON.stringify({ authedUser, accessToken }, undefined, 2)}
        </pre>
        {testQuery.isFetching ? (
          "Fetching..."
        ) : testQuery.isError ? (
          <pre>{JSON.stringify(testQuery.error, undefined, 2)}</pre>
        ) : (
          <pre>{JSON.stringify(testQuery.data, undefined, 2)}</pre>
        )}
      </CardContent>

      <CardFooter>
        <Field>
          <Button onClick={handleClick}>发送</Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
