'use client'

import type { AdminReportDetailParsed } from '@keimelion/sdk/schemas'
import { ImageThumbnail } from '@/components/shared/image-thumbnail'
import { parseReportTargetPreview } from '@/features/reports/parse-report-target-preview'
import { useTranslate } from '@/lib/i18n/use-translate'

const VALUES_SEPARATOR = ', '

interface ReportTargetPreviewProps {
  report: AdminReportDetailParsed
}

export function ReportTargetPreview({ report }: ReportTargetPreviewProps): React.JSX.Element {
  const t = useTranslate()
  const preview = parseReportTargetPreview(report)

  const fields = [
    { label: t('reports.preview.owner'), value: preview.ownerName ?? '' },
    {
      label: t('reports.preview.status'),
      value: preview.listStatus === null ? '' : t(`lists.status.${preview.listStatus}`),
    },
    {
      label: t('reports.preview.role'),
      value: preview.role === null ? '' : t(`users.role.${preview.role}`),
    },
    { label: t('reports.preview.categories'), value: preview.categories.join(VALUES_SEPARATOR) },
    { label: t('reports.preview.tags'), value: preview.tags.join(VALUES_SEPARATOR) },
    { label: t('reports.preview.sources'), value: preview.sourceUrls.join(VALUES_SEPARATOR) },
  ].filter((field) => field.value.length > 0)

  return (
    <div className="flex flex-col gap-3 rounded-md bg-muted/50 p-3">
      <div className="flex items-start gap-3">
        {preview.imageUrl === null ? null : (
          <ImageThumbnail src={preview.imageUrl} alt={preview.title} size="md" />
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <p className="break-words text-sm font-medium text-foreground">{preview.title}</p>
          <p className="text-xs text-muted-foreground">
            {t(`reports.target_type.${report.targetType}`)}
          </p>
          {preview.description === null ? null : (
            <p className="whitespace-pre-wrap break-words text-sm text-foreground">
              {preview.description}
            </p>
          )}
        </div>
      </div>
      {fields.length === 0 ? null : (
        <dl className="grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{field.label}</dt>
              <dd className="break-words text-sm text-foreground">{field.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
