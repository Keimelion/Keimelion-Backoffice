import { formatAppVersion } from '@/lib/format-app-version'

export const APP_VERSION = formatAppVersion(
  process.env.NEXT_PUBLIC_APP_VERSION ?? '',
  process.env.NEXT_PUBLIC_GIT_SHA ?? null,
)
