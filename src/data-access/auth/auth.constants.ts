export const AUTH_ERROR_CODE = {
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
} as const

export const NOTICE_PARAM = 'notice'

export const LOGIN_PATH = '/login'
export const FORGOT_PASSWORD_PATH = '/forgot-password'
export const RESET_PASSWORD_PATH = '/reset-password'

export const NOTICE_CODE = {
  RESET_LINK_INVALID: 'reset-link-invalid',
  RESET_LINK_EXPIRED: 'reset-link-expired',
  PASSWORD_UPDATED: 'password-updated',
  FORGOT_PASSWORD_REQUESTED: 'forgot-password-requested',
} as const

export type NoticeCode = (typeof NOTICE_CODE)[keyof typeof NOTICE_CODE]

export const NOTICE_MESSAGES: Record<NoticeCode, string> = {
  [NOTICE_CODE.RESET_LINK_INVALID]: 'This reset link is invalid. Please request a new one.',
  [NOTICE_CODE.RESET_LINK_EXPIRED]:
    'This reset link has expired or has already been used. Please request a new one.',
  [NOTICE_CODE.PASSWORD_UPDATED]: 'Password updated. Please sign in with your new password.',
  [NOTICE_CODE.FORGOT_PASSWORD_REQUESTED]:
    'If an account with that email exists, you will receive a password reset email shortly.',
}

export function resolveNoticeMessage(value: string | null): string | null {
  if (value === null) return null
  const allowed = Object.values(NOTICE_CODE) as string[]
  if (!allowed.includes(value)) return null
  return NOTICE_MESSAGES[value as NoticeCode]
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
