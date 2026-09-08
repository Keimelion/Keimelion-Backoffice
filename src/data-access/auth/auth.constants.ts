export const AUTH_ERROR_CODE = {
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
} as const

export const NOTICE_PARAM = 'notice'

export const LOGIN_PATH = '/login'
export const FORGOT_PASSWORD_PATH = '/forgot-password'
export const RESET_PASSWORD_PATH = '/reset-password'

function buildNoticeUrl(path: string, message: string): string {
  return `${path}?${NOTICE_PARAM}=${encodeURIComponent(message)}`
}

export const FORGOT_PASSWORD_INVALID_LINK_URL = buildNoticeUrl(
  FORGOT_PASSWORD_PATH,
  'This reset link is invalid. Please request a new one.',
)
export const FORGOT_PASSWORD_EXPIRED_LINK_URL = buildNoticeUrl(
  FORGOT_PASSWORD_PATH,
  'This reset link has expired or has already been used. Please request a new one.',
)
export const LOGIN_RESET_SUCCESS_URL = buildNoticeUrl(
  LOGIN_PATH,
  'Password updated. Please sign in with your new password.',
)
export const LOGIN_FORGOT_REQUESTED_URL = buildNoticeUrl(
  LOGIN_PATH,
  'If an account with that email exists, you will receive a password reset email shortly.',
)
