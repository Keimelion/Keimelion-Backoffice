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
import { PasswordInput } from '@/components/ui/password-input'
import { loginInputSchema, type LoginInput } from '@/data-access/auth/auth.schemas'
import { NOTICE_PARAM } from '@/data-access/auth/auth.constants'
import { useLogin } from '@/features/auth/hooks/use-login'
import { notify } from '@/lib/notify'

export function LoginForm(): React.JSX.Element {
  const login = useLogin()
  const searchParams = useSearchParams()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    const notice = searchParams.get(NOTICE_PARAM)
    if (!notice) return
    notify.success(notice, { persistent: true, id: notice })
  }, [searchParams])

  useEffect(() => {
    if (login.isError) {
      form.setValue('password', '')
    }
  }, [login.isError, form])

  const handleSubmit = (values: LoginInput): void => {
    login.mutate(values)
  }

  const isPending = login.isPending
  const hasErrors = Object.keys(form.formState.errors).length > 0
  const isSubmitDisabled = isPending || hasErrors

  return (
    <AuthCard title="Sign in" description="Access the Keimelion Backoffice">
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Link
            href="/forgot-password"
            className="-mt-2 self-end text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
          <Button type="submit" className="mt-2" disabled={isSubmitDisabled}>
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}
