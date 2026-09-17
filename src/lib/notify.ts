import { toast } from 'sonner'
import { translate } from '@/lib/i18n/translate'

const DEFAULT_ERROR_MESSAGE_ID = 'query.error.default'

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
    toast.error(translate(DEFAULT_ERROR_MESSAGE_ID), { description: input.message })
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
