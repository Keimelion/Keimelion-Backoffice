'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { USER_ROLE_VALUES, UserRoles } from '@keimelion/api/shared/enums/user-role'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createAdminUserInputSchema,
  updateAdminUserInputSchema,
  type CreateAdminUserInput,
  type UpdateAdminUserInput,
} from '@/data-access/users/admin-users.schemas'
import type { AdminApiUser } from '@/data-access/users/list-users'
import { useTranslate } from '@/lib/i18n/use-translate'
import { RoleBadge } from '@/features/users/components/role-badge'

const DEFAULT_ROLE = UserRoles.USER

export type UserFormCreateValues = CreateAdminUserInput
export type UserFormEditValues = UpdateAdminUserInput

type UserFormProps =
  | {
      mode: 'create'
      onSubmit: (values: UserFormCreateValues, setError: UseFormSetError<UserFormCreateValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }
  | {
      mode: 'edit'
      user: AdminApiUser
      onSubmit: (values: UserFormEditValues, setError: UseFormSetError<UserFormEditValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }

function buildDefaultValues(props: UserFormProps): UserFormCreateValues {
  if (props.mode === 'edit') {
    return {
      email: props.user.email,
      username: props.user.username,
      role: props.user.role,
    }
  }
  return { email: '', username: null, role: DEFAULT_ROLE }
}

export function UserForm(props: UserFormProps): React.JSX.Element {
  const { mode, onDirtyChange, isPending } = props
  const t = useTranslate()
  const isEdit = mode === 'edit'

  const form = useForm<UserFormCreateValues>({
    resolver: zodResolver(createAdminUserInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: buildDefaultValues(props),
  })

  const values = form.watch()
  const isFormValid = isEdit
    ? updateAdminUserInputSchema.safeParse({ role: values.role }).success
    : createAdminUserInputSchema.safeParse(values).success
  const { isDirty } = form.formState
  const canSubmit = isFormValid && isDirty && !isPending

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          void form.handleSubmit((submittedValues) => {
            if (props.mode === 'edit') {
              props.onSubmit({ role: submittedValues.role }, form.setError)
              return
            }
            props.onSubmit(submittedValues, form.setError)
          })(event)
        }}
        noValidate
      >
        {isEdit ? null : (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('users.form.email_label')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('users.form.email_placeholder')}
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('users.form.username_label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('users.form.username_placeholder')}
                      disabled={isPending}
                      value={field.value ?? ''}
                      onChange={(event) => {
                        const next = event.target.value
                        field.onChange(next.length > 0 ? next : null)
                      }}
                    />
                  </FormControl>
                  <FormDescription>{t('users.form.username_help')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('users.form.role_label')}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {USER_ROLE_VALUES.map((role) => (
                    <SelectItem key={role} value={role}>
                      <RoleBadge role={role} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEdit ? null : (
                <FormDescription>{t('users.form.role_help_create')}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {isEdit && isDirty ? (
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
            {t('users.form.role_change_warning')}
          </p>
        ) : null}

        {form.formState.errors.root ? (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!canSubmit}>
            {isPending
              ? t('users.form.submit_pending')
              : isEdit
                ? t('users.form.submit_edit')
                : t('users.form.submit_create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
