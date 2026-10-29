import { randomUUID } from "crypto"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const bucket = process.env.S3_BUCKET!

export type UploadedFile = {
  key: string
  url: string
  filename: string
  mediaType: string
  size: number
}

export const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint: process.env.S3_ENDPOINT, // http://localhost:9000
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // MinIO 必需
})

export function publicUrlForKey(key: string) {
  const base = process.env.S3_PUBLIC_URL!.replace(/\/$/, "")
  return `${base}/${key}`
}

async function uploadFileToS3(
  file: File,
  options: { chatId: string; userId?: string },
) {
  const filename = file.name
  const mediaType = file.type || "application/octet-stream"
  const bytes = Buffer.from(await file.arrayBuffer())

  const safeName = filename.replace(/[^\w.\-()+ ]+/g, "_")
  const key = [
    options.userId ?? "anonymous",
    options.chatId,
    `${randomUUID()}-${safeName}`,
  ].join("/")

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: mediaType,
    }),
  )

  return {
    key,
    url: publicUrlForKey(key),
    filename,
    mediaType,
    size: bytes.byteLength,
  }
}

export async function uploadFilesToS3(
  files: File[],
  options: { chatId: string; userId?: string },
): Promise<UploadedFile[]> {
  return Promise.all(files.map((f) => uploadFileToS3(f, options)))
}

export async function uploadDataUrlToS3(
  dataUrl: string,
  filename: string,
  options: { chatId: string; userId?: string },
) {
  const matches = dataUrl.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid data URL")
  }

  const mediaType = matches[1] // 例如 image/webp
  const base64Data = matches[2]
  const buffer = Buffer.from(base64Data, "base64")

  const safeName = filename.replace(/[^\w.\-()+ ]+/g, "_")
  const key = [
    options.userId ?? "anonymous",
    options.chatId,
    `${randomUUID()}-${safeName}`,
  ].join("/")

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mediaType,
      // 如果需要公开读，可以加：
      // ACL: "public-read",
    }),
  )

  return {
    key,
    url: publicUrlForKey(key),
    filename,
    mediaType,
    size: buffer.byteLength,
  }
}
