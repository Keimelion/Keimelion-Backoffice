import { create } from 'zustand'
import { persistCurrency, resolveInitialCurrency } from './resolve-currency'
import type { Currency } from './currency'

interface CurrencyState {
  currency: Currency
  setCurrency: (currency: Currency) => void
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: resolveInitialCurrency(),
  setCurrency: (currency: Currency): void => {
    persistCurrency(currency)
    set({ currency })
  },
}))
