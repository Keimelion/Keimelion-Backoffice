import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

// Strip the Referer for every outbound request originating from this page.
// The reset token arrives as a `?token=...` query param, and same-origin
// navigations (e.g. clicking "Back to sign in") would otherwise leak the
// full URL — including the token — in the Referer header of subsequent
// requests and server access logs.
export const metadata: Metadata = {
  referrer: 'no-referrer',
}

export default function ResetPasswordPage(): React.JSX.Element {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
