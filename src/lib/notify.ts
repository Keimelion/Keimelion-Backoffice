/**
 * Toast notification helpers. Copy conventions:
 * - title: short sentence, capital first letter, no trailing period ("User updated")
 * - description: full sentence with trailing period ("The user has been saved.")
 * - notifyError default title: "Something went wrong"
 *
 * These helpers are client-only — sonner requires a mounted DOM.
 * Do not import from Server Components.
 */
import { toast } from 'sonner'

const DEFAULT_ERROR_TITLE = 'Something went wrong'

interface NotifyAction {
  label: string
  onClick: () => void
}

export interface NotifyInput {
  title: string
  description?: string
  action?: NotifyAction
}

export function notifySuccess({ title, description, action }: NotifyInput): void {
  toast.success(title, { description, action })
}

export function notifyError(input: Error | NotifyInput): void {
  if (input instanceof Error) {
    toast.error(DEFAULT_ERROR_TITLE, { description: input.message })
    return
  }
  toast.error(input.title, { description: input.description, action: input.action })
}

export function notifyWarning({ title, description, action }: NotifyInput): void {
  toast.warning(title, { description, action })
}

export function notifyInfo({ title, description, action }: NotifyInput): void {
  toast.info(title, { description, action })
}
