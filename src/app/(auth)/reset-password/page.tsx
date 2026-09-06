import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { FORGOT_PASSWORD_INVALID_LINK_URL } from '@/data-access/auth/auth.constants'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

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
    redirect(FORGOT_PASSWORD_INVALID_LINK_URL)
  }
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
