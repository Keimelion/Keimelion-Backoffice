import { z } from 'zod'
import { FEEDBACK_STATUS_VALUES } from '@keimelion/api/shared/enums/feedback-status'
import { basePaginationShape } from '@/data-access/_shared/pagination'

const SORTABLE_FIELDS = ['createdAt', 'updatedAt', 'status'] as const
const SORT_DIRECTIONS = ['asc', 'desc'] as const

export type FeedbackSortField = (typeof SORTABLE_FIELDS)[number]

const SORT_VALUES = SORTABLE_FIELDS.flatMap((field) =>
  SORT_DIRECTIONS.map((direction) => `${field}:${direction}` as const),
) as [
  `${FeedbackSortField}:${(typeof SORT_DIRECTIONS)[number]}`,
  ...`${FeedbackSortField}:${(typeof SORT_DIRECTIONS)[number]}`[],
]

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const dateInputSchema = z.string().regex(DATE_INPUT_PATTERN)

const feedbackUserSummarySchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  email: z.string(),
})

export const apiAdminFeedbackSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  context: z.record(z.string(), z.unknown()).nullable(),
  status: z.enum(FEEDBACK_STATUS_VALUES),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: feedbackUserSummarySchema.nullable(),
})

export type ApiAdminFeedback = z.infer<typeof apiAdminFeedbackSchema>

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const adminFeedbackListResponseSchema = z.object({
  items: z.array(apiAdminFeedbackSchema),
  pagination: paginationSchema,
})

export type AdminFeedbackListResponse = z.infer<typeof adminFeedbackListResponseSchema>

export const adminFeedbackMutationResponseSchema = z.object({
  feedback: apiAdminFeedbackSchema,
})

export type AdminFeedbackMutationResponse = z.infer<typeof adminFeedbackMutationResponseSchema>

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

export const updateFeedbackInputSchema = z
  .object({
    status: z.enum(FEEDBACK_STATUS_VALUES),
  })
  .strict()

export type UpdateFeedbackInput = z.infer<typeof updateFeedbackInputSchema>
