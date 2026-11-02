import { CURRENCIES, CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY } from './currency'
import type { Currency } from './currency'

function isValidCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value)
}

function readStoredCurrency(): Currency | null {
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (stored !== null && isValidCurrency(stored)) return stored
  } catch {
    return null
  }
  return null
}

export function persistCurrency(currency: Currency): void {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
  } catch {
    return
  }
}

export function resolveInitialCurrency(): Currency {
  const stored = readStoredCurrency()
  if (stored !== null) return stored

  persistCurrency(DEFAULT_CURRENCY)
  return DEFAULT_CURRENCY
}
