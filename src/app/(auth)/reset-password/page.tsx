import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { FORGOT_PASSWORD_INVALID_LINK_URL } from '@/data-access/auth/notices'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

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
