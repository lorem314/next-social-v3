import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <Card className="mx-auto mt-16 max-w-xl">
      <CardHeader>
        <CardTitle>首页</CardTitle>
      </CardHeader>

      <CardContent>
        <div>CardContent</div>
      </CardContent>
    </Card>
  )
}
