import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryClientWrapper } from '@/test/test-utils'
import { useApiVersion } from './use-api-version'

vi.mock('@/data-access/health/health.api', () => ({
  fetchHealth: vi.fn(),
}))

import { fetchHealth } from '@/data-access/health/health.api'

const MOCK_HEALTH = {
  status: 'ok',
  database: 'ok',
  timestamp: new Date('2026-11-11T00:00:00.000Z'),
  version: '0.2.0',
} as const

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useApiVersion', () => {
  it('returns the API version from the health endpoint', async () => {
    vi.mocked(fetchHealth).mockResolvedValue(MOCK_HEALTH)
    const { result } = renderHook(() => useApiVersion(), { wrapper: createQueryClientWrapper() })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data).toBe('0.2.0')
  })

  it('exposes isError when the health endpoint fails', async () => {
    vi.mocked(fetchHealth).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useApiVersion(), { wrapper: createQueryClientWrapper() })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(result.current.data).toBeUndefined()
  })
})
