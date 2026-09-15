'use client'

import { AuthCard } from '@/components/shared/auth-card'
import type { PageHeaderNamespace } from '@/components/shared/translated-page-header'
import { useTranslate } from '@/lib/i18n/use-translate'

interface TranslatedAuthCardProps {
  namespace: PageHeaderNamespace
  children?: React.ReactNode
}

export function TranslatedAuthCard({
  namespace,
  children,
}: TranslatedAuthCardProps): React.JSX.Element {
  const t = useTranslate()
  return (
    <AuthCard title={t(`${namespace}.title`)} description={t(`${namespace}.description`)}>
      {children}
    </AuthCard>
  )
}
