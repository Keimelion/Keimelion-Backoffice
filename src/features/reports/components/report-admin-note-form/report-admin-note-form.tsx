'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AdminReportDetailParsed } from '@keimelion/sdk/schemas'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateReport } from '@/features/reports/hooks/use-update-report'
import {
  reportAdminNoteFormSchema,
  type ReportAdminNoteFormValues,
} from '@/features/reports/reports.input-schemas'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ReportAdminNoteFormProps {
  report: AdminReportDetailParsed
}

export function ReportAdminNoteForm({ report }: ReportAdminNoteFormProps): React.JSX.Element {
  const t = useTranslate()
  const mutation = useUpdateReport()
  const form = useForm<ReportAdminNoteFormValues>({
    resolver: zodResolver(reportAdminNoteFormSchema),
    mode: 'onChange',
    defaultValues: { adminNote: report.adminNote ?? '' },
  })

  const submitNote = ({ adminNote }: ReportAdminNoteFormValues): void => {
    mutation.mutate(
      { id: report.id, input: { adminNote: adminNote.length === 0 ? null : adminNote } },
      { onSuccess: (updated) => { form.reset({ adminNote: updated.adminNote ?? '' }) } },
    )
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => { void form.handleSubmit(submitNote)(event) }}
        noValidate
      >
        <FormField
          control={form.control}
          name="adminNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('reports.admin_note.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('reports.admin_note.placeholder')}
                  disabled={mutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={!form.formState.isDirty || mutation.isPending}>
            {t('reports.admin_note.save')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
