'use client'

import { useState } from 'react'
import type { UseFormSetError } from 'react-hook-form'
import { ErrorCode } from '@keimelion/api/shared/enums/error-code'
import { HttpStatus } from '@keimelion/api/shared/enums/http'
import { FormDialog } from '@/components/shared/form-dialog'
import { ListForm } from '@/features/lists/components/list-form'
import type { ListFormEditValues } from '@/features/lists/components/list-form'
import { useUpdateList } from '@/features/lists/hooks/use-admin-lists'
import type { ApiAdminList, UpdateListInput } from '@/data-access/lists/lists.schemas'
import { ApiRequestError } from '@/data-access/_shared/api-error'
import { applyApiValidationIssues } from '@/lib/apply-api-validation-issues'
import { collapseTagsIssuePaths } from '@/lib/collapse-tags-issue-paths'
import { haveSameUnorderedValues } from '@/lib/have-same-unordered-values'
import { translate } from '@/lib/i18n/translate'
import { notifySuccess } from '@/lib/notify'
import { pickChangedFields } from '@/lib/pick-changed-fields'
import { useTranslate } from '@/lib/i18n/use-translate'

const UPDATE_LIST_ISSUE_PATHS = ['title', 'description', 'occasionTypeId', 'tags'] as const

interface EditListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: ApiAdminList
}

const EDITABLE_LIST_FIELDS = ['title', 'description', 'occasionTypeId'] as const satisfies readonly (keyof ListFormEditValues)[]

export function EditListDialog({
  open,
  onOpenChange,
  list,
}: EditListDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false)
  const mutation = useUpdateList()

  function handleSubmit(
    values: ListFormEditValues,
    setError: UseFormSetError<ListFormEditValues>,
  ): void {
    const originalScalarFields: Pick<ListFormEditValues, 'title' | 'description' | 'occasionTypeId'> = {
      title: list.title,
      description: list.description,
      occasionTypeId: list.occasionTypeId,
    }
    const patch: UpdateListInput = pickChangedFields(
      originalScalarFields,
      values,
      EDITABLE_LIST_FIELDS,
    )
    const originalTagNames = list.tags.map((tag) => tag.name)
    const submittedTagNames = values.tags ?? []
    if (!haveSameUnorderedValues(originalTagNames, submittedTagNames)) {
      patch.tags = submittedTagNames
    }

    mutation.mutate(
      { id: list.id, input: patch },
      {
        onSuccess: (updated) => {
          notifySuccess({ title: translate('lists.mutation.updated_toast', { title: updated.title }) })
          onOpenChange(false)
        },
        onError: (error) => {
          if (error instanceof ApiRequestError && error.status === HttpStatus.CONFLICT) {
            setError('title', { message: t('lists.form.error.conflict') })
            return
          }
          if (
            error instanceof ApiRequestError
            && error.code === ErrorCode.TAG_INVALID_NAME
          ) {
            setError('tags', { message: t('lists.form.error.tag_invalid_name') })
            return
          }
          if (
            error instanceof ApiRequestError
            && error.code === ErrorCode.UNPROCESSABLE_ENTITY
            && error.issues !== null
          ) {
            const appliedCount = applyApiValidationIssues(
              collapseTagsIssuePaths(error.issues),
              setError as (path: string, errorValue: { message: string }) => void,
              UPDATE_LIST_ISSUE_PATHS,
            )
            if (appliedCount > 0) return
          }
          setError('root', { message: error.message })
        },
      },
    )
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('lists.admin.edit_dialog_title')}
      isFormDirty={isFormDirty}
    >
      <ListForm
        mode="edit"
        list={list}
        onSubmit={handleSubmit}
        onDirtyChange={setIsFormDirty}
        isPending={mutation.isPending}
      />
    </FormDialog>
  )
}
