'use client'

import { IntlProvider } from 'react-intl'
import { useLocaleStore } from '@/lib/i18n/locale-store'
import { enMessages } from '@/lib/i18n/messages/en'
import { frMessages } from '@/lib/i18n/messages/fr'
import type { Locale } from '@/lib/i18n/locale'

type Messages = Record<string, string>

const MESSAGES: Record<Locale, Messages> = {
  en: enMessages,
  fr: frMessages,
}

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps): React.JSX.Element {
  const locale = useLocaleStore((state) => state.locale)
  return (
    <IntlProvider locale={locale} messages={MESSAGES[locale]} defaultLocale="en">
      {children}
    </IntlProvider>
  )
}
