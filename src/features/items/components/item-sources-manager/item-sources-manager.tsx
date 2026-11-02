'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { ApiAdminItem } from '@/data-access/items/items.schemas'
import {
  EMPTY_ITEM_SOURCE_INPUT,
  type ApiItemSource,
  type CreateItemSourceInput,
  type ItemSourceInput,
  type UpdateItemSourceInput,
} from '@/data-access/items/item-sources.schemas'
import { useAdminItem } from '@/features/items/hooks/use-admin-items'
import {
  useCreateItemSource,
  useUpdateItemSource,
} from '@/features/items/hooks/use-item-source-mutations'
import { useAdminShops } from '@/features/shops/hooks/use-admin-shops'
import { DeleteItemSourceDialog } from '@/features/items/components/delete-item-source-dialog'
import { ItemSourceEditorRow } from '@/features/items/components/item-source-editor-row'
import { ItemSourceSummary } from '@/features/items/components/item-source-summary'
import { ItemSourcesRecap } from '@/features/items/components/item-sources-recap'
import { pickChangedFields } from '@/lib/pick-changed-fields'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { useTranslate } from '@/lib/i18n/use-translate'

const SHOPS_FILTER = { page: 1, limit: 100, isActive: true } as const
const EDITABLE_SOURCE_FIELDS = ['shopId', 'sourceUrl', 'price', 'currency'] as const satisfies readonly (keyof ItemSourceInput)[]
const PENDING_ROW_KEY = '__pending_new_source__'

function omitKey<T>(previous: Record<string, T>, key: string): Record<string, T> {
  if (!(key in previous)) return previous
  return Object.fromEntries(Object.entries(previous).filter(([entryKey]) => entryKey !== key))
}

interface ItemSourcesManagerProps {
  item: ApiAdminItem
}

