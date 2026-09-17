'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TranslatedAuthCard } from '@/components/shared/translated-auth-card'
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
import { loginInputSchema, type LoginInput } from '@/data-access/auth/login'
import { NOTICE_PARAM, resolveNoticeMessageId } from '@/data-access/auth/notices'
import { useLogin } from '@/features/auth/hooks/use-login'
import { useTranslate } from '@/lib/i18n/use-translate'
import { notifySuccess } from '@/lib/notify'

export function LoginForm(): React.JSX.Element {
  const login = useLogin()
  const searchParams = useSearchParams()
  const t = useTranslate()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    const messageId = resolveNoticeMessageId(searchParams.get(NOTICE_PARAM))
    if (messageId === null) return
    notifySuccess({ title: t(messageId) })
  }, [searchParams, t])

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
    <TranslatedAuthCard namespace="auth.login">
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
                <FormLabel>{t('auth.login.email_label')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('auth.login.email_placeholder')}
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
                <FormLabel>{t('auth.login.password_label')}</FormLabel>
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
            {t('auth.login.forgot_password')}
          </Link>
          <Button type="submit" className="mt-2" disabled={isSubmitDisabled}>
            {isPending ? t('auth.login.submit_pending') : t('auth.login.submit')}
          </Button>
        </form>
      </Form>
    </TranslatedAuthCard>
  )
}
