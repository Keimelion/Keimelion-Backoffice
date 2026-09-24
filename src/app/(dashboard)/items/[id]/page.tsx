import { Suspense } from 'react'
import { ItemDetailContent } from '@/features/items/components/item-detail-content'

interface ItemDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params
  return (
    <Suspense>
      <ItemDetailContent itemId={id} />
    </Suspense>
  )
}
