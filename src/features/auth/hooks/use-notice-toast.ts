'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { NOTICE_PARAM, resolveNoticeMessageId } from '@/data-access/auth/notices'
import { useTranslate } from '@/lib/i18n/use-translate'
import type { NotifyInput } from '@/lib/notify'

export function useNoticeToast(notify: (input: NotifyInput) => void): void {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslate()

  useEffect(() => {
    const messageId = resolveNoticeMessageId(searchParams.get(NOTICE_PARAM))
    if (messageId === null) return
    notify({ title: t(messageId) })
    router.replace(pathname)
  }, [searchParams, router, pathname, notify, t])
}
