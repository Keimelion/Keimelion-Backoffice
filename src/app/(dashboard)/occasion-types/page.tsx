import { TranslatedPageHeader } from '@/components/shared/translated-page-header'
import { OccasionTypesList } from '@/features/occasion-types/components/occasion-types-list'

export default function OccasionTypesPage(): React.JSX.Element {
  return (
    <>
      <TranslatedPageHeader
        titleId="occasion_types.list.title"
        descriptionId="occasion_types.list.description"
      />
      <OccasionTypesList />
    </>
  )
}
