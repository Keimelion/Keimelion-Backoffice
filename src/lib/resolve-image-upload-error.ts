import { ApiError } from '@keimelion/sdk/client'
import { ErrorCode } from '@keimelion/sdk/enums'
import type { MessageId } from '@/lib/i18n/messages/en'

export function resolveImageUploadErrorMessageId(error: Error): MessageId | null {
  if (!(error instanceof ApiError)) return null
  switch (error.code) {
    case ErrorCode.INVALID_IMAGE:
      return 'common.image_upload.error.invalid'
    case ErrorCode.INVALID_IMAGE_TYPE:
      return 'common.image_upload.error.invalid_type'
    case ErrorCode.PAYLOAD_TOO_LARGE:
      return 'common.image_upload.error.too_large'
    default:
      return null
  }
}
