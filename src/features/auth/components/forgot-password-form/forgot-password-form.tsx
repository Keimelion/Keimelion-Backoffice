'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { AuthCard } from '@/components/shared/auth-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPasswordInputSchema } from '@/data-access/auth/auth.schemas'
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password'

const NEUTRAL_SUCCESS_MESSAGE =
  'If an account with that email exists, you will receive a password reset email shortly.'

export function ForgotPasswordForm(): React.JSX.Element {
  const forgotPassword = useForgotPassword()

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const parsed = forgotPasswordInputSchema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) {
      toast.error('Please enter a valid email address.')
      return
    }

    forgotPassword.mutate(parsed.data)
  }

  if (forgotPassword.isSuccess) {
    return (
      <AuthCard title="Check your inbox" description={NEUTRAL_SUCCESS_MESSAGE}>
        <Link
          href="/login"
          className="block w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </AuthCard>
    )
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
