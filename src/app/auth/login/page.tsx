"use client"

import React from "react"
import Link from "next/link"
import { TRPCClientError } from "@trpc/client"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useForm } from "@tanstack/react-form"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"

import { insertUserSchema } from "@/lib/schema/user"
import { trpc } from "@/trpc/client"
import { useGlobalStore } from "@/providers/global-store-provider"

export default function Page() {
  const afterLogin = useGlobalStore((state) => state.afterLogin)

  const [showPassword, setShowPassword] = React.useState(false)

  const loginMutation = trpc.auth.login.useMutation({
    onError(error) {
      if (error instanceof TRPCClientError) {
        switch (error.data.code) {
          case "BAD_REQUEST":
            form.setFieldMeta(error.data.targetField, (prev) => ({
              ...prev,
              isTouched: true,
              errorMap: { ...prev.errorMap, onChange: error.message },
            }))
            break
          default:
            console.error("", error)
            break
        }
      }
    },
  })

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      const data = await loginMutation.mutateAsync(value)
      afterLogin(data)
    },
  })

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>登录账号</FieldLegend>
              <FieldDescription>通过邮箱和密码登录账号</FieldDescription>
              <FieldGroup>
                <form.Field
                  name="email"
                  validators={{
                    onChangeAsync: insertUserSchema.shape.email,
                    onChangeAsyncDebounceMs: 300,
                  }}
                  children={(field) => {
                    const firstError = field.state.meta.errors?.[0]
                    return (
                      <Field>
                        <FieldLabel htmlFor={field.name}>邮箱</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="输入邮箱..."
                        />
                        {firstError && (
                          <FieldError className="text-right">
                            {typeof firstError === "string"
                              ? firstError
                              : (firstError as any).message}
                          </FieldError>
                        )}
                      </Field>
                    )
                  }}
                />

                <form.Field
                  name="password"
                  validators={{
                    onChangeAsync: insertUserSchema.shape.password,
                    onChangeAsyncDebounceMs: 300,
                  }}
                  children={(field) => {
                    const firstError = field.state.meta.errors?.[0]
                    return (
                      <Field>
                        <FieldLabel htmlFor={field.name}>密码</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="输入密码..."
                            type={showPassword ? "text" : "password"}
                          />
                          <InputGroupAddon align={"inline-end"}>
                            <InputGroupButton
                              onClick={() => setShowPassword((_) => !_)}
                              size={"icon-sm"}
                            >
                              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                        {firstError && (
                          <FieldError className="text-right">
                            {typeof firstError === "string"
                              ? firstError
                              : (firstError as any).message}
                          </FieldError>
                        )}
                      </Field>
                    )
                  }}
                />
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <form.Subscribe
              selector={(state) =>
                [state.canSubmit, state.isSubmitting] as const
              }
              children={([canSubmit, isSubmitting]) => {
                return (
                  <Field
                    orientation="horizontal"
                    className="justify-between px-8"
                  >
                    <Link
                      className={buttonVariants({ variant: "link" })}
                      href="/signup"
                    >
                      没有帐号，去注册页面
                    </Link>

                    <Button type="submit" disabled={!canSubmit}>
                      登录
                    </Button>
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </CardContent>
      </form>
    </Card>
  )
}
