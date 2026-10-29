import {
  S3Client,
  ListBucketsCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3"

import { baseProcedure } from "@/trpc/init"
import { redis } from "@/lib/redis"
import { s3 } from "@/lib/s3"

export const test = baseProcedure.query(async () => {
  console.log("test/test")

  if (!redis.isOpen) {
    await redis.connect()
  }

  const res1 = await redis.ping()
  console.log("✅ Redis 连接成功，响应:", res1) // 预期输出: PONG

  const command = new ListBucketsCommand({})
  const res2 = await s3.send(command)
  console.log("✅ MinIO 连接成功，Bucket 数量:", res2.Buckets?.length ?? 0)

  return { test: "ok", res1, res2 }
})
