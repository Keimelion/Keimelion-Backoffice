'use client'

import { useCallback, useEffect, useState } from 'react'
import { useFieldArray, useForm, useFormContext } from 'react-hook-form'
import type { FieldValues, UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { IconButton } from '@/components/shared/icon-button'
import {
  createItemInputSchema,
  updateItemInputSchema,
  type ApiAdminItem,
  type CreateItemInput,
  type UpdateItemInput,
} from '@/data-access/items/items.schemas'
import { EMPTY_ITEM_SOURCE_INPUT } from '@/data-access/items/item-sources.schemas'
import { useAdminShops } from '@/features/shops/hooks/use-admin-shops'
import { ItemSourceFields } from '@/features/items/components/item-source-fields'
import {
  ItemSourceSummary,
  resolveShopName,
} from '@/features/items/components/item-source-summary'
import { ItemSourcesRecap } from '@/features/items/components/item-sources-recap'
import { useTranslate } from '@/lib/i18n/use-translate'

const HTTPS_PREFIX = 'https://'
const SHOPS_FILTER = { page: 1, limit: 100, isActive: true } as const

export type ItemFormCreateValues = CreateItemInput
export type ItemFormEditValues = UpdateItemInput

type ItemFormProps =
  | {
      mode: 'create'
      onSubmit: (values: ItemFormCreateValues, setError: UseFormSetError<ItemFormCreateValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }
  | {
      mode: 'edit'
      item: ApiAdminItem
      onSubmit: (values: ItemFormEditValues, setError: UseFormSetError<ItemFormEditValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }

function buildCreateDefaults(): ItemFormCreateValues {
  return {
    name: '',
    description: null,
    imageUrl: null,
    sources: [EMPTY_ITEM_SOURCE_INPUT],
  }
}

function buildEditDefaults(item: ApiAdminItem): ItemFormEditValues {
  return {
    name: item.name,
    description: item.description,
    imageUrl: item.imageUrl,
  }
}

export function ItemForm(props: ItemFormProps): React.JSX.Element {
  if (props.mode === 'create') return <CreateItemForm {...props} />
  return <EditItemForm {...props} />
}

interface CreateItemFormProps {
  onSubmit: (values: ItemFormCreateValues, setError: UseFormSetError<ItemFormCreateValues>) => void
  onDirtyChange: (isDirty: boolean) => void
  isPending: boolean
}

function CreateItemForm({ onSubmit, onDirtyChange, isPending }: CreateItemFormProps): React.JSX.Element {
  const t = useTranslate()
  const shopsQuery = useAdminShops(SHOPS_FILTER)
  const shops = shopsQuery.data?.items ?? []

  const form = useForm<ItemFormCreateValues>({
    resolver: zodResolver(createItemInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: buildCreateDefaults(),
  })

  const sourcesArray = useFieldArray({ control: form.control, name: 'sources' })

  const values = form.watch()
  const isFormValid = createItemInputSchema.safeParse(values).success
  const { isDirty } = form.formState
  const canSubmit = isFormValid && isDirty && !isPending
  const canRemoveSource = sourcesArray.fields.length > 1

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set())

  const handleValidateSourceRow = useCallback(
    async (index: number, id: string): Promise<void> => {
      const prefix = `sources.${String(index)}` as `sources.${number}`
      const paths = [
        `${prefix}.sourceUrl`,
        `${prefix}.price`,
        `${prefix}.currency`,
        `${prefix}.shopId`,
      ] as const
      const isSourceValid = await form.trigger(paths)
      if (!isSourceValid) return
      setCollapsedIds((previous) => {
        const next = new Set(previous)
        next.add(id)
        return next
      })
    },
    [form],
  )

  const handleEditSourceRow = useCallback((id: string): void => {
    setCollapsedIds((previous) => {
      if (!previous.has(id)) return previous
      const next = new Set(previous)
      next.delete(id)
      return next
    })
  }, [])

  const handleRemoveSourceRow = useCallback((index: number, id: string): void => {
    setCollapsedIds((previous) => {
      if (!previous.has(id)) return previous
      const next = new Set(previous)
      next.delete(id)
      return next
    })
    sourcesArray.remove(index)
  }, [sourcesArray])

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  const imagePreviewUrl =
    typeof values.imageUrl === 'string' && values.imageUrl.startsWith(HTTPS_PREFIX)
      ? values.imageUrl
      : null

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          void form.handleSubmit((submittedValues) => {
            onSubmit(submittedValues, form.setError)
          })(event)
        }}
        noValidate
      >
        <ItemCoreFields imagePreviewUrl={imagePreviewUrl} isPending={isPending} />

        <section className="flex flex-col gap-3 rounded-md border border-border bg-muted/20 p-4">
          <header className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-foreground">
              {t('items.form.sources_section_title')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('items.form.sources_section_help')}
            </p>
          </header>

          <ItemSourcesRecap sources={values.sources} />

          <div className="flex flex-col gap-3">
            {sourcesArray.fields.map((field, index) => {
              const isCollapsed = collapsedIds.has(field.id)
              const removeLabel = canRemoveSource
                ? t('items.form.sources_remove_tooltip')
                : t('items.form.sources_remove_last_tooltip')
              const disabledShopIds = new Set(
                values.sources
                  .map((source, otherIndex) => (otherIndex === index ? null : source.shopId))
                  .filter((shopId): shopId is string => shopId !== null),
              )

              if (isCollapsed) {
                const sourceValue = values.sources[index] ?? EMPTY_ITEM_SOURCE_INPUT
                return (
                  <ItemSourceSummary
                    key={field.id}
                    values={sourceValue}
                    shopName={resolveShopName(sourceValue.shopId, shops)}
                    canRemove={canRemoveSource}
                    isPending={isPending}
                    editLabel={t('items.form.source_edit_tooltip')}
                    removeLabel={t('items.form.sources_remove_tooltip')}
                    removeDisabledLabel={t('items.form.sources_remove_last_tooltip')}
                    onEdit={() => { handleEditSourceRow(field.id) }}
                    onRemove={() => { handleRemoveSourceRow(index, field.id) }}
                  />
                )
              }

              return (
                <div
                  key={field.id}
                  className="flex flex-col gap-3 rounded-md border border-border bg-background p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t('items.form.source_row_title', { index: index + 1 })}
                    </span>
                    <IconButton
                      label={removeLabel}
                      tone="destructive"
                      disabled={!canRemoveSource || isPending}
                      onClick={() => { handleRemoveSourceRow(index, field.id) }}
                    >
                      <Trash2 />
                    </IconButton>
                  </div>
                  <ItemSourceFields<ItemFormCreateValues>
                    namePrefix={`sources.${String(index)}` as `sources.${number}`}
                    shops={shops}
                    isShopsLoading={shopsQuery.isLoading}
                    disabled={isPending}
                    disabledShopIds={disabledShopIds}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      disabled={isPending}
                      onClick={() => { void handleValidateSourceRow(index, field.id) }}
                    >
                      {t('items.form.source_validate_button')}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="self-start"
            onClick={() => { sourcesArray.append(EMPTY_ITEM_SOURCE_INPUT) }}
            disabled={isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('items.form.sources_add_button')}
          </Button>
        </section>

        {form.formState.errors.root ? (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!canSubmit}>
            {isPending ? t('items.form.submit_pending') : t('items.form.submit_create')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

interface EditItemFormProps {
  item: ApiAdminItem
  onSubmit: (values: ItemFormEditValues, setError: UseFormSetError<ItemFormEditValues>) => void
  onDirtyChange: (isDirty: boolean) => void
  isPending: boolean
}

function EditItemForm({ item, onSubmit, onDirtyChange, isPending }: EditItemFormProps): React.JSX.Element {
  const t = useTranslate()

  const form = useForm<ItemFormEditValues>({
    resolver: zodResolver(updateItemInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: buildEditDefaults(item),
  })

  const values = form.watch()
  const isFormValid = updateItemInputSchema.safeParse(values).success
  const { isDirty } = form.formState
  const canSubmit = isFormValid && isDirty && !isPending

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  const imagePreviewUrl =
    typeof values.imageUrl === 'string' && values.imageUrl.startsWith(HTTPS_PREFIX)
      ? values.imageUrl
      : null

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          void form.handleSubmit((submittedValues) => {
            onSubmit(submittedValues, form.setError)
          })(event)
        }}
        noValidate
      >
        <ItemCoreFields imagePreviewUrl={imagePreviewUrl} isPending={isPending} />

        {form.formState.errors.root ? (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!canSubmit}>
            {isPending ? t('items.form.submit_pending') : t('items.form.submit_edit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

interface ItemCoreFieldsProps {
  imagePreviewUrl: string | null
  isPending: boolean
}

function ItemCoreFields({ imagePreviewUrl, isPending }: ItemCoreFieldsProps): React.JSX.Element {
  const t = useTranslate()
  const form = useFormContext<FieldValues>()
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>{t('items.form.name_label')}</FormLabel>
            <FormControl>
              <Input
                placeholder={t('items.form.name_placeholder')}
                disabled={isPending}
                value={typeof field.value === 'string' ? field.value : ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('items.form.description_label')}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t('items.form.description_placeholder')}
                disabled={isPending}
                value={typeof field.value === 'string' ? field.value : ''}
                onChange={(event) => {
                  const next = event.target.value
                  field.onChange(next.length > 0 ? next : null)
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                rows={3}
              />
            </FormControl>
            <FormDescription>{t('items.form.description_help')}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('items.form.image_url_label')}</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder={t('items.form.image_url_placeholder')}
                disabled={isPending}
                value={typeof field.value === 'string' ? field.value : ''}
                onChange={(event) => {
                  const next = event.target.value
                  field.onChange(next.length > 0 ? next : null)
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormDescription>{t('items.form.image_url_help')}</FormDescription>
            <FormMessage />
            {imagePreviewUrl !== null ? (
              <img
                src={imagePreviewUrl}
                alt={t('items.form.image_preview_alt')}
                className="mt-2 h-16 w-16 rounded-md border border-border object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : null}
          </FormItem>
        )}
      />
    </>
  )
}
