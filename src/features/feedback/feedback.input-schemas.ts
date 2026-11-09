import { z } from 'zod'
import { FEEDBACK_STATUS_VALUES } from '@keimelion/sdk/enums'
import { ADMIN_FEEDBACK_SORT_FIELDS, SORT_DIRECTIONS } from '@keimelion/sdk/schemas'
import { basePaginationShape } from '@/data-access/_shared/pagination'

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const dateInputSchema = z.string().regex(DATE_INPUT_PATTERN)

type FeedbackSortField = (typeof ADMIN_FEEDBACK_SORT_FIELDS)[number]
type FeedbackSortValue = `${FeedbackSortField}:${(typeof SORT_DIRECTIONS)[number]}`

const SORT_VALUES = ADMIN_FEEDBACK_SORT_FIELDS.flatMap((field) =>
  SORT_DIRECTIONS.map((direction) => `${field}:${direction}` as const),
) as [FeedbackSortValue, ...FeedbackSortValue[]]

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
