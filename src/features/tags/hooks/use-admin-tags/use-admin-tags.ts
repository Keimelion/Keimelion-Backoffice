'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { PaginatedResponse } from '@keimelion/api/shared/types/api'
import { normalizeFilters } from '@/data-access/_shared/normalize-filters'
import {
  TAGS_QUERY_KEY,
  createTag,
  deleteTag,
  fetchAdminTag,
  listAdminTags,
  updateTag,
} from '@/data-access/tags/tags.api'
import type {
  ApiTag,
  CreateTagInput,
  ListTagsQuery,
  UpdateTagInput,
} from '@/data-access/tags/tags.schemas'

type TagsListFilters = Partial<ListTagsQuery>

export function buildAdminTagsKey(
  filters: TagsListFilters,
): readonly ['tags', 'list', TagsListFilters] {
  const normalized = normalizeFilters(filters)
  return [...TAGS_QUERY_KEY, 'list', normalized] as const
}

export function buildAdminTagKey(id: string): readonly ['tags', 'detail', string] {
  return [...TAGS_QUERY_KEY, 'detail', id] as const
}

const DISABLED_ADMIN_TAG_KEY = [...TAGS_QUERY_KEY, 'detail', null] as const

export function useAdminTags(
  filters: TagsListFilters,
): UseQueryResult<PaginatedResponse<ApiTag>> {
  return useQuery({
    queryKey: buildAdminTagsKey(filters),
    queryFn: () => listAdminTags(filters),
  })
}

export function useAdminTag(id: string | null): UseQueryResult<ApiTag> {
  return useQuery({
    queryKey: id === null ? DISABLED_ADMIN_TAG_KEY : buildAdminTagKey(id),
    queryFn: () => fetchAdminTag(id ?? ''),
    enabled: id !== null,
  })
}

export function useCreateTag(): UseMutationResult<ApiTag, Error, CreateTagInput> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTag,
    meta: { silent: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY })
    },
  })
}

interface UpdateTagVariables {
  id: string
  input: UpdateTagInput
}

export function useUpdateTag(): UseMutationResult<ApiTag, Error, UpdateTagVariables> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }) => updateTag(id, input),
    meta: { silent: true },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: buildAdminTagKey(variables.id) }),
      ])
    },
  })
}

export function useDeleteTag(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTag,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY })
    },
  })
}
