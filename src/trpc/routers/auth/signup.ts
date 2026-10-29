import bcrypt from "bcrypt"
import { TRPCError } from "@trpc/server"
import { DatabaseError } from "pg"
import { DrizzleQueryError } from "drizzle-orm"

import { baseProcedure } from "@/trpc/init"
import { insertUserSchema } from "@/lib/schema/user"
import { userTable } from "@/db/schema"
import { db } from "@/db"

export const signup = baseProcedure
  .input(
    insertUserSchema.pick({
      nickname: true,
      email: true,
      password: true,
    }),
  )
  .mutation(async ({ input, ctx }) => {
    console.log("signup router", input)

    // await delay(5000)

    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(input.password, 10)
      console.log("hashedPassword", hashedPassword)
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "加密密码时出错",
      })
    }

    try {
      await db.insert(userTable).values({
        nickname: input.nickname,
        email: input.email,
        hashedPassword,
      })
    } catch (error) {
      if (
        error instanceof DrizzleQueryError &&
        error.cause instanceof DatabaseError
      ) {
        if (error.cause.code === "23505") {
          if (error.cause.constraint === "users_email_key") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "该邮箱已被注册",
              cause: { target: "email" },
            })
          }
        }
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "保存用户时出错",
      })
    }

    return { message: "注册账号成功" }
  })
