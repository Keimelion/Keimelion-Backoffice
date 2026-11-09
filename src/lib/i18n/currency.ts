import { SUPPORTED_CURRENCY_VALUES, SupportedCurrencies } from '@keimelion/sdk/enums'
import type { SupportedCurrency } from '@keimelion/sdk/enums'

export const CURRENCIES = SUPPORTED_CURRENCY_VALUES
export type Currency = SupportedCurrency
export const DEFAULT_CURRENCY: Currency = SupportedCurrencies.EUR

export const CURRENCY_STORAGE_KEY = 'keimelion.currency'

export const CURRENCY_NATIVE_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
}
