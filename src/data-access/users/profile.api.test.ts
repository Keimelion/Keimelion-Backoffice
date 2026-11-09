import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { HttpStatus } from '@keimelion/sdk/enums'
import { createApiMock, type ApiMock } from '@/test/api-mock'
import { updateMe } from './profile.api'

const MOCK_USER = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'admin@keimelion.app',
  username: 'admin',
  authProvider: 'email',
  role: 'admin',
  avatarImageId: null,
  avatar: null,
  isCgvAccepted: true,
  cgvAcceptedAt: null,
  isMarketingOptedIn: false,
  defaultCurrency: 'EUR',
  emailVerifiedAt: null,
  lastActiveAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('updateMe', () => {
  let mock: ApiMock

  beforeEach(() => {
    mock = createApiMock()
    mock.onPatch('/users/me').reply(HttpStatus.OK, { user: MOCK_USER })
  })

  afterEach(() => {
    mock.restore()
  })

  it('sends JSON when no avatar is selected', async () => {
    await updateMe({ username: 'renamed' }, null)

    expect(JSON.parse(mock.history.patch[0]?.data as string)).toEqual({ username: 'renamed' })
  })

  it('sends multipart form data with the avatar under the image field', async () => {
    const avatar = new File(['content'], 'avatar.png', { type: 'image/png' })

    await updateMe({ username: 'renamed', isMarketingOptedIn: true }, avatar)

    const formData = mock.history.patch[0]?.data as FormData
    expect(formData.get('username')).toBe('renamed')
    expect(formData.get('isMarketingOptedIn')).toBe('true')
    expect(formData.get('image')).toBeInstanceOf(File)
  })

  it('uploads the avatar before clearing a null username through JSON', async () => {
    const avatar = new File(['content'], 'avatar.png', { type: 'image/png' })

    await updateMe({ username: null }, avatar)

    expect(mock.history.patch[0]?.data).toBeInstanceOf(FormData)
    expect(JSON.parse(mock.history.patch[1]?.data as string)).toEqual({ username: null })
  })
})
