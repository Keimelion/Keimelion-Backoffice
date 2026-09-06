'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthCard } from '@/components/shared/auth-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginInputSchema } from '@/data-access/auth/auth.schemas'
import { useLogin } from '@/features/auth/hooks/use-login'
import { notify } from '@/lib/notify'

const RESET_SUCCESS_PARAM = 'reset'
const RESET_SUCCESS_VALUE = 'success'
const PASSWORD_RESET_TOAST_ID = 'password-reset-success'

export function LoginForm(): React.JSX.Element {
  const login = useLogin()
  const passwordRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const passwordResetFiredRef = useRef(false)

  useEffect(() => {
    if (passwordResetFiredRef.current) return
    if (searchParams.get(RESET_SUCCESS_PARAM) !== RESET_SUCCESS_VALUE) return
    passwordResetFiredRef.current = true
    notify.success('Password updated. Please sign in with your new password.', {
      persistent: true,
      id: PASSWORD_RESET_TOAST_ID,
    })
  }, [searchParams])

  useEffect(() => {
    if (login.isError && passwordRef.current) {
      passwordRef.current.value = ''
    }
  }, [login.isError])

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const parsed = loginInputSchema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) {
      notify.error('Please enter a valid email and password.')
      return
    }

    login.mutate(parsed.data)
  }

  const isPending = login.isPending

  return (
    <AuthCard title="Sign in" description="Access the Keimelion Backoffice">
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={isPending}
            ref={passwordRef}
          />
        </div>
        <Button type="submit" className="mt-2" disabled={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  )
}
