'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ErrorCode } from '@keimelion/api/shared/enums/error-code'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/ui/password-input'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import {
  changePasswordInputSchema,
  type ChangePasswordFormInput,
} from '@/data-access/users/profile.schemas'
import { useChangePassword } from '@/features/profile/hooks/use-change-password'
import { applyApiValidationIssues } from '@/lib/apply-api-validation-issues'
import { useTranslate } from '@/lib/i18n/use-translate'

const CHANGE_PASSWORD_ISSUE_PATHS = ['currentPassword', 'newPassword'] as const
const WRONG_CURRENT_PASSWORD_CODES: readonly string[] = [
  ErrorCode.INVALID_CREDENTIALS,
]

export function ChangePasswordForm(): React.JSX.Element {
  const t = useTranslate()
  const mutation = useChangePassword()

  const form = useForm<ChangePasswordFormInput>({
    resolver: zodResolver(changePasswordInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const newPassword = form.watch('newPassword')
  const currentPassword = form.watch('currentPassword')
  const confirmPasswordTouched = form.formState.touchedFields.confirmPassword === true
  const newPasswordTouched = form.formState.touchedFields.newPassword === true

  useEffect(() => {
    if (confirmPasswordTouched) {
      void form.trigger('confirmPassword')
    }
  }, [newPassword, confirmPasswordTouched, form])

  useEffect(() => {
    if (newPasswordTouched) {
      void form.trigger('newPassword')
    }
  }, [currentPassword, newPasswordTouched, form])

  const handleSubmit = (values: ChangePasswordFormInput): void => {
    mutation.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onError: (error) => {
          if (
            error instanceof ApiRequestError
            && WRONG_CURRENT_PASSWORD_CODES.includes(error.code)
          ) {
            form.setError('currentPassword', {
              message: t('profile.password.error.wrong_current'),
            })
            form.setValue('currentPassword', '')
            return
          }
          if (
            error instanceof ApiRequestError
            && error.status === HttpStatus.UNPROCESSABLE_ENTITY
            && error.issues !== null
          ) {
            const appliedCount = applyApiValidationIssues(
              error.issues,
              form.setError as (path: string, errorValue: { message: string }) => void,
              CHANGE_PASSWORD_ISSUE_PATHS,
            )
            if (appliedCount > 0) return
          }
          form.setError('root', { message: error.message })
        },
      },
    )
  }

  const isPending = mutation.isPending
  const hasErrors = Object.keys(form.formState.errors).length > 0
  const isSubmitDisabled = isPending || hasErrors

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.password.title')}</CardTitle>
        <CardDescription>{t('profile.password.description')}</CardDescription>
      </CardHeader>
      <CardContent>
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
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('profile.password.current_label')}</FormLabel>
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

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('profile.password.new_label')}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      autoComplete="new-password"
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('profile.password.confirm_label')}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root ? (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitDisabled}>
                {isPending
                  ? t('profile.password.submit_pending')
                  : t('profile.password.submit')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
