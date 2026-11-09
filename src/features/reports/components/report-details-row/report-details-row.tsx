'use client'

import type { ReactNode } from 'react'
import type { AdminReportDetailParsed } from '@keimelion/sdk/schemas'
import { ReportAdminNoteForm } from '@/features/reports/components/report-admin-note-form'
import { formatDate } from '@/lib/format-date'
import { useTranslate } from '@/lib/i18n/use-translate'

const JSON_INDENT = 2

interface ReportDetailsRowProps {
  report: AdminReportDetailParsed
}

export function ReportDetailsRow({ report }: ReportDetailsRowProps): React.JSX.Element {
  const t = useTranslate()

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-background p-4">
      <DetailsSection title={t('reports.details.description_title')}>
        {report.description === null ? (
          <p className="text-sm text-muted-foreground">{t('reports.details.description_empty')}</p>
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm text-foreground">{report.description}</p>
        )}
      </DetailsSection>
      <DetailsSection title={t('reports.details.target_id_title')}>
        <p className="font-mono text-xs text-foreground">{report.targetId}</p>
      </DetailsSection>
      <DetailsSection title={t('reports.details.snapshot_title')}>
        <pre className="max-h-80 overflow-auto rounded-md bg-muted/50 p-3 font-mono text-xs text-foreground">
          {JSON.stringify(report.targetSnapshot, null, JSON_INDENT)}
        </pre>
      </DetailsSection>
      {report.reviewedAt === null ? null : (
        <DetailsSection title={t('reports.details.review_title')}>
          <p className="text-sm text-foreground">
            {t('reports.details.reviewed_at', { date: formatDate(report.reviewedAt) })}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {report.reviewedByUserId ?? t('reports.deleted_account')}
          </p>
        </DetailsSection>
      )}
      <ReportAdminNoteForm report={report} />
    </div>
  )
}

interface DetailsSectionProps {
  title: string
  children: ReactNode
}

function DetailsSection({ title, children }: DetailsSectionProps): React.JSX.Element {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}
