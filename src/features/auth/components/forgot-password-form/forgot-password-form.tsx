'use client'

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
} from '@/data-access/auth/auth.schemas'
import {
  FORGOT_PASSWORD_REASON,
  FORGOT_PASSWORD_REASON_PARAM,
} from '@/data-access/auth/auth.constants'
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password'
import { useOnMount } from '@/lib/hooks/use-on-mount'
import { notify } from '@/lib/notify'

const REASON_TOASTS: Record<string, { message: string; id: string }> = {
  [FORGOT_PASSWORD_REASON.INVALID_LINK]: {
    message: 'This reset link is invalid. Please request a new one.',
    id: 'reset-link-invalid',
  },
  [FORGOT_PASSWORD_REASON.EXPIRED_LINK]: {
    message:
      'This reset link has expired or has already been used. Please request a new one.',
    id: 'reset-link-expired',
  },
}

export function ForgotPasswordForm(): React.JSX.Element {
  const forgotPassword = useForgotPassword()
  const searchParams = useSearchParams()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '' },
  })

  useOnMount(() => {
    const reason = searchParams.get(FORGOT_PASSWORD_REASON_PARAM)
    if (reason === null) return
    const entry = REASON_TOASTS[reason]
    if (!entry) return
    notify.error(entry.message, { persistent: true, id: entry.id })
  })

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
