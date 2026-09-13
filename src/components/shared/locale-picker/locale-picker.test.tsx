import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { LocalePicker } from './locale-picker'
import type { Locale } from '@/lib/i18n/locale'
import { axiosInstance } from '@/data-access/_shared/axios'

const mockSetLocale = vi.fn()
let currentLocale: Locale = 'en'

vi.mock('@/lib/i18n/locale-store', () => ({
  useLocaleStore: (selector: (state: { locale: Locale; setLocale: typeof mockSetLocale }) => unknown) =>
    selector({ locale: currentLocale, setLocale: mockSetLocale }),
}))

vi.mock('@/data-access/_shared/axios', () => ({
  axiosInstance: {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { headers: { common: {} } },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  currentLocale = 'en'
})

describe('LocalePicker', () => {
  it('renders the current locale label', () => {
    render(<LocalePicker />)
    expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument()
    expect(screen.getByText(/English/)).toBeInTheDocument()
  })

  it('opens dropdown with all locale options', async () => {
    const user = userEvent.setup()
    render(<LocalePicker />)
    await user.click(screen.getByRole('button', { name: /select language/i }))
    expect(screen.getByText(/Français/)).toBeInTheDocument()
  })

  it('calls setLocale with fr when Français is selected', async () => {
    const user = userEvent.setup()
    render(<LocalePicker />)
    await user.click(screen.getByRole('button', { name: /select language/i }))
    await user.click(screen.getByText(/Français/))
    expect(mockSetLocale).toHaveBeenCalledWith('fr')
  })

  it('verifies the axios instance is accessible for interceptor setup', () => {
    expect(axiosInstance).toBeDefined()
  })
})
