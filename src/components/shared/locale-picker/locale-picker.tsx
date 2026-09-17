'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LOCALES, LOCALE_NATIVE_NAMES } from '@/lib/i18n/locale'
import type { Locale } from '@/lib/i18n/locale'
import { useLocaleStore } from '@/lib/i18n/locale-store'
import { useTranslate } from '@/lib/i18n/use-translate'

const LOCALE_FLAG: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
}

export function LocalePicker(): React.JSX.Element {
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)
  const t = useTranslate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={t('common.locale_picker.select_language')}
        >
          {LOCALE_FLAG[locale]} {LOCALE_NATIVE_NAMES[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.filter((localeOption) => localeOption !== locale).map((localeOption) => (
          <DropdownMenuItem
            key={localeOption}
            onClick={() => { setLocale(localeOption) }}
          >
            {LOCALE_FLAG[localeOption]} {LOCALE_NATIVE_NAMES[localeOption]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
