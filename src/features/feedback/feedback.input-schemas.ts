import { z } from 'zod'
import { FEEDBACK_STATUS_VALUES } from '@keimelion/sdk/enums'
import { ADMIN_FEEDBACK_SORT_FIELDS } from '@keimelion/sdk/schemas'
import { basePaginationShape, buildSortValues, dateInputSchema } from '@/lib/list-query-input-schema'

const SORT_VALUES = buildSortValues(ADMIN_FEEDBACK_SORT_FIELDS)

export const listFeedbackQuerySchema = z.object({
  ...basePaginationShape,
  title: z.string().trim().min(1).optional(),
  userId: z.uuid().optional(),
  status: z.enum(FEEDBACK_STATUS_VALUES).optional(),
  createdFrom: dateInputSchema.optional(),
  createdTo: dateInputSchema.optional(),
  sort: z.enum(SORT_VALUES).catch('createdAt:desc'),
})

export type ListFeedbackQuery = z.infer<typeof listFeedbackQuerySchema>
