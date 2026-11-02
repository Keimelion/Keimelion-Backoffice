'use client'

import { ErrorCode } from '@keimelion/api/shared/enums/error-code'
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
import { ApiRequestError } from '@/data-access/_shared/api-error'
import type { ApiUser } from '@/data-access/_shared/user'
import { useUpdateProfile } from '@/features/profile/hooks/use-update-profile'
import { CURRENCIES, CURRENCY_NATIVE_SYMBOLS, type Currency } from '@/lib/i18n/currency'
import { translate } from '@/lib/i18n/translate'
import { useTranslate } from '@/lib/i18n/use-translate'
import { notifyError, notifySuccess } from '@/lib/notify'

interface DefaultCurrencyFormProps {
  user: ApiUser
}

export function DefaultCurrencyForm({ user }: DefaultCurrencyFormProps): React.JSX.Element {
  const t = useTranslate()
  const mutation = useUpdateProfile()
  const selectId = 'profile-default-currency-select'

  const handleChange = (nextValue: string): void => {
    const next = nextValue as Currency
    if (next === user.defaultCurrency) return
    mutation.mutate(
      { defaultCurrency: next },
      {
        onSuccess: () => {
          notifySuccess({ title: translate('profile.currency.submit_success') })
        },
        onError: (error) => {
          if (
            error instanceof ApiRequestError
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
