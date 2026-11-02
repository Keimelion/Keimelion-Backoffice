import { create } from 'zustand'
import { resolveInitialLocale, persistLocale } from './resolve-locale'
import type { Locale } from './locale'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: resolveInitialLocale(),
  setLocale: (locale: Locale): void => {
    persistLocale(locale)
    set({ locale })
  },
}))
