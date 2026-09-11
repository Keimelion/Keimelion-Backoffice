import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { notifyError, notifyInfo, notifySuccess, notifyWarning } from './notify'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('notifySuccess', () => {
  it('calls toast.success with title only', () => {
    notifySuccess({ title: 'User updated' })
    expect(toast.success).toHaveBeenCalledWith('User updated', {
      description: undefined,
      action: undefined,
    })
  })

  it('forwards description and action to toast.success', () => {
    const action = { label: 'Undo', onClick: vi.fn() }
    notifySuccess({ title: 'User updated', description: 'Changes saved.', action })
    expect(toast.success).toHaveBeenCalledWith('User updated', {
      description: 'Changes saved.',
      action,
    })
  })
})

describe('notifyError', () => {
  it('calls toast.error with title only', () => {
    notifyError({ title: 'Login failed' })
    expect(toast.error).toHaveBeenCalledWith('Login failed', {
      description: undefined,
      action: undefined,
    })
  })

  it('calls toast.error with title and description', () => {
    notifyError({ title: 'Login failed', description: 'Check your credentials.' })
    expect(toast.error).toHaveBeenCalledWith('Login failed', {
      description: 'Check your credentials.',
      action: undefined,
    })
  })

  it('extracts message from an Error instance and uses default title', () => {
    notifyError(new Error('Network timeout'))
    expect(toast.error).toHaveBeenCalledWith('Something went wrong', {
      description: 'Network timeout',
    })
  })

  it('forwards action to toast.error', () => {
    const action = { label: 'Retry', onClick: vi.fn() }
    notifyError({ title: 'Upload failed', description: 'The file could not be uploaded.', action })
    expect(toast.error).toHaveBeenCalledWith('Upload failed', {
      description: 'The file could not be uploaded.',
      action,
    })
  })
})

describe('notifyWarning', () => {
  it('calls toast.warning with expected payload', () => {
    notifyWarning({ title: 'Session expiring', description: 'You will be signed out soon.' })
    expect(toast.warning).toHaveBeenCalledWith('Session expiring', {
      description: 'You will be signed out soon.',
      action: undefined,
    })
  })
})

describe('notifyInfo', () => {
  it('calls toast.info with expected payload', () => {
    notifyInfo({ title: 'Update available', description: 'Refresh to get the latest version.' })
    expect(toast.info).toHaveBeenCalledWith('Update available', {
      description: 'Refresh to get the latest version.',
      action: undefined,
    })
  })
})
