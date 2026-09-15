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
import {
  forgotPasswordInputSchema,
  type ForgotPasswordInput,
} from '@/data-access/auth/forgot-password'
import { NOTICE_PARAM, resolveNoticeMessageId } from '@/data-access/auth/notices'
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password'
import { useTranslate } from '@/lib/i18n/use-translate'
import { notifyError } from '@/lib/notify'

export function ForgotPasswordForm(): React.JSX.Element {
  const forgotPassword = useForgotPassword()
  const searchParams = useSearchParams()
  const t = useTranslate()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '' },
  })

  useEffect(() => {
    const messageId = resolveNoticeMessageId(searchParams.get(NOTICE_PARAM))
    if (messageId === null) return
    notifyError({ title: t(messageId) })
  }, [searchParams, t])

  const handleSubmit = (values: ForgotPasswordInput): void => {
    forgotPassword.mutate(values)
  }

  const isPending = forgotPassword.isPending
  const hasErrors = Object.keys(form.formState.errors).length > 0
  const isSubmitDisabled = isPending || hasErrors

  return (
    <AuthCard
      title={t('auth.forgot_password.title')}
      description={t('auth.forgot_password.description')}
    >
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
                <FormLabel>{t('auth.forgot_password.email_label')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('auth.forgot_password.email_placeholder')}
                    autoComplete="email"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-2" disabled={isSubmitDisabled}>
            {isPending
              ? t('auth.forgot_password.submit_pending')
              : t('auth.forgot_password.submit')}
          </Button>
          <Link
            href="/login"
            className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {t('auth.forgot_password.back_to_sign_in')}
          </Link>
        </form>
      </Form>
    </AuthCard>
  )
}
