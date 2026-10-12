'use client'

import { useState } from 'react'
import { isAdmin } from '@/data-access/_shared/auth-storage'
import type { ApiCategory } from '@/data-access/categories/categories.schemas'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'
import { useAdminCategories } from '@/features/categories/hooks/use-admin-categories'
import { CategoriesList } from '@/features/categories/components/categories-list'
import { CategoriesForbidden } from '@/features/categories/components/categories-forbidden'
import { CreateCategoryDialog } from '@/features/categories/components/create-category-dialog'
import { EditCategoryDialog } from '@/features/categories/components/edit-category-dialog'
import { DeleteCategoryDialog } from '@/features/categories/components/delete-category-dialog'
import { countDescendants } from '@/features/categories/lib/category-tree'

const CATEGORIES_INDEX_FILTER = { page: 1, limit: 100 } as const

export function CategoriesPageContent(): React.JSX.Element {
  const currentRole = useCurrentUserRole()
  const isCurrentUserAdmin = currentRole !== null && isAdmin(currentRole)

  const indexQuery = useAdminCategories(CATEGORIES_INDEX_FILTER)
  const categoriesIndex = indexQuery.data?.items ?? []

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [editTarget, setEditTarget] = useState<ApiCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null)

  if (!isCurrentUserAdmin) {
    return <CategoriesForbidden />
  }

  const deleteDescendantCount =
    deleteTarget === null ? 0 : countDescendants(deleteTarget.id, categoriesIndex)

  return (
    <>
      <CategoriesList
        categoriesIndex={categoriesIndex}
        onCreateClick={() => { setIsCreateOpen(true) }}
        onEditClick={setEditTarget}
        onDeleteClick={setDeleteTarget}
      />

      <CreateCategoryDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {editTarget !== null ? (
        <EditCategoryDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditTarget(null)
          }}
          category={editTarget}
        />
      ) : null}

      {deleteTarget !== null ? (
        <DeleteCategoryDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          category={deleteTarget}
          descendantCount={deleteDescendantCount}
        />
      ) : null}
    </>
  )
}
