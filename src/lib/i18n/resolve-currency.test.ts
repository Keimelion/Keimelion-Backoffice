import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CURRENCY_STORAGE_KEY } from './currency'

const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => { store[key] = value },
    removeItem: (key: string): void => {
      store = Object.fromEntries(Object.entries(store).filter(([k]) => k !== key))
    },
    clear: (): void => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true })

beforeEach(() => {
  mockLocalStorage.clear()
  vi.unstubAllGlobals()
})

async function importFresh(): Promise<{ resolveInitialCurrency: () => string }> {
  vi.resetModules()
  return import('./resolve-currency')
}

describe('resolveInitialCurrency', () => {
  it('returns stored currency when localStorage has a valid value', async () => {
    mockLocalStorage.setItem(CURRENCY_STORAGE_KEY, 'USD')
    const { resolveInitialCurrency } = await importFresh()
    expect(resolveInitialCurrency()).toBe('USD')
  })

  it('ignores invalid stored currency and falls back to EUR', async () => {
    mockLocalStorage.setItem(CURRENCY_STORAGE_KEY, 'XXX')
    const { resolveInitialCurrency } = await importFresh()
    expect(resolveInitialCurrency()).toBe('EUR')
  })

  it('falls back to EUR when nothing is stored', async () => {
    const { resolveInitialCurrency } = await importFresh()
    expect(resolveInitialCurrency()).toBe('EUR')
  })

  it('persists the fallback currency to localStorage', async () => {
    const { resolveInitialCurrency } = await importFresh()
    resolveInitialCurrency()
    expect(mockLocalStorage.getItem(CURRENCY_STORAGE_KEY)).toBe('EUR')
  })

  it('does not overwrite a stored currency with the fallback', async () => {
    mockLocalStorage.setItem(CURRENCY_STORAGE_KEY, 'JPY')
    const { resolveInitialCurrency } = await importFresh()
    resolveInitialCurrency()
    expect(mockLocalStorage.getItem(CURRENCY_STORAGE_KEY)).toBe('JPY')
  })
})
