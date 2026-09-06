import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

const FORGOT_PASSWORD_INVALID_LINK = '/forgot-password?reason=invalid-link'

// Strip the Referer for every outbound request originating from this page.
// The reset token arrives as a `?token=...` query param, and same-origin
// navigations (e.g. clicking a Link) would otherwise leak the full URL —
// including the token — in the Referer header of subsequent requests and
// server access logs.
export const metadata: Metadata = {
  referrer: 'no-referrer',
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps): Promise<React.JSX.Element> {
  const { token } = await searchParams
  if (!token) {
    redirect(FORGOT_PASSWORD_INVALID_LINK)
  }
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
