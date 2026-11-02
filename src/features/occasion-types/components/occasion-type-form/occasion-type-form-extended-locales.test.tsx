import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithQueryClient } from '@/test/test-utils'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

vi.mock('@/lib/i18n/locale', () => ({
  LOCALES: ['fr', 'en', 'es'] as const,
  DEFAULT_LOCALE: 'en' as const,
  LOCALE_NATIVE_NAMES: { fr: 'Français', en: 'English', es: 'Español' },
}))

import { OccasionTypeForm } from './occasion-type-form'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('OccasionTypeForm (extended LOCALES)', () => {
  it('renders one label field per locale including a third locale', () => {
    renderWithQueryClient(
      <OccasionTypeForm
        mode="create"
        onSubmit={vi.fn()}
        onDirtyChange={vi.fn()}
        isPending={false}
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Label (Français)' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Label (English)' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Label (Español)' })).toBeInTheDocument()
  })
})
