'use client'

import { useEffect, useRef } from 'react'
import {
  useWatch,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormReturn,
} from 'react-hook-form'
import { slugify } from './slugify'

export interface UseAutoSlugOptions<TValues extends FieldValues> {
  form: UseFormReturn<TValues>
  nameField: Path<TValues>
  slugField: Path<TValues>
  enabled: boolean
}

export function useAutoSlug<TValues extends FieldValues>({
  form,
  nameField,
  slugField,
  enabled,
}: UseAutoSlugOptions<TValues>): void {
  const isLockedRef = useRef(false)
  const lastAutoSlugRef = useRef<string>('')

  const nameValue = useWatch({ control: form.control, name: nameField }) as unknown
  const slugValue = useWatch({ control: form.control, name: slugField }) as unknown

  useEffect(() => {
    if (!enabled || isLockedRef.current) return
    const currentSlug = typeof slugValue === 'string' ? slugValue : ''
    if (currentSlug !== lastAutoSlugRef.current) {
      isLockedRef.current = true
    }
  }, [slugValue, enabled])

  useEffect(() => {
    if (!enabled || isLockedRef.current) return
    const currentName = typeof nameValue === 'string' ? nameValue : ''
    const nextSlug = slugify(currentName)
    if (nextSlug === lastAutoSlugRef.current) return
    lastAutoSlugRef.current = nextSlug
    form.setValue(slugField, nextSlug as PathValue<TValues, Path<TValues>>, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }, [nameValue, enabled, form, slugField])
}
