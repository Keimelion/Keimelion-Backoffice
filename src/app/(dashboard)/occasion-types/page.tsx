import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { OccasionTypesList } from '@/features/occasion-types/components/occasion-types-list'

export default function OccasionTypesPage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader namespace="occasion_types.list" />
      <OccasionTypesList />
    </>
  )
}
