import { Suspense } from 'react'
import { LoginForm } from '@/features/auth/components/login-form'

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
