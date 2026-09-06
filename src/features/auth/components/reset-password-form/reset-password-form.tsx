'use client'

import { useSearchParams } from 'next/navigation'
import { AuthCard } from '@/components/shared/auth-card'
import { ErrorDialog } from '@/components/shared/error-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordInputSchema } from '@/data-access/auth/auth.schemas'
import { useResetPassword } from '@/features/auth/hooks/use-reset-password'
import { ApiRequestError } from '@/data-access/_client'
import { notify } from '@/lib/notify'

const INVALID_TOKEN_ERROR_CODE = 'INVALID_RESET_TOKEN'

export function ResetPasswordForm(): React.JSX.Element {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const resetPassword = useResetPassword()

  // Invalid-token errors are handled by the hook (redirect to /forgot-password).
  // Only generic errors surface as a modal so the user keeps their typed
  // password when they hit Retry.
  const isInvalidToken =
    resetPassword.error instanceof ApiRequestError &&
    resetPassword.error.code === INVALID_TOKEN_ERROR_CODE
  const showErrorDialog = resetPassword.isError && !isInvalidToken

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
      notify.error(firstIssue?.message ?? 'Please check your input and try again.')
      return
    }

    resetPassword.mutate({
      token: parsed.data.token,
      newPassword: parsed.data.newPassword,
    })
  }

  const handleRetry = (): void => {
    if (resetPassword.variables) {
      resetPassword.mutate(resetPassword.variables)
      return
    }
    resetPassword.reset()
  }

  const isPending = resetPassword.isPending

  return (
    <>
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
      <ErrorDialog
        open={showErrorDialog}
        onOpenChange={(open) => {
          if (!open) resetPassword.reset()
        }}
        title="Reset failed"
        description="An unexpected error occurred. Please try again."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetPassword.reset()
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleRetry}>
              Retry
            </Button>
          </>
        }
      />
    </>
  )
}
