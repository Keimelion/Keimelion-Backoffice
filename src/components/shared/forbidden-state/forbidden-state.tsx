'use client'

import { ShieldAlert } from 'lucide-react'
import type { PageHeaderNamespace } from '@/components/shared/translated-page-header'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ForbiddenStateProps {
  namespace: Extract<PageHeaderNamespace, `${string}.forbidden`>
}

export function ForbiddenState({ namespace }: ForbiddenStateProps): React.JSX.Element {
  const t = useTranslate()
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-muted/30 p-6">
      <ShieldAlert className="h-6 w-6 text-muted-foreground" />
      <p className="text-base font-semibold text-foreground">{t(`${namespace}.title`)}</p>
      <p className="text-sm text-muted-foreground">{t(`${namespace}.description`)}</p>
    </div>
  )
}
