import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockUseQueryResult, renderWithIntl } from '@/test/test-utils'
import { DeployedVersions } from './deployed-versions'

vi.mock('@/features/health/hooks/use-api-version', () => ({
  useApiVersion: vi.fn(),
}))

vi.mock('@/lib/app-version', () => ({
  APP_VERSION: 'v0.2.0+a1b2c3d',
}))

import { useApiVersion } from '@/features/health/hooks/use-api-version'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DeployedVersions', () => {
  it('shows the Backoffice and API versions', () => {
    vi.mocked(useApiVersion).mockReturnValue(mockUseQueryResult({ data: '0.2.0' }))
    renderWithIntl(<DeployedVersions />)
    expect(screen.getByText('Backoffice v0.2.0+a1b2c3d · API v0.2.0')).toBeInTheDocument()
  })

  it('shows a placeholder while the API version is loading', () => {
    vi.mocked(useApiVersion).mockReturnValue(mockUseQueryResult<string>({ isLoading: true }))
    renderWithIntl(<DeployedVersions />)
    expect(screen.getByText('Backoffice v0.2.0+a1b2c3d · API —')).toBeInTheDocument()
  })

  it('shows a placeholder when the health endpoint fails', () => {
    vi.mocked(useApiVersion).mockReturnValue(mockUseQueryResult<string>({ error: new Error('Network error') }))
    renderWithIntl(<DeployedVersions />)
    expect(screen.getByText('Backoffice v0.2.0+a1b2c3d · API —')).toBeInTheDocument()
  })
})
