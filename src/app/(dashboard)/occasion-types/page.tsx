import { PageHeader } from '@/components/shared/page-header'
import { OccasionTypesList } from '@/features/occasion-types/components/occasion-types-list'

export default function OccasionTypesPage(): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="Occasion Types"
        description="Reference list of occasion types available for wishlists."
      />
      <OccasionTypesList />
    </>
  )
}
