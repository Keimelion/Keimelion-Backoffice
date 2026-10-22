'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CURRENCIES, CURRENCY_NATIVE_SYMBOLS } from '@/lib/i18n/currency'
import { useCurrencyStore } from '@/lib/i18n/currency-store'
import { useTranslate } from '@/lib/i18n/use-translate'

export function CurrencyPicker(): React.JSX.Element {
  const currency = useCurrencyStore((state) => state.currency)
  const setCurrency = useCurrencyStore((state) => state.setCurrency)
  const t = useTranslate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={t('common.currency_picker.select_currency')}
        >
          {CURRENCY_NATIVE_SYMBOLS[currency]} {currency}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {CURRENCIES.filter((currencyOption) => currencyOption !== currency).map((currencyOption) => (
          <DropdownMenuItem
            key={currencyOption}
            onClick={() => { setCurrency(currencyOption) }}
          >
            {CURRENCY_NATIVE_SYMBOLS[currencyOption]} {currencyOption}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
