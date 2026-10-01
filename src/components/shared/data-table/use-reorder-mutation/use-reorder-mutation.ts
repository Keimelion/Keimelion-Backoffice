'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { notifyError } from '@/lib/notify'
import { translate } from '@/lib/i18n/translate'
import type { MessageId } from '@/lib/i18n/messages/en'

export interface ReorderUpdate {
  id: string
  sortOrder: number
}

interface ReorderableRow {
  id: string
  sortOrder: number
}

interface ReorderMutationOptions {
  queryKey: readonly unknown[]
  invalidateKey: readonly unknown[]
  mutationFn: (updates: ReorderUpdate[]) => Promise<unknown>
  errorMessageKey: MessageId
}

interface ReorderVariables<TRow extends ReorderableRow> {
  previousItems: TRow[]
  nextItems: TRow[]
}

interface ReorderContext<TRow extends ReorderableRow> {
  previousData: PaginatedResponse<TRow> | undefined
}

export function computeReorderUpdates<TRow extends ReorderableRow>(
  previousItems: TRow[],
  nextItems: TRow[],
): ReorderUpdate[] {
  const updates: ReorderUpdate[] = []
  for (let index = 0; index < nextItems.length; index += 1) {
    const nextItem = nextItems[index]
    const previousItem = previousItems[index]
    if (nextItem === undefined) continue
    const nextSortOrder = previousItem?.sortOrder ?? index
    if (previousItem?.id !== nextItem.id) {
      updates.push({ id: nextItem.id, sortOrder: nextSortOrder })
    }
  }
  return updates
}

export function useReorderMutation<TRow extends ReorderableRow>(
  options: ReorderMutationOptions,
): UseMutationResult<unknown, Error, ReorderVariables<TRow>, ReorderContext<TRow>> {
  const queryClient = useQueryClient()
  const { queryKey, invalidateKey, mutationFn, errorMessageKey } = options

  return useMutation<unknown, Error, ReorderVariables<TRow>, ReorderContext<TRow>>({
    mutationFn: ({ previousItems, nextItems }) => {
      const updates = computeReorderUpdates(previousItems, nextItems)
      if (updates.length === 0) return Promise.resolve([])
      return mutationFn(updates)
    },
    meta: { silent: true },
    onMutate: async ({ nextItems }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<PaginatedResponse<TRow>>(queryKey)
      if (previousData !== undefined) {
        queryClient.setQueryData<PaginatedResponse<TRow>>(queryKey, {
          ...previousData,
          items: nextItems,
        })
      }
      return { previousData }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      notifyError({ title: translate(errorMessageKey) })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: invalidateKey })
    },
  })
}
