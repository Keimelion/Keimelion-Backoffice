'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAccessToken } from '@/features/auth/auth-storage'
import { loginInputSchema } from '@/features/auth/login-schema'
import { useLogin } from '@/features/auth/hooks/use-login'

const BRAND_INITIAL = 'K'
const VALIDATION_ERROR_MESSAGE = 'Please enter a valid email and password.'

export function LoginForm(): React.JSX.Element {
  const router = useRouter()
  const login = useLogin()
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (getAccessToken()) {
      router.replace('/')
    }
  }, [router])

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
      toast.error(VALIDATION_ERROR_MESSAGE)
      return
    }

    login.mutate(parsed.data)
  }

  const isPending = login.isPending

  return (
    <Card className="w-full max-w-md border-border shadow-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="text-xl font-bold">{BRAND_INITIAL}</span>
        </div>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Access the Keimelion Backoffice</CardDescription>
      </CardHeader>
      <CardContent>
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
            <Label htmlFor="password">Password</Label>
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
