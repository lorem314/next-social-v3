import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3 } from "@/lib/s3"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get("file") as File | null
  const message = form.get("message") as string | null

  console.log("message", message)

  return Response.json({
    test: "ok",
  })
}
