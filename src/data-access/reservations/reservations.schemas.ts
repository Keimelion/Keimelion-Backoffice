import { z } from 'zod'
import { basePaginationShape } from '@/data-access/_shared/pagination'
import { apiUserSchema } from '@/data-access/_shared/user'

const SORTABLE_FIELDS = ['createdAt', 'quantityBooked'] as const
const SORT_DIRECTIONS = ['asc', 'desc'] as const

export type AdminReservationSortField = (typeof SORTABLE_FIELDS)[number]

const SORT_VALUES = SORTABLE_FIELDS.flatMap((field) =>
  SORT_DIRECTIONS.map((direction) => `${field}:${direction}` as const),
) as [
  `${AdminReservationSortField}:${(typeof SORT_DIRECTIONS)[number]}`,
  ...`${AdminReservationSortField}:${(typeof SORT_DIRECTIONS)[number]}`[],
]

const imageUrlsSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
})

const imageDetailSchema = z.object({
  id: z.string(),
  hash: z.string(),
  mime: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  width: z.number().int().nonnegative(),
  height: z.number().int().nonnegative(),
  createdAt: z.string(),
  urls: imageUrlsSchema,
})

const reservationListItemSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  quantityDesired: z.number().int(),
  image: imageDetailSchema.nullable(),
})

const reservationListSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  owner: apiUserSchema.nullable(),
})

export const reservationDetailSchema = z.object({
  id: z.string(),
  quantityBooked: z.number().int(),
  createdAt: z.string(),
  listItem: reservationListItemSummarySchema,
  list: reservationListSummarySchema,
})

export const adminReservationSchema = reservationDetailSchema.extend({
  user: apiUserSchema,
})

export type ApiAdminReservation = z.infer<typeof adminReservationSchema>

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const adminReservationsListResponseSchema = z.object({
  items: z.array(adminReservationSchema),
  pagination: paginationSchema,
})

export type AdminReservationsListResponse = z.infer<typeof adminReservationsListResponseSchema>

export const adminReservationGetResponseSchema = z.object({
  reservation: adminReservationSchema,
})

export type AdminReservationGetResponse = z.infer<typeof adminReservationGetResponseSchema>

export const listAdminReservationsQuerySchema = z.object({
  ...basePaginationShape,
  userId: z.uuid().optional(),
  listItemId: z.uuid().optional(),
  listId: z.uuid().optional(),
  itemId: z.uuid().optional(),
  sort: z.enum(SORT_VALUES).catch('createdAt:desc'),
})

export type ListAdminReservationsQuery = z.infer<typeof listAdminReservationsQuerySchema>
