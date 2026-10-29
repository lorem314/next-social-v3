"use client"

import React from "react"
import Link from "next/link"
import { TRPCClientError } from "@trpc/client"
import { EyeIcon, EyeOffIcon } from "lucide-react"

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

import { useForm } from "@tanstack/react-form"
import { insertUserSchema } from "@/lib/schema/user"
import { trpc } from "@/trpc/client"

export default function Page() {
  const [showPassword, setShowPassword] = React.useState(false)

  const signupMutation = trpc.auth.signup.useMutation({
    onError(error) {
      if (error instanceof TRPCClientError) {
        switch (error.data.code) {
          case "CONFLICT":
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
    onSuccess() {
      console.log("成功注册账号")
    },
  })

  const form = useForm({
    defaultValues: { nickname: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      await signupMutation.mutateAsync(value)
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
              <FieldLegend>注册账号</FieldLegend>
              <FieldDescription>通过邮箱和密码注册账号</FieldDescription>
              <FieldGroup>
                <form.Field
                  name="nickname"
                  validators={{
                    onChangeAsync: insertUserSchema.shape.nickname,
                    onChangeAsyncDebounceMs: 300,
                  }}
                  children={(field) => {
                    return (
                      <Field>
                        <FieldLabel htmlFor={field.name}>用户名</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="输入用户名..."
                        />
                        {!field.state.meta.isValid && (
                          <FieldError className="text-right">
                            {field.state.meta.errors.length > 0 &&
                              field.state.meta.errors.at(0)?.message}
                          </FieldError>
                        )}
                      </Field>
                    )
                  }}
                />

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
                            {/* <pre>
                              {JSON.stringify(firstError, undefined, 2)}
                            </pre> */}
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
                        {!field.state.meta.isValid && (
                          <FieldError className="text-right">
                            {field.state.meta.errors.length > 0 &&
                              field.state.meta.errors.at(0)?.message}
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
                      href="/login"
                    >
                      已有帐号，去登录页面
                    </Link>

                    <Button type="submit" disabled={!canSubmit}>
                      注册
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
