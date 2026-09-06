'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthCard } from '@/components/shared/auth-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPasswordInputSchema } from '@/data-access/auth/auth.schemas'
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

  useOnMount(() => {
    const reason = searchParams.get(FORGOT_PASSWORD_REASON_PARAM)
    if (reason === null) return
    const entry = REASON_TOASTS[reason]
    if (!entry) return
    notify.error(entry.message, { persistent: true, id: entry.id })
  })

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const parsed = forgotPasswordInputSchema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) {
      notify.error('Please enter a valid email address.')
      return
    }

    forgotPassword.mutate(parsed.data)
  }

  const isPending = forgotPassword.isPending

  return (
    <AuthCard
      title="Forgot password?"
      description="Enter your email and we'll send you a reset link."
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@keimelion.app"
            autoComplete="email"
            required
            disabled={isPending}
          />
        </div>
        <Button type="submit" className="mt-2" disabled={isPending}>
          {isPending ? 'Sending…' : 'Send reset link'}
        </Button>
        <Link
          href="/login"
          className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </form>
    </AuthCard>
  )
}
