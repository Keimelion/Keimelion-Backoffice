'use client'

import * as React from 'react'
import type * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldError,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

const Form = FormProvider

interface FormFieldContextValue {
  name: string
}

interface FormItemContextValue {
  id: string
}

interface FieldIds {
  item: string
  message: string
}

interface FormFieldState {
  ids: FieldIds
  error: FieldError | undefined
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)
const FormItemContext = React.createContext<FormItemContextValue | null>(null)

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>): React.JSX.Element {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

function buildFieldIds(baseId: string): FieldIds {
  return {
    item: `${baseId}-form-item`,
    message: `${baseId}-form-item-message`,
  }
}

function useFieldContext(): FormFieldContextValue {
  const context = React.useContext(FormFieldContext)
  if (context === null) {
    throw new Error('Field components must be used within <FormField>')
  }
  return context
}

function useItemContext(): FormItemContextValue {
  const context = React.useContext(FormItemContext)
  if (context === null) {
    throw new Error('Field components must be used within <FormItem>')
  }
  return context
}

function useFormField(): FormFieldState {
  const fieldContext = useFieldContext()
  const itemContext = useItemContext()
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  return {
    ids: buildFieldIds(itemContext.id),
    error: fieldState.error,
  }
}

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId()
    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('flex flex-col gap-1.5', className)} {...props} />
      </FormItemContext.Provider>
    )
  },
)
FormItem.displayName = 'FormItem'

const FormLabel = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, ids } = useFormField()
  return (
    <Label
      ref={ref}
      className={cn(error ? 'text-destructive' : null, className)}
      htmlFor={ids.item}
      {...props}
    />
  )
})
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef<
  React.ComponentRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>((props, ref) => {
  const { error, ids } = useFormField()
  const hasError = error !== undefined
  return (
    <Slot
      ref={ref}
      id={ids.item}
      aria-invalid={hasError}
      aria-describedby={hasError ? ids.message : undefined}
      {...props}
    />
  )
})
FormControl.displayName = 'FormControl'

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, ids } = useFormField()
  const errorMessage = typeof error?.message === 'string' ? error.message : null
  const body = errorMessage ?? children
  return (
    <p
      ref={ref}
      id={ids.message}
      className={cn(
        'min-h-4 text-xs font-medium leading-4 text-destructive',
        className,
      )}
      aria-live="polite"
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = 'FormMessage'

export { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField }
