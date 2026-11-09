'use client'

import { Clock, Gavel, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReportStatus } from '@keimelion/sdk/enums'
import { Badge } from '@/components/ui/badge'
import { useTranslate } from '@/lib/i18n/use-translate'
import { cn } from '@/lib/utils'

interface StatusVisuals {
  className: string
  Icon: LucideIcon
}

const STATUS_VISUALS: Record<ReportStatus, StatusVisuals> = {
  pending: {
    className: 'border-transparent bg-amber-500 text-white hover:bg-amber-500/80',
    Icon: Clock,
  },
  upheld: {
    className: 'border-transparent bg-rose-500 text-white hover:bg-rose-500/80',
    Icon: Gavel,
  },
  dismissed: {
    className: 'border-transparent bg-slate-500 text-white hover:bg-slate-500/80',
    Icon: XCircle,
  },
}

interface ReportStatusBadgeProps {
  status: ReportStatus
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps): React.JSX.Element {
  const t = useTranslate()
  const { className, Icon } = STATUS_VISUALS[status]
  return (
    <Badge className={cn(className, 'gap-1')}>
      <Icon className="h-3 w-3" />
      {t(`reports.status.${status}`)}
    </Badge>
  )
}
