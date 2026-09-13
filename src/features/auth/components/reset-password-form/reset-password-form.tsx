'use client'

import { useEffect } from 'react'
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
import { PasswordInput } from '@/components/ui/password-input'
import {
  resetPasswordInputSchema,
  type ResetPasswordInput,
} from '@/data-access/auth/reset-password'
import { useResetPassword } from '@/features/auth/hooks/use-reset-password'

export function ResetPasswordForm(): React.JSX.Element {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const resetPassword = useResetPassword()

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const newPassword = form.watch('newPassword')
  const confirmPasswordTouched = form.formState.touchedFields.confirmPassword === true

  useEffect(() => {
    if (confirmPasswordTouched) {
      void form.trigger('confirmPassword')
    }
  }, [newPassword, confirmPasswordTouched, form])

  const handleSubmit = (values: ResetPasswordInput): void => {
    resetPassword.mutate({ token, newPassword: values.newPassword })
  }

  const isPending = resetPassword.isPending
  const hasErrors = Object.keys(form.formState.errors).length > 0
  const isSubmitDisabled = isPending || hasErrors

  return (
    <AuthCard title="Reset your password" description="Enter your new password below.">
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
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
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
                <FormLabel>Confirm password</FormLabel>
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
          <Button type="submit" className="mt-2" disabled={isSubmitDisabled}>
            {isPending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}
