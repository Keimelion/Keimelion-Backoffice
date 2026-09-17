import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

const ResizeObserverStub = class {
  observe = (): void => undefined
  unobserve = (): void => undefined
  disconnect = (): void => undefined
}

globalThis.ResizeObserver = ResizeObserverStub

afterEach(() => {
  cleanup()
})
