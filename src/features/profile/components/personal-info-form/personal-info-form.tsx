'use client'

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import type { ApiUser } from '@/data-access/_shared/user'
import { personalInfoFormSchema } from '@/data-access/users/profile.schemas'
import type { PersonalInfoFormValues, UpdateProfileInput } from '@/data-access/users/profile.schemas'
import { useUpdateProfile } from '@/features/profile/hooks/use-update-profile'
import { RoleBadge } from '@/features/users/components/role-badge'
import { applyApiValidationIssues } from '@/lib/apply-api-validation-issues'
import { translate } from '@/lib/i18n/translate'
import { useTranslate } from '@/lib/i18n/use-translate'
import { notifySuccess } from '@/lib/notify'
import { pickChangedFields } from '@/lib/pick-changed-fields'

const EMAIL_INPUT_ID = 'profile-personal-info-email'

const CONFLICT_FIELD = 'username'
const EDITABLE_FIELDS = ['username', 'avatarUrl', 'isMarketingOptedIn'] as const satisfies readonly (keyof PersonalInfoFormValues)[]
const UPDATE_ISSUE_PATHS = ['username', 'avatarUrl', 'isMarketingOptedIn'] as const

interface PersonalInfoFormProps {
  user: ApiUser
}

function buildDefaultValues(user: ApiUser): PersonalInfoFormValues {
  return {
    username: user.username,
    avatarUrl: user.avatarUrl,
    isMarketingOptedIn: user.isMarketingOptedIn,
  }
}

export function PersonalInfoForm({ user }: PersonalInfoFormProps): React.JSX.Element {
  const t = useTranslate()
  const mutation = useUpdateProfile()

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: buildDefaultValues(user),
    values: buildDefaultValues(user),
  })

  const handleSubmit = (values: PersonalInfoFormValues): void => {
    const original = buildDefaultValues(user)
    const patch = pickChangedFields<PersonalInfoFormValues, (typeof EDITABLE_FIELDS)[number]>(
      original,
      values,
      EDITABLE_FIELDS,
    ) as UpdateProfileInput

    if (Object.keys(patch).length === 0) return

    mutation.mutate(patch, {
      onSuccess: () => {
        notifySuccess({ title: translate('profile.personal_info.submit_success') })
        form.reset(values)
      },
      onError: (error) => {
        if (error instanceof ApiRequestError && error.status === HttpStatus.CONFLICT) {
          form.setError(CONFLICT_FIELD, { message: t('users.form.error.conflict') })
          return
        }
        if (
          error instanceof ApiRequestError
          && error.code === ErrorCode.UNPROCESSABLE_ENTITY
          && error.issues !== null
        ) {
          const appliedCount = applyApiValidationIssues(
            error.issues,
            form.setError as (path: string, errorValue: { message: string }) => void,
            UPDATE_ISSUE_PATHS,
          )
          if (appliedCount > 0) return
        }
        form.setError('root', { message: error.message })
      },
    })
  }

  const isPending = mutation.isPending
  const { isDirty, errors } = form.formState
  const hasErrors = Object.keys(errors).length > 0
  const canSubmit = isDirty && !hasErrors && !isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.personal_info.title')}</CardTitle>
        <CardDescription>{t('profile.personal_info.description')}</CardDescription>
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={EMAIL_INPUT_ID}>
                {t('profile.personal_info.email_label')}
              </Label>
              <Input id={EMAIL_INPUT_ID} value={user.email} disabled readOnly />
              <FormDescription>{t('profile.personal_info.email_help')}</FormDescription>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t('profile.personal_info.role_label')}</Label>
              <div>
                <RoleBadge role={user.role} />
              </div>
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profile.personal_info.username_label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('profile.personal_info.username_placeholder')}
                      disabled={isPending}
                      value={field.value ?? ''}
                      onChange={(event) => {
                        const next = event.target.value
                        field.onChange(next.length > 0 ? next : null)
                      }}
                    />
                  </FormControl>
                  <FormDescription>{t('profile.personal_info.username_help')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profile.personal_info.avatar_url_label')}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder={t('profile.personal_info.avatar_url_placeholder')}
                      disabled={isPending}
                      value={field.value ?? ''}
                      onChange={(event) => {
                        const next = event.target.value
                        field.onChange(next.length > 0 ? next : null)
                      }}
                    />
                  </FormControl>
                  <FormDescription>{t('profile.personal_info.avatar_url_help')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isMarketingOptedIn"
              render={({ field }) => (
                <FormItem className="flex-row items-start justify-between gap-4 rounded-md border border-border p-4">
                  <div className="flex flex-col gap-1">
                    <FormLabel>{t('profile.personal_info.marketing_opt_in_label')}</FormLabel>
                    <FormDescription>
                      {t('profile.personal_info.marketing_opt_in_description')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.formState.errors.root ? (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={!canSubmit}>
                {isPending
                  ? t('profile.personal_info.submit_pending')
                  : t('profile.personal_info.submit')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
