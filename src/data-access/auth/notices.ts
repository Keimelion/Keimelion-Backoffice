import { FORGOT_PASSWORD_PATH, LOGIN_PATH } from '@/data-access/auth/paths'

export const NOTICE_PARAM = 'notice'

export const NOTICE_CODE = {
  RESET_LINK_INVALID: 'reset-link-invalid',
  RESET_LINK_EXPIRED: 'reset-link-expired',
  PASSWORD_UPDATED: 'password-updated',
  FORGOT_PASSWORD_REQUESTED: 'forgot-password-requested',
} as const

export type NoticeCode = (typeof NOTICE_CODE)[keyof typeof NOTICE_CODE]

export const NOTICE_MESSAGE_IDS: Record<NoticeCode, string> = {
  [NOTICE_CODE.RESET_LINK_INVALID]: 'auth.notices.reset_link_invalid',
  [NOTICE_CODE.RESET_LINK_EXPIRED]: 'auth.notices.reset_link_expired',
  [NOTICE_CODE.PASSWORD_UPDATED]: 'auth.notices.password_updated',
  [NOTICE_CODE.FORGOT_PASSWORD_REQUESTED]: 'auth.notices.forgot_password_requested',
}

export function resolveNoticeMessageId(value: string | null): string | null {
  if (value === null) return null
  const allowed = Object.values(NOTICE_CODE) as string[]
  if (!allowed.includes(value)) return null
  return NOTICE_MESSAGE_IDS[value as NoticeCode]
}

function buildNoticeUrl(path: string, code: NoticeCode): string {
  return `${path}?${NOTICE_PARAM}=${code}`
}

export const FORGOT_PASSWORD_INVALID_LINK_URL = buildNoticeUrl(
  FORGOT_PASSWORD_PATH,
  NOTICE_CODE.RESET_LINK_INVALID,
)
export const FORGOT_PASSWORD_EXPIRED_LINK_URL = buildNoticeUrl(
  FORGOT_PASSWORD_PATH,
  NOTICE_CODE.RESET_LINK_EXPIRED,
)
export const LOGIN_RESET_SUCCESS_URL = buildNoticeUrl(
  LOGIN_PATH,
  NOTICE_CODE.PASSWORD_UPDATED,
)
export const LOGIN_FORGOT_REQUESTED_URL = buildNoticeUrl(
  LOGIN_PATH,
  NOTICE_CODE.FORGOT_PASSWORD_REQUESTED,
)
