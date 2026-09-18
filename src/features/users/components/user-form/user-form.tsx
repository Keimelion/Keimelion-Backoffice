'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { USER_ROLE_VALUES } from '@keimelion/api/shared/enums/user-role'
import type { UserRole } from '@keimelion/api/shared/enums/user-role'
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
import type { TranslateFn } from '@/lib/i18n/use-translate'

const DEFAULT_ROLE: UserRole = 'user'

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

export function UserForm(props: UserFormProps): React.JSX.Element {
  if (props.mode === 'edit') {
    return (
      <UserEditForm
        user={props.user}
        onSubmit={props.onSubmit}
        onDirtyChange={props.onDirtyChange}
        isPending={props.isPending}
      />
    )
  }
  return (
    <UserCreateForm
      onSubmit={props.onSubmit}
      onDirtyChange={props.onDirtyChange}
      isPending={props.isPending}
    />
  )
}

function resolveSubmitLabel(isPending: boolean, isEdit: boolean, t: TranslateFn): string {
  if (isPending) return t('users.form.submit_pending')
  if (isEdit) return t('users.form.submit_edit')
  return t('users.form.submit_create')
}

interface UserCreateFormProps {
  onSubmit: (values: UserFormCreateValues, setError: UseFormSetError<UserFormCreateValues>) => void
  onDirtyChange: (isDirty: boolean) => void
  isPending: boolean
}

function UserCreateForm({
  onSubmit,
  onDirtyChange,
  isPending,
}: UserCreateFormProps): React.JSX.Element {
  const t = useTranslate()

  const form = useForm<UserFormCreateValues>({
    resolver: zodResolver(createAdminUserInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      username: null,
      role: DEFAULT_ROLE,
    },
  })

  const values = form.watch()
  const isFormValid = createAdminUserInputSchema.safeParse(values).success
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
            onSubmit(submittedValues, form.setError)
          })(event)
        }}
        noValidate
      >
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
                      {t(`users.role.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{t('users.form.role_help_create')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root ? (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!canSubmit}>
            {resolveSubmitLabel(isPending, false, t)}
          </Button>
        </div>
      </form>
    </Form>
  )
}

interface UserEditFormProps {
  user: AdminApiUser
  onSubmit: (values: UserFormEditValues, setError: UseFormSetError<UserFormEditValues>) => void
  onDirtyChange: (isDirty: boolean) => void
  isPending: boolean
}

function UserEditForm({
  user,
  onSubmit,
  onDirtyChange,
  isPending,
}: UserEditFormProps): React.JSX.Element {
  const t = useTranslate()

  const form = useForm<UserFormEditValues>({
    resolver: zodResolver(updateAdminUserInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      role: user.role,
    },
  })

  const values = form.watch()
  const isFormValid = updateAdminUserInputSchema.safeParse(values).success
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
            onSubmit(submittedValues, form.setError)
          })(event)
        }}
        noValidate
      >
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
                      {t(`users.role.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isDirty ? (
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
            {resolveSubmitLabel(isPending, true, t)}
          </Button>
        </div>
      </form>
    </Form>
  )
}
