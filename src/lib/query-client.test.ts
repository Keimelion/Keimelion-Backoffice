import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import type * as QueryClientModule from './query-client'
import type * as ClientModule from '@/data-access/_client'
import type * as AuthStorageModule from '@/data-access/_auth-storage'
import type * as SonnerModule from 'sonner'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

interface FreshModules {
  createQueryClient: typeof QueryClientModule.createQueryClient
  ApiRequestError: typeof ClientModule.ApiRequestError
  setAccessToken: typeof AuthStorageModule.setAccessToken
  setStoredUser: typeof AuthStorageModule.setStoredUser
  toast: typeof SonnerModule.toast
}

async function freshQueryClientModule(): Promise<FreshModules> {
  vi.resetModules()
  const queryClientModule = await import('./query-client')
  const clientModule = await import('@/data-access/_client')
  const storageModule = await import('@/data-access/_auth-storage')
  const sonnerModule = await import('sonner')
  return {
    createQueryClient: queryClientModule.createQueryClient,
    ApiRequestError: clientModule.ApiRequestError,
    setAccessToken: storageModule.setAccessToken,
    setStoredUser: storageModule.setStoredUser,
    toast: sonnerModule.toast,
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
  id: 'u1',
  email: 'admin@keimelion.app',
  username: 'admin',
  authProvider: 'email' as const,
  role: 'admin' as const,
  avatarUrl: null,
  isCgvAccepted: true,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('QueryClient MutationCache onError', () => {
  it('toasts a non-401 error message', async () => {
    const { createQueryClient, toast } = await freshQueryClientModule()
    const client = createQueryClient()

    await client
      .getMutationCache()
      .build(client, { mutationFn: () => Promise.reject(new Error('Server exploded')) })
      .execute(undefined)
      .catch(() => undefined)

    expect(toast.error).toHaveBeenCalledWith('Server exploded')
  })

  it('does not toast when meta.silent is true', async () => {
    const { createQueryClient, toast } = await freshQueryClientModule()
    const client = createQueryClient()

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () => Promise.reject(new Error('Silent failure')),
        meta: { silent: true },
      })
      .execute(undefined)
      .catch(() => undefined)

    expect(toast.error).not.toHaveBeenCalled()
  })

  it('redirects to /login on 401 and clears storage + cache', async () => {
    const { createQueryClient, ApiRequestError, setAccessToken, setStoredUser } =
      await freshQueryClientModule()
    const client = createQueryClient()
    setAccessToken('doomed-token')
    setStoredUser(TEST_USER)
    client.setQueryData(['some', 'cached', 'data'], { value: 42 })

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () =>
          Promise.reject(new ApiRequestError('UNAUTHORIZED', 'Unauthorized', 401)),
      })
      .execute(undefined)
      .catch(() => undefined)

    expect(mockAssign).toHaveBeenCalledWith('/login')
    expect(localStorage.getItem('keimelion_access_token')).toBeNull()
    expect(localStorage.getItem('keimelion_user')).toBeNull()
    expect(client.getQueryData(['some', 'cached', 'data'])).toBeUndefined()
  })

  it('does NOT toast when a 401 triggers a redirect', async () => {
    const { createQueryClient, ApiRequestError, toast } = await freshQueryClientModule()
    const client = createQueryClient()

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () =>
          Promise.reject(new ApiRequestError('UNAUTHORIZED', 'Unauthorized', 401)),
      })
      .execute(undefined)
      .catch(() => undefined)

    expect(toast.error).not.toHaveBeenCalled()
  })

  it('skips the redirect when meta.skipUnauthorizedRedirect is true and toasts instead', async () => {
    const { createQueryClient, ApiRequestError, toast } = await freshQueryClientModule()
    const client = createQueryClient()

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () =>
          Promise.reject(new ApiRequestError('INVALID_CREDENTIALS', 'Invalid credentials', 401)),
        meta: { skipUnauthorizedRedirect: true },
      })
      .execute(undefined)
      .catch(() => undefined)

    expect(mockAssign).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
  })
})
