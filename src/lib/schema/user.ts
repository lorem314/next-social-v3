import { z } from "zod"
import { createInsertSchema } from "drizzle-zod"

import { userTable } from "@/db/schema"

export const insertUserSchema = createInsertSchema(userTable, {
  nickname: z
    .string()
    .min(1, "用户名不能为空")
    .min(4, "用户名至少为 4 个字符")
    .max(32, "用户名最多 32 个字符")
    .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
  email: z.email("邮箱格式不正确").min(1, "邮箱不能为空"),
}).extend({
  password: z.string().min(1, "密码不能为空").min(6, "密码至少 6 位"),
})
