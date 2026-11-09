import { z } from 'zod'
import { RESERVATION_SORT_FIELDS, SORT_DIRECTIONS } from '@keimelion/sdk/schemas'
import { basePaginationShape } from '@/data-access/_shared/pagination'

type AdminReservationSortField = (typeof RESERVATION_SORT_FIELDS)[number]
type AdminReservationSortValue = `${AdminReservationSortField}:${(typeof SORT_DIRECTIONS)[number]}`

const SORT_VALUES = RESERVATION_SORT_FIELDS.flatMap((field) =>
  SORT_DIRECTIONS.map((direction) => `${field}:${direction}` as const),
) as [AdminReservationSortValue, ...AdminReservationSortValue[]]

export const listAdminReservationsQuerySchema = z.object({
  ...basePaginationShape,
  userId: z.uuid().optional(),
  listItemId: z.uuid().optional(),
  listId: z.uuid().optional(),
  itemId: z.uuid().optional(),
  sort: z.enum(SORT_VALUES).catch('createdAt:desc'),
})

export type ListAdminReservationsQuery = z.infer<typeof listAdminReservationsQuerySchema>
