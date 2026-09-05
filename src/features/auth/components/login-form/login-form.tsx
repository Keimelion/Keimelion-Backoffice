'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginInputSchema } from '@/data-access/auth/auth.schemas'
import { useLogin } from '@/features/auth/hooks/use-login'

const RESET_SUCCESS_PARAM = 'reset'
const RESET_SUCCESS_VALUE = 'success'

export function LoginForm(): React.JSX.Element {
  const login = useLogin()
  const passwordRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const isPasswordReset = searchParams.get(RESET_SUCCESS_PARAM) === RESET_SUCCESS_VALUE

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
      toast.error('Please enter a valid email and password.')
      return
    }

    login.mutate(parsed.data)
  }

  const isPending = login.isPending

  return (
    <Card className="w-full max-w-md border-border shadow-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="text-xl font-bold">K</span>
        </div>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Access the Keimelion Backoffice</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isPasswordReset && (
          <p className="rounded-md bg-green-50 px-4 py-3 text-center text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
            Password updated. Please sign in with your new password.
          </p>
        )}
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
      </CardContent>
    </Card>
  )
}
