import { z } from 'zod'
import {
  REPORT_REASON_VALUES,
  REPORT_STATUS_VALUES,
  REPORT_TARGET_TYPE_VALUES,
  ReportStatuses,
} from '@keimelion/sdk/enums'
import { ADMIN_REPORTS_SORT_FIELDS, REPORT_ADMIN_NOTE_MAX_LENGTH } from '@keimelion/sdk/schemas'
import { translate } from '@/lib/i18n/translate'
import {
  basePaginationShape,
  buildSortValues,
  dateInputSchema,
} from '@/lib/list-query-input-schema'

export const ALL_REPORT_STATUSES = 'all'

const SORT_VALUES = buildSortValues(ADMIN_REPORTS_SORT_FIELDS)

export const listReportsQuerySchema = z.object({
  ...basePaginationShape,
  status: z.enum([...REPORT_STATUS_VALUES, ALL_REPORT_STATUSES]).catch(ReportStatuses.PENDING),
  targetType: z.enum(REPORT_TARGET_TYPE_VALUES).optional(),
  reason: z.enum(REPORT_REASON_VALUES).optional(),
  createdFrom: dateInputSchema.optional(),
  createdTo: dateInputSchema.optional(),
  sort: z.enum(SORT_VALUES).catch('createdAt:desc'),
})

export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>

export const reportAdminNoteFormSchema = z.object({
  adminNote: z
    .string()
    .trim()
    .max(REPORT_ADMIN_NOTE_MAX_LENGTH, {
      error: () =>
        translate('reports.admin_note.too_long', { max: REPORT_ADMIN_NOTE_MAX_LENGTH }),
    }),
})

export type ReportAdminNoteFormValues = z.infer<typeof reportAdminNoteFormSchema>
