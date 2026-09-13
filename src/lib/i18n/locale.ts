import { LOCALES as API_LOCALES, DEFAULT_LOCALE as API_DEFAULT_LOCALE } from '@keimelion/api/shared/enums/locale'
import type { Locale as ApiLocale } from '@keimelion/api/shared/enums/locale'

export const LOCALES = API_LOCALES
export type Locale = ApiLocale
export const DEFAULT_LOCALE = API_DEFAULT_LOCALE

export const LOCALE_STORAGE_KEY = 'keimelion.locale'

export const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
}
