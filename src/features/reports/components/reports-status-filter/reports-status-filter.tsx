'use client'

import { REPORT_STATUS_VALUES } from '@keimelion/sdk/enums'
import { useUrlParams } from '@/components/shared/use-url-params'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ALL_REPORT_STATUSES,
  type ListReportsQuery,
} from '@/features/reports/reports.input-schemas'
import { useTranslate } from '@/lib/i18n/use-translate'

export const STATUS_PARAM = 'status'

const STATUS_SELECT_ID = 'select-status'

interface ReportsStatusFilterProps {
  value: ListReportsQuery['status']
}

export function ReportsStatusFilter({ value }: ReportsStatusFilterProps): React.JSX.Element {
  const t = useTranslate()
  const { setFilterParam } = useUrlParams()

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={STATUS_SELECT_ID}
        className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
      >
        {t('reports.filters.status_label')}
      </label>
      <Select value={value} onValueChange={(selected) => { setFilterParam(STATUS_PARAM, selected) }}>
        <SelectTrigger id={STATUS_SELECT_ID} className="h-8 w-40 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {REPORT_STATUS_VALUES.map((status) => (
            <SelectItem key={status} value={status}>
              {t(`reports.status.${status}`)}
            </SelectItem>
          ))}
          <SelectItem value={ALL_REPORT_STATUSES}>{t('reports.filters.status_all')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