export function ItemSourcesManager({
  item,
}: ItemSourcesManagerProps): React.JSX.Element {
  const t = useTranslate()
  const itemQuery = useAdminItem(item.id)
  const sources = itemQuery.data?.sources ?? item.sources

  const shopsQuery = useAdminShops(SHOPS_FILTER)
  const shops = shopsQuery.data?.items ?? []

  const [editingSourceIds, setEditingSourceIds] = useState<Set<string>>(() => new Set())
  const [isAddingNewRow, setIsAddingNewRow] = useState<boolean>(false)
  const [editorErrors, setEditorErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<ApiItemSource | null>(null)

  const createMutation = useCreateItemSource()
  const updateMutation = useUpdateItemSource()

  function takenShopIdsForEditor(excludeSourceId: string | null): ReadonlySet<string> {
    const taken = new Set<string>()
    for (const source of sources) {
      if (source.shopId === null) continue
      if (excludeSourceId !== null && source.id === excludeSourceId) continue
      taken.add(source.shopId)
    }
    return taken
  }

  const canDeleteExisting = sources.length > 1

  function handleStartEditing(source: ApiItemSource): void {
    setEditingSourceIds((previous) => {
      const next = new Set(previous)
      next.add(source.id)
      return next
    })
  }

  function handleCancelEditing(sourceId: string): void {
    setEditingSourceIds((previous) => {
      if (!previous.has(sourceId)) return previous
      const next = new Set(previous)
      next.delete(sourceId)
      return next
    })
    setEditorErrors((previous) => omitKey(previous, sourceId))
  }

  function handleAddNewRow(): void {
    setIsAddingNewRow(true)
  }

  function handleCancelNewRow(): void {
    setIsAddingNewRow(false)
    setEditorErrors((previous) => omitKey(previous, PENDING_ROW_KEY))
  }

  function handleValidateNew(values: ItemSourceInput): void {
    const payload: CreateItemSourceInput = values
    createMutation.mutate(
      { itemId: item.id, input: payload },
      {
        onSuccess: () => {
          notifySuccess({ title: translate('items.sources.mutation.created_toast') })
          handleCancelNewRow()
        },
        onError: (error) => {
          setEditorErrors((previous) => ({ ...previous, [PENDING_ROW_KEY]: error.message }))
        },
      },
    )
  }

  function handleValidateExisting(source: ApiItemSource, values: ItemSourceInput): void {
    const patch: UpdateItemSourceInput = pickChangedFields(
      {
        shopId: source.shopId,
        sourceUrl: source.sourceUrl,
        price: source.price,
        currency: source.currency,
      },
      values,
      EDITABLE_SOURCE_FIELDS,
    )
    if (Object.keys(patch).length === 0) {
      handleCancelEditing(source.id)
      return
    }
    updateMutation.mutate(
      { itemId: item.id, sourceId: source.id, input: patch },
      {
        onSuccess: () => {
          notifySuccess({ title: translate('items.sources.mutation.updated_toast') })
          handleCancelEditing(source.id)
        },
        onError: (error) => {
          setEditorErrors((previous) => ({ ...previous, [source.id]: error.message }))
        },
      },
    )
  }

  const isMutating = createMutation.isPending || updateMutation.isPending
  const isEmpty = sources.length === 0 && !isAddingNewRow
  const showAddButton = !isAddingNewRow

  return (
    <>
      <section className="flex flex-col gap-3 rounded-md border border-border bg-muted/20 p-4">
        <header className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">
            {t('items.form.sources_section_title')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('items.form.sources_section_help')}
          </p>
        </header>

        <ItemSourcesRecap sources={sources} />

        {itemQuery.isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sources.map((source, index) => {
              const isEditing = editingSourceIds.has(source.id)
              if (isEditing) {
                return (
                  <ItemSourceEditorRow
                    key={source.id}
                    title={t('items.form.source_row_title', { index: index + 1 })}
                    defaultValues={{
                      shopId: source.shopId,
                      sourceUrl: source.sourceUrl,
                      price: source.price,
                      currency: source.currency,
                    }}
                    shops={shops}
                    isShopsLoading={shopsQuery.isLoading}
                    disabledShopIds={takenShopIdsForEditor(source.id)}
                    isPending={updateMutation.isPending}
                    canRemove
                    removeLabel={t('items.form.source_cancel_edit_tooltip')}
                    rootError={editorErrors[source.id] ?? null}
                    onValidate={(values) => { handleValidateExisting(source, values) }}
                    onRemove={() => { handleCancelEditing(source.id) }}
                  />
                )
              }
              return (
                <ItemSourceSummary
                  key={source.id}
                  values={{
                    shopId: source.shopId,
                    sourceUrl: source.sourceUrl,
                    price: source.price,
                    currency: source.currency,
                  }}
                  shopName={source.shop?.name ?? null}
                  canRemove={canDeleteExisting}
                  editLabel={t('items.form.source_edit_tooltip')}
                  removeLabel={t('common.actions.delete', {
                    name: source.sourceUrl ?? source.id,
                  })}
                  removeDisabledLabel={t('items.form.sources_remove_last_tooltip')}
                  onEdit={() => { handleStartEditing(source) }}
                  onRemove={() => { setDeleteTarget(source) }}
                />
              )
            })}

            {isAddingNewRow ? (
              <ItemSourceEditorRow
                title={t('items.form.source_row_title', { index: sources.length + 1 })}
                defaultValues={EMPTY_ITEM_SOURCE_INPUT}
                shops={shops}
                isShopsLoading={shopsQuery.isLoading}
                disabledShopIds={takenShopIdsForEditor(null)}
                isPending={createMutation.isPending}
                canRemove
                removeLabel={t('items.form.sources_remove_tooltip')}
                rootError={editorErrors[PENDING_ROW_KEY] ?? null}
                onValidate={handleValidateNew}
                onRemove={handleCancelNewRow}
              />
            ) : null}

            {isEmpty ? (
              <div className="rounded-md border border-border bg-background p-6 text-center text-sm text-muted-foreground">
                {t('items.sources.empty')}
              </div>
            ) : null}
          </div>
        )}

        {showAddButton ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="self-start"
            onClick={handleAddNewRow}
            disabled={isMutating}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('items.sources.add_button')}
          </Button>
        ) : null}
      </section>

      {deleteTarget !== null ? (
        <DeleteItemSourceDialog
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setDeleteTarget(null)
          }}
          itemId={item.id}
          source={deleteTarget}
        />
      ) : null}
    </>
  )
}
