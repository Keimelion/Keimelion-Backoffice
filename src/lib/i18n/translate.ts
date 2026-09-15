import { createIntl } from 'react-intl'
import { useLocaleStore } from '@/lib/i18n/locale-store'
import { enMessages } from '@/lib/i18n/messages/en'
import { frMessages } from '@/lib/i18n/messages/fr'
import type { Locale } from '@/lib/i18n/locale'

type Messages = Record<string, string>

const MESSAGES: Record<Locale, Messages> = {
  en: enMessages,
  fr: frMessages,
}

export function translate(id: string, values?: Record<string, string | number>): string {
  const locale = useLocaleStore.getState().locale
  const intl = createIntl({ locale, defaultLocale: 'en', messages: MESSAGES[locale] })
  return intl.formatMessage({ id }, values)
}
