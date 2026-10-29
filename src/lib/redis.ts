import { createClient } from "redis"

export const redis = createClient({ url: process.env.REDIS_URL })

const globalForRedis = globalThis as unknown as {
  redisPublisher?: ReturnType<typeof createClient>
  redisSubscriber?: ReturnType<typeof createClient>
}

export function getRedisPublisher() {
  if (!globalForRedis.redisPublisher) {
    globalForRedis.redisPublisher = createClient({
      url: process.env.REDIS_URL,
    })
    globalForRedis.redisPublisher.connect().catch(console.error)
  }
  return globalForRedis.redisPublisher
}

export function getRedisSubscriber() {
  if (!globalForRedis.redisSubscriber) {
    globalForRedis.redisSubscriber = createClient({
      url: process.env.REDIS_URL,
    })
    globalForRedis.redisSubscriber.connect().catch(console.error)
  }
  return globalForRedis.redisSubscriber
}
