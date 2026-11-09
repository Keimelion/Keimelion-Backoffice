import { z } from 'zod'
import { RESERVATION_SORT_FIELDS } from '@keimelion/sdk/schemas'
import { basePaginationShape, buildSortValues } from '@/lib/list-query-input-schema'

const SORT_VALUES = buildSortValues(RESERVATION_SORT_FIELDS)

export const listAdminReservationsQuerySchema = z.object({
  ...basePaginationShape,
  userId: z.uuid().optional(),
  listItemId: z.uuid().optional(),
  listId: z.uuid().optional(),
  itemId: z.uuid().optional(),
  sort: z.enum(SORT_VALUES).catch('createdAt:desc'),
})

export type ListAdminReservationsQuery = z.infer<typeof listAdminReservationsQuerySchema>
