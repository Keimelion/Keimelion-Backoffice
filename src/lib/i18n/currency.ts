import {
  SUPPORTED_CURRENCY_VALUES,
  SupportedCurrencies,
} from '@keimelion/api/shared/enums/currency'
import type { SupportedCurrency } from '@keimelion/api/shared/enums/currency'

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
