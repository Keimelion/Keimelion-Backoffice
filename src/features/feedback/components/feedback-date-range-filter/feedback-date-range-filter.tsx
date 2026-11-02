'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { PAGE_PARAM } from '@/lib/url-params'
import { useTranslate } from '@/lib/i18n/use-translate'

export const CREATED_FROM_PARAM = 'createdFrom'
export const CREATED_TO_PARAM = 'createdTo'

export function FeedbackDateRangeFilter(): React.JSX.Element {
  const t = useTranslate()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromValue = searchParams.get(CREATED_FROM_PARAM) ?? ''
  const toValue = searchParams.get(CREATED_TO_PARAM) ?? ''

  const paramsRef = useRef<URLSearchParams>(new URLSearchParams(searchParams.toString()))
  useEffect(() => {
    paramsRef.current = new URLSearchParams(searchParams.toString())
  }, [searchParams])

  const updateParam = (name: string, value: string): void => {
    const current = paramsRef.current
    if (value.length > 0) {
      current.set(name, value)
    } else {
      current.delete(name)
    }
    current.delete(PAGE_PARAM)
    router.replace(`?${current.toString()}`, { scroll: false })
  }

  const handleFromChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateParam(CREATED_FROM_PARAM, event.target.value)
  }

  const handleToChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateParam(CREATED_TO_PARAM, event.target.value)
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={CREATED_FROM_PARAM}
          className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
        >
          {t('feedback.filters.created_from_label')}
        </label>
        <Input
          id={CREATED_FROM_PARAM}
          type="date"
          value={fromValue}
          onChange={handleFromChange}
          className="h-8 w-40 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={CREATED_TO_PARAM}
          className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
        >
          {t('feedback.filters.created_to_label')}
        </label>
        <Input
          id={CREATED_TO_PARAM}
          type="date"
          value={toValue}
          onChange={handleToChange}
          className="h-8 w-40 text-sm"
        />
      </div>
    </>
  )
}
