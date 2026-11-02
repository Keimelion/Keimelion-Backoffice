'use client'

import type { ApiAdminFeedback } from '@/data-access/feedback/feedback.schemas'
import { useTranslate } from '@/lib/i18n/use-translate'

const JSON_INDENT = 2

interface FeedbackDetailsRowProps {
  feedback: ApiAdminFeedback
}

export function FeedbackDetailsRow({ feedback }: FeedbackDetailsRowProps): React.JSX.Element {
  const t = useTranslate()
  const prettyContext =
    feedback.context === null ? null : JSON.stringify(feedback.context, null, JSON_INDENT)

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-background p-4">
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('feedback.details.description_title')}
        </h3>
        <p className="whitespace-pre-wrap text-sm text-foreground">{feedback.description}</p>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('feedback.details.context_title')}
        </h3>
        {prettyContext === null ? (
          <p className="text-sm text-muted-foreground">{t('feedback.details.context_empty')}</p>
        ) : (
          <pre className="max-h-80 overflow-auto rounded-md bg-muted/50 p-3 font-mono text-xs text-foreground">
            {prettyContext}
          </pre>
        )}
      </section>
    </div>
  )
}
