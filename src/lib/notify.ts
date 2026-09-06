import { toast } from 'sonner'
import type { ExternalToast } from 'sonner'

interface NotifyOptions {
  persistent?: boolean
  id?: string
}

const PERSISTENT_CLASS = 'notify-persistent'

function buildOptions(options?: NotifyOptions): ExternalToast | undefined {
  if (!options) return undefined
  const base: ExternalToast = {}
  if (options.id !== undefined) base.id = options.id
  if (options.persistent === true) {
    base.duration = Number.POSITIVE_INFINITY
    base.className = PERSISTENT_CLASS
  }
  return Object.keys(base).length > 0 ? base : undefined
}

function callToast(
  fn: (message: string, data?: ExternalToast) => void,
  message: string,
  options?: NotifyOptions,
): void {
  const built = buildOptions(options)
  if (built === undefined) {
    fn(message)
    return
  }
  fn(message, built)
}

export const notify = {
  error(message: string, options?: NotifyOptions): void {
    callToast(toast.error, message, options)
  },
  success(message: string, options?: NotifyOptions): void {
    callToast(toast.success, message, options)
  },
  info(message: string, options?: NotifyOptions): void {
    callToast(toast.info, message, options)
  },
  warning(message: string, options?: NotifyOptions): void {
    callToast(toast.warning, message, options)
  },
}
