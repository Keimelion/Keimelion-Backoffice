'use client'

import { useState } from 'react'
import { isAdmin } from '@/data-access/_shared/auth-storage'
import type { ApiCategory } from '@/data-access/categories/categories.schemas'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'
import { useAdminCategories } from '@/features/categories/hooks/use-admin-categories'
import { CategoriesTree } from '@/features/categories/components/categories-tree'
import { CategoriesForbidden } from '@/features/categories/components/categories-forbidden'
import { CreateCategoryDialog } from '@/features/categories/components/create-category-dialog'
import { EditCategoryDialog } from '@/features/categories/components/edit-category-dialog'
import { DeleteCategoryDialog } from '@/features/categories/components/delete-category-dialog'
import { countDescendants } from '@/features/categories/lib/category-tree'

export function CategoriesPageContent(): React.JSX.Element {
  const currentRole = useCurrentUserRole()
  const isCurrentUserAdmin = currentRole !== null && isAdmin(currentRole)

  const categoriesQuery = useAdminCategories()
  const categories = categoriesQuery.data ?? []

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [createParentId, setCreateParentId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<ApiCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null)
  const [revealParentId, setRevealParentId] = useState<string | null>(null)

  function openCreateDialog(parentId: string | null): void {
    setCreateParentId(parentId)
    setIsCreateOpen(true)
  }

  if (!isCurrentUserAdmin) {
    return <CategoriesForbidden />
  }

  const deleteDescendantCount =
    deleteTarget === null ? 0 : countDescendants(deleteTarget.id, categories)

  return (
    <>
      <CategoriesTree
        categories={categories}
        isLoading={categoriesQuery.isLoading}
        error={categoriesQuery.error}
        revealParentId={revealParentId}
        onRevealed={() => { setRevealParentId(null) }}
        onRetry={() => { void categoriesQuery.refetch() }}
        onCreate={() => { openCreateDialog(null) }}
        onAddChild={(parentId) => { openCreateDialog(parentId) }}
        onEditCategory={setEditTarget}
        onDeleteCategory={setDeleteTarget}
      />

      {isCreateOpen ? (
        <CreateCategoryDialog
          open
          onOpenChange={(open) => {
            if (!open) setIsCreateOpen(false)
          }}
          defaultParentId={createParentId}
          onCreated={(createdParentId) => {
            if (createdParentId !== null) setRevealParentId(createdParentId)
          }}
        />
      ) : null}

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
