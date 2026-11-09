'use client'

import { useState } from 'react'
import type { AdminReportDetailParsed } from '@keimelion/sdk/schemas'
import { Button } from '@/components/ui/button'
import { ReportTargetPreview } from '@/features/reports/components/report-target-preview'
import { useTranslate } from '@/lib/i18n/use-translate'

const JSON_INDENT = 2
const SNAPSHOT_VIEWS = ['preview', 'json'] as const

type SnapshotView = (typeof SNAPSHOT_VIEWS)[number]

interface ReportTargetSnapshotProps {
  report: AdminReportDetailParsed
}

export function ReportTargetSnapshot({ report }: ReportTargetSnapshotProps): React.JSX.Element {
  const t = useTranslate()
  const [view, setView] = useState<SnapshotView>('preview')

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {SNAPSHOT_VIEWS.map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={view === option ? 'secondary' : 'ghost'}
            aria-pressed={view === option}
            onClick={() => { setView(option) }}
          >
            {t(`reports.details.view_${option}`)}
          </Button>
        ))}
      </div>
      {view === 'preview' ? (
        <ReportTargetPreview report={report} />
      ) : (
        <pre className="max-h-80 overflow-auto rounded-md bg-muted/50 p-3 font-mono text-xs text-foreground">
          {JSON.stringify(report.targetSnapshot, null, JSON_INDENT)}
        </pre>
      )}
    </div>
  )
}
