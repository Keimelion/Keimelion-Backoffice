'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { AuthCard } from '@/components/shared/auth-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordInputSchema } from '@/data-access/auth/auth.schemas'
import { useResetPassword } from '@/features/auth/hooks/use-reset-password'
import { ApiRequestError } from '@/data-access/_client'

const INVALID_TOKEN_ERROR_CODE = 'INVALID_RESET_TOKEN'
const FORGOT_PASSWORD_PATH = '/forgot-password'

export function ResetPasswordForm(): React.JSX.Element {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const resetPassword = useResetPassword()

  if (!token) {
    return (
      <AuthCard
        title="Invalid reset link"
        description="This reset link is missing the required token. Please request a new password reset."
      >
        <Link
          href={FORGOT_PASSWORD_PATH}
          className="block w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Request a new reset link
        </Link>
      </AuthCard>
    )
  }

  if (resetPassword.isError) {
    const isInvalidToken =
      resetPassword.error instanceof ApiRequestError &&
      resetPassword.error.code === INVALID_TOKEN_ERROR_CODE

    if (isInvalidToken) {
      return (
        <AuthCard
          title="Reset link no longer valid"
          description="This reset link has expired or has already been used. Please request a new one."
        >
          <Link
            href={FORGOT_PASSWORD_PATH}
            className="block w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Request a new reset link
          </Link>
        </AuthCard>
      )
    }

    return (
      <AuthCard title="Reset failed" description="An unexpected error occurred. Please try again.">
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={() => {
              resetPassword.reset()
            }}
          >
            Try again
          </Button>
          <Link
            href={FORGOT_PASSWORD_PATH}
            className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </AuthCard>
    )
  }

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const parsed = resetPasswordInputSchema.safeParse({
      token,
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    })

    if (!parsed.success) {
      const firstIssue = parsed.error.issues.at(0)
      toast.error(firstIssue?.message ?? 'Please check your input and try again.')
      return
    }

    resetPassword.mutate({
      token: parsed.data.token,
      newPassword: parsed.data.newPassword,
    })
  }

  const isPending = resetPassword.isPending

  return (
    <AuthCard title="Reset your password" description="Enter your new password below.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            disabled={isPending}
          />
        </div>
        <Button type="submit" className="mt-2" disabled={isPending}>
          {isPending ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthCard>
  )
}
