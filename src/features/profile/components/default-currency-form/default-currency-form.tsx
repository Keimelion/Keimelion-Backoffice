'use client'

import { ErrorCode } from '@keimelion/sdk/enums'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateProfile } from '@/features/profile/hooks/use-update-profile'
import { CURRENCIES, CURRENCY_NATIVE_SYMBOLS, type Currency } from '@/lib/i18n/currency'
import { translate } from '@/lib/i18n/translate'
import { useTranslate } from '@/lib/i18n/use-translate'
import { notifyError, notifySuccess } from '@/lib/notify'
import { ApiError } from '@keimelion/sdk/client'
import type { UserDetailParsed } from '@keimelion/sdk/schemas'

interface DefaultCurrencyFormProps {
  user: UserDetailParsed
}

export function DefaultCurrencyForm({ user }: DefaultCurrencyFormProps): React.JSX.Element {
  const t = useTranslate()
  const mutation = useUpdateProfile()
  const selectId = 'profile-default-currency-select'

  const handleChange = (nextValue: string): void => {
    const next = nextValue as Currency
    if (next === user.defaultCurrency) return
    mutation.mutate(
      { input: { defaultCurrency: next }, avatar: null },
      {
        onSuccess: () => {
          notifySuccess({ title: translate('profile.currency.submit_success') })
        },
        onError: (error) => {
          if (
            error instanceof ApiError
            && error.code === ErrorCode.UNPROCESSABLE_ENTITY
          ) {
            notifyError({ title: translate('query.error.default'), description: error.message })
            return
          }
          notifyError(error)
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.currency.title')}</CardTitle>
        <CardDescription>{t('profile.currency.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={selectId} className="text-sm font-medium">
            {t('profile.currency.label')}
          </label>
          <Select
            value={user.defaultCurrency}
            onValueChange={handleChange}
            disabled={mutation.isPending}
          >
            <SelectTrigger id={selectId} className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {CURRENCY_NATIVE_SYMBOLS[currency]} {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
