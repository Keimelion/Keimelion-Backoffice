import { act, renderHook, type RenderHookResult } from '@testing-library/react'
import { useForm, type FieldNamesMarkedBoolean, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { useAutoSlug } from './use-auto-slug'

interface TestFormValues {
  name: string
  slug: string
}

interface HarnessResult {
  form: UseFormReturn<TestFormValues>
  dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<TestFormValues>>>
}

interface HarnessOptions {
  defaultValues?: TestFormValues
  enabled: boolean
}

function renderHarness(options: HarnessOptions): RenderHookResult<HarnessResult, HarnessOptions> {
  const defaults: TestFormValues = options.defaultValues ?? { name: '', slug: '' }
  return renderHook<HarnessResult, HarnessOptions>(() => {
    const form = useForm<TestFormValues>({ defaultValues: defaults })
    useAutoSlug({
      form,
      nameField: 'name',
      slugField: 'slug',
      enabled: options.enabled,
    })
    return { form, dirtyFields: form.formState.dirtyFields }
  })
}

describe('useAutoSlug', () => {
  it('live-syncs the slug when the name field changes', () => {
    const { result } = renderHarness({ enabled: true })

    act(() => {
      result.current.form.setValue('name', 'Électronique', { shouldDirty: true })
    })

    expect(result.current.form.getValues('slug')).toBe('electronique')
  })

  it('normalises diacritics and special characters live', () => {
    const { result } = renderHarness({ enabled: true })

    act(() => {
      result.current.form.setValue('name', 'Beauté & Santé', { shouldDirty: true })
    })
    expect(result.current.form.getValues('slug')).toBe('beaute-sante')

    act(() => {
      result.current.form.setValue('name', 'A/B — Cool!!', { shouldDirty: true })
    })
    expect(result.current.form.getValues('slug')).toBe('a-b-cool')
  })

  it('stops syncing once the user manually edits the slug', () => {
    const { result } = renderHarness({ enabled: true })

    act(() => {
      result.current.form.setValue('name', 'Books', { shouldDirty: true })
    })
    expect(result.current.form.getValues('slug')).toBe('books')

    act(() => {
      result.current.form.setValue('slug', 'my-custom-slug', { shouldDirty: true })
    })

    act(() => {
      result.current.form.setValue('name', 'Something Else', { shouldDirty: true })
    })

    expect(result.current.form.getValues('slug')).toBe('my-custom-slug')
  })

  it('does not sync when disabled', () => {
    const { result } = renderHarness({
      defaultValues: { name: 'Books', slug: 'preset-slug' },
      enabled: false,
    })

    act(() => {
      result.current.form.setValue('name', 'Changed Name', { shouldDirty: true })
    })

    expect(result.current.form.getValues('slug')).toBe('preset-slug')
  })

  it('marks the slug field as dirty when auto-syncing', () => {
    const { result } = renderHarness({ enabled: true })

    act(() => {
      result.current.form.setValue('name', 'Hello World', { shouldDirty: true })
    })

    expect(result.current.form.getValues('slug')).toBe('hello-world')
    expect(result.current.form.formState.dirtyFields.slug).toBe(true)
  })

  it('tracks successive name edits before the user takes over', () => {
    const { result } = renderHarness({ enabled: true })

    act(() => {
      result.current.form.setValue('name', 'Foo', { shouldDirty: true })
    })
    expect(result.current.form.getValues('slug')).toBe('foo')

    act(() => {
      result.current.form.setValue('name', 'Foo Bar', { shouldDirty: true })
    })
    expect(result.current.form.getValues('slug')).toBe('foo-bar')

    act(() => {
      result.current.form.setValue('name', '', { shouldDirty: true })
    })
    expect(result.current.form.getValues('slug')).toBe('')
  })
})
