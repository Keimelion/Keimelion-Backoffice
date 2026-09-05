'use client'

import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordInputSchema } from '@/data-access/auth/auth.schemas'
import { useResetPassword } from '@/features/auth/hooks/use-reset-password'
import { ApiRequestError } from '@/data-access/_client'

const INVALID_TOKEN_ERROR_CODE = 'INVALID_RESET_TOKEN'

export function ResetPasswordForm(): React.JSX.Element {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const resetPassword = useResetPassword()

  if (!token) {
    return (
      <Card className="w-full max-w-md border-border shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <span className="text-xl font-bold">K</span>
          </div>
          <CardTitle className="text-2xl">Invalid reset link</CardTitle>
          <CardDescription>
            This reset link is missing the required token. Please request a new password reset.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (resetPassword.isError) {
    const isInvalidToken =
      resetPassword.error instanceof ApiRequestError &&
      resetPassword.error.code === INVALID_TOKEN_ERROR_CODE

    const errorMessage = isInvalidToken
      ? 'This reset link has expired or has already been used. Please request a new one.'
      : 'An unexpected error occurred. Please try again.'

    return (
      <Card className="w-full max-w-md border-border shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <span className="text-xl font-bold">K</span>
          </div>
          <CardTitle className="text-2xl">Reset failed</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
      </Card>
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
    <Card className="w-full max-w-md border-border shadow-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="text-xl font-bold">K</span>
        </div>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
