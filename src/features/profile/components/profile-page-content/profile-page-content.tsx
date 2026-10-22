'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChangePasswordForm } from '@/features/profile/components/change-password-form'
import { DefaultCurrencyForm } from '@/features/profile/components/default-currency-form'
import { PersonalInfoForm } from '@/features/profile/components/personal-info-form'
import { useProfile } from '@/features/profile/hooks/use-profile'
import { useTranslate } from '@/lib/i18n/use-translate'

export function ProfilePageContent(): React.JSX.Element {
  const t = useTranslate()
  const { data: user, isError, isPending, refetch } = useProfile()

  if (isPending) {
    return (
      <div className="flex flex-col gap-10">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{t('query.error.default')}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void refetch()
          }}
        >
          {t('common.actions.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">
            {t('profile.section.account')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('profile.section.account_description')}
          </p>
        </header>
        <div className="flex flex-col gap-6">
          <PersonalInfoForm user={user} />
          <DefaultCurrencyForm user={user} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">
            {t('profile.section.security')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('profile.section.security_description')}
          </p>
        </header>
        <ChangePasswordForm />
      </section>
    </div>
  )
}
