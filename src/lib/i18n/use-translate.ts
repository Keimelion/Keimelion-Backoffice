'use client'

import { useIntl } from 'react-intl'
import type { MessageId } from '@/lib/i18n/messages/en'

export type TranslateFn = (
  id: MessageId,
  values?: Record<string, string | number>,
) => string

export function useTranslate(): TranslateFn {
  const intl = useIntl()
  return (id, values) => intl.formatMessage({ id }, values)
}
