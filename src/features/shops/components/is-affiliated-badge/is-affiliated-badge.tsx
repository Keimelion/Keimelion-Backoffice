'use client'

import { Badge } from '@/components/ui/badge'
import { useTranslate } from '@/lib/i18n/use-translate'

interface IsAffiliatedBadgeProps {
  isAffiliated: boolean
}

export function IsAffiliatedBadge({ isAffiliated }: IsAffiliatedBadgeProps): React.JSX.Element {
  const t = useTranslate()
  if (isAffiliated) {
    return <Badge variant="default">{t('shops.admin.badge.affiliated')}</Badge>
  }
  return <Badge variant="secondary">{t('shops.admin.badge.not_affiliated')}</Badge>
}
