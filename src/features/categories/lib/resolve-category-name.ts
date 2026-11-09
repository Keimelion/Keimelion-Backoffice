import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locale'
import type { AdminCategoryDetailParsed } from '@keimelion/sdk/schemas'

export function resolveCategoryName(
  category: Pick<AdminCategoryDetailParsed, 'translations'>,
  locale: Locale,
): string {
  return pickTranslation(category.translations, locale)
}

export function pickTranslation(
  translations: AdminCategoryDetailParsed['translations'],
  locale: Locale,
): string {
  const preferred = translations[locale]
  if (preferred !== undefined && preferred.length > 0) return preferred
  const fallback = translations[DEFAULT_LOCALE]
  if (fallback !== undefined && fallback.length > 0) return fallback
  for (const value of Object.values(translations)) {
    if (value.length > 0) return value
  }
  return ''
}
