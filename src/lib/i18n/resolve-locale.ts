import { LOCALES, DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from './locale'
import type { Locale } from './locale'

function extractLanguageCode(browserLocale: string): string {
  return browserLocale.split('-')[0]?.toLowerCase() ?? ''
}

function isValidLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

function resolveFromBrowser(navigatorLanguages: readonly string[]): Locale {
  for (const browserLocale of navigatorLanguages) {
    const code = extractLanguageCode(browserLocale)
    if (isValidLocale(code)) return code
  }
  return DEFAULT_LOCALE
}

function readStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored !== null && isValidLocale(stored)) return stored
  } catch {
    return null
  }
  return null
}

export function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    return
  }
}

export function resolveInitialLocale(): Locale {
  const stored = readStoredLocale()
  if (stored !== null) return stored

  const browserLocales =
    typeof navigator !== 'undefined'
      ? (navigator.languages.length > 0 ? navigator.languages : [navigator.language])
      : [DEFAULT_LOCALE]

  const resolved = resolveFromBrowser(browserLocales)
  persistLocale(resolved)
  return resolved
}
