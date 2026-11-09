import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import type * as QueryClientModule from './query-client'
import { ApiError } from '@keimelion/sdk/client'
import type * as AuthStorageModule from '@/data-access/_shared/auth-storage'
import type * as NotifyModule from '@/lib/notify'

vi.mock('@/lib/notify', () => ({
  notifyError: vi.fn(),
}))

interface FreshModules {
  createQueryClient: typeof QueryClientModule.createQueryClient
  saveSession: typeof AuthStorageModule.saveSession
  notifyError: typeof NotifyModule.notifyError
}

async function freshQueryClientModule(): Promise<FreshModules> {
  vi.resetModules()
  const queryClientModule = await import('./query-client')
  const storageModule = await import('@/data-access/_shared/auth-storage')
  const notifyModule = await import('@/lib/notify')
  return {
    createQueryClient: queryClientModule.createQueryClient,
    saveSession: storageModule.saveSession,
    notifyError: notifyModule.notifyError,
  }
}

let mockAssign: Mock
let originalLocationDescriptor: PropertyDescriptor | undefined

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()

  originalLocationDescriptor = Object.getOwnPropertyDescriptor(window, 'location')
  mockAssign = vi.fn()
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { assign: mockAssign },
  })
})

afterEach(() => {
  if (originalLocationDescriptor) {
    Object.defineProperty(window, 'location', originalLocationDescriptor)
  }
})

const TEST_USER = {
  id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  email: 'admin@keimelion.app',
  username: 'admin',
  authProvider: 'email' as const,
  role: 'admin' as const,
  avatarImageId: null,
  avatar: null,
  isCgvAccepted: true,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  defaultCurrency: 'EUR' as const,
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
}

describe('QueryClient MutationCache onError', () => {
  it('calls notifyError with a non-401 error', async () => {
    const { createQueryClient, notifyError } = await freshQueryClientModule()
    const client = createQueryClient()

    await client
      .getMutationCache()
      .build(client, { mutationFn: () => Promise.reject(new Error('Server exploded')) })
      .execute(undefined)
      .catch(() => undefined)

    expect(notifyError).toHaveBeenCalledWith(new Error('Server exploded'))
  })

  it('falls back to a generic title when the thrown value is not an Error', async () => {
    const { createQueryClient, notifyError } = await freshQueryClientModule()
    const client = createQueryClient()

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () =>
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          Promise.reject('not an error object'),
      })
      .execute(undefined)
      .catch(() => undefined)

    expect(notifyError).toHaveBeenCalledWith({ title: 'Something went wrong' })
  })

  it('does not call notifyError when meta.silent is true', async () => {
    const { createQueryClient, notifyError } = await freshQueryClientModule()
    const client = createQueryClient()

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () => Promise.reject(new Error('Silent failure')),
        meta: { silent: true },
      })
      .execute(undefined)
      .catch(() => undefined)

    expect(notifyError).not.toHaveBeenCalled()
  })

  it('redirects to /login on 401 and clears storage + cache', async () => {
    const { createQueryClient, saveSession } =
      await freshQueryClientModule()
    const client = createQueryClient()
    saveSession('doomed-token', 'refresh-doomed', TEST_USER)
    client.setQueryData(['some', 'cached', 'data'], { value: 42 })

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () =>
          Promise.reject(new ApiError({ code: 'UNAUTHORIZED', message: 'Unauthorized', status: 401, metadata: {} })),
      })
      .execute(undefined)
      .catch(() => undefined)

    expect(mockAssign).toHaveBeenCalledWith('/login')
    expect(localStorage.getItem('keimelion_access_token')).toBeNull()
    expect(localStorage.getItem('keimelion_user')).toBeNull()
    expect(client.getQueryData(['some', 'cached', 'data'])).toBeUndefined()
  })

  it('does NOT call notifyError when a 401 triggers a redirect', async () => {
    const { createQueryClient, notifyError } = await freshQueryClientModule()
    const client = createQueryClient()

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () =>
          Promise.reject(new ApiError({ code: 'UNAUTHORIZED', message: 'Unauthorized', status: 401, metadata: {} })),
      })
      .execute(undefined)
      .catch(() => undefined)

    expect(notifyError).not.toHaveBeenCalled()
  })

  it('skips the redirect when meta.skipUnauthorizedRedirect is true and calls notifyError', async () => {
    const { createQueryClient, notifyError } = await freshQueryClientModule()
    const client = createQueryClient()

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () =>
          Promise.reject(new ApiError({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials', status: 401, metadata: {} })),
        meta: { skipUnauthorizedRedirect: true },
      })
      .execute(undefined)
      .catch(() => undefined)

    expect(mockAssign).not.toHaveBeenCalled()
    expect(notifyError).toHaveBeenCalledWith(
      new ApiError({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials', status: 401, metadata: {} }),
    )
  })
})
