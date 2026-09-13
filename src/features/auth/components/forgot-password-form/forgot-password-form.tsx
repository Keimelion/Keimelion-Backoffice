'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthCard } from '@/components/shared/auth-card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  forgotPasswordInputSchema,
  type ForgotPasswordInput,
} from '@/data-access/auth/forgot-password'
import { NOTICE_PARAM, resolveNoticeMessage } from '@/data-access/auth/notices'
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password'
import { notifyError } from '@/lib/notify'

export function ForgotPasswordForm(): React.JSX.Element {
  const forgotPassword = useForgotPassword()
  const searchParams = useSearchParams()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '' },
  })

  useEffect(() => {
    const notice = resolveNoticeMessage(searchParams.get(NOTICE_PARAM))
    if (notice === null) return
    notifyError({ title: notice })
  }, [searchParams])

  const handleSubmit = (values: ForgotPasswordInput): void => {
    forgotPassword.mutate(values)
  }

  const isPending = forgotPassword.isPending
  const hasErrors = Object.keys(form.formState.errors).length > 0
  const isSubmitDisabled = isPending || hasErrors

  return (
    <AuthCard
      title="Forgot password?"
      description="Enter your email and we'll send you a reset link."
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            void form.handleSubmit(handleSubmit)(event)
          }}
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@keimelion.app"
                    autoComplete="email"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-2" disabled={isSubmitDisabled}>
            {isPending ? 'Sending…' : 'Send reset link'}
          </Button>
          <Link
            href="/login"
            className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </form>
      </Form>
    </AuthCard>
  )
}
