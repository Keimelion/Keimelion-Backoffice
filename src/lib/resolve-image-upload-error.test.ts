import { describe, expect, it } from 'vitest'
import { ApiError } from '@keimelion/sdk/client'
import { ErrorCode } from '@keimelion/sdk/enums'
import { resolveImageUploadErrorMessageId } from './resolve-image-upload-error'

function buildApiError(code: string): ApiError {
  return new ApiError({ code, message: 'Failure', status: 400, metadata: {} })
}

describe('resolveImageUploadErrorMessageId', () => {
  it('maps invalid image errors', () => {
    expect(resolveImageUploadErrorMessageId(buildApiError(ErrorCode.INVALID_IMAGE))).toBe(
      'common.image_upload.error.invalid',
    )
  })

  it('maps unsupported image type errors', () => {
    expect(resolveImageUploadErrorMessageId(buildApiError(ErrorCode.INVALID_IMAGE_TYPE))).toBe(
      'common.image_upload.error.invalid_type',
    )
  })

  it('maps payload size errors', () => {
    expect(resolveImageUploadErrorMessageId(buildApiError(ErrorCode.PAYLOAD_TOO_LARGE))).toBe(
      'common.image_upload.error.too_large',
    )
  })

  it('returns null for unrelated API errors', () => {
    expect(resolveImageUploadErrorMessageId(buildApiError(ErrorCode.NOT_FOUND))).toBeNull()
  })

  it('returns null for non-API errors', () => {
    expect(resolveImageUploadErrorMessageId(new Error('boom'))).toBeNull()
  })
})
