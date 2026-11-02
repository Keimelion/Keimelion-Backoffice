'use client'

import { useTranslate } from '@/lib/i18n/use-translate'

interface SourceLike {
  price: string | null
  currency: string
}

interface ItemSourcesRecapProps {
  sources: readonly SourceLike[]
}

interface CurrencyAverage {
  currency: string
  average: number
}

const DECIMALS = 2

function computeAveragesByCurrency(sources: readonly SourceLike[]): CurrencyAverage[] {
  const totals = new Map<string, { sum: number; count: number }>()
  for (const source of sources) {
    if (source.price === null) continue
    const amount = Number(source.price)
    if (!Number.isFinite(amount)) continue
    const bucket = totals.get(source.currency) ?? { sum: 0, count: 0 }
    bucket.sum += amount
    bucket.count += 1
    totals.set(source.currency, bucket)
  }
  return Array.from(totals, ([currency, { sum, count }]) => ({
    currency,
    average: sum / count,
  }))
}

export function ItemSourcesRecap({ sources }: ItemSourcesRecapProps): React.JSX.Element | null {
  const t = useTranslate()

  if (sources.length === 0) return null

  const averages = computeAveragesByCurrency(sources)

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">
        {t('items.sources.recap.count', { count: sources.length })}
      </span>
      {averages.map(({ currency, average }) => (
        <span key={currency} className="whitespace-nowrap">
          {t('items.sources.recap.average_label')} {average.toFixed(DECIMALS)} {currency}
        </span>
      ))}
    </div>
  )
}
