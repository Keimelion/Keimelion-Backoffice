'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Button } from '@/components/ui/button'
import {
  createCategoryInputSchema,
  type ApiCategory,
  type CreateCategoryInput,
} from '@/data-access/categories/categories.schemas'
import { useAdminCategories } from '@/features/categories/hooks/use-admin-categories'
import { ParentCategorySelect } from '@/features/categories/components/parent-category-select'
import { collectDescendantIds } from '@/features/categories/lib/category-tree'
import { useTranslate } from '@/lib/i18n/use-translate'
import { useAutoSlug } from '@/lib/use-auto-slug'

export type CategoryFormValues = CreateCategoryInput

type CategoryFormProps =
  | {
      mode: 'create'
      defaultParentId?: string | null
      onSubmit: (values: CategoryFormValues, setError: UseFormSetError<CategoryFormValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }
  | {
      mode: 'edit'
      category: ApiCategory
      onSubmit: (values: CategoryFormValues, setError: UseFormSetError<CategoryFormValues>) => void
      onDirtyChange: (isDirty: boolean) => void
      isPending: boolean
    }

function buildDefaultValues(props: CategoryFormProps): CategoryFormValues {
  if (props.mode === 'edit') {
    return {
      name: props.category.name,
      slug: props.category.slug,
      parentId: props.category.parentId,
    }
  }
  return {
    name: '',
    slug: '',
    parentId: props.defaultParentId ?? null,
  }
}

export function CategoryForm(props: CategoryFormProps): React.JSX.Element {
  const { mode, onSubmit, onDirtyChange, isPending } = props
  const t = useTranslate()
  const isEdit = mode === 'edit'

  const categoriesQuery = useAdminCategories()
  const categories = categoriesQuery.data ?? []

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(createCategoryInputSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: buildDefaultValues(props),
  })

  useAutoSlug({ form, nameField: 'name', slugField: 'slug', enabled: !isEdit })

  const values = form.watch()
  const isFormValid = createCategoryInputSchema.safeParse(values).success
  const { isDirty } = form.formState
  const canSubmit = isFormValid && isDirty && !isPending

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  const excludedIds = useMemo<ReadonlySet<string>>(() => {
    if (!isEdit) return new Set()
    const descendants = collectDescendantIds(props.category.id, categories)
    descendants.add(props.category.id)
    return descendants
  }, [isEdit, props, categories])

  const submitLabel = isPending
    ? t('categories.form.submit_pending')
    : isEdit
      ? t('categories.form.submit_edit')
      : t('categories.form.submit_create')

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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('categories.form.name_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('categories.form.name_placeholder')}
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('categories.form.slug_label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('categories.form.slug_placeholder')}
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>{t('categories.form.slug_help')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('categories.form.parent_label')}</FormLabel>
              <FormControl>
                <ParentCategorySelect
                  value={field.value}
                  onChange={field.onChange}
                  categories={categories}
                  isLoading={categoriesQuery.isLoading}
                  disabled={isPending}
                  excludedIds={excludedIds}
                />
              </FormControl>
              <FormDescription>{t('categories.form.parent_help')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root ? (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!canSubmit}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
