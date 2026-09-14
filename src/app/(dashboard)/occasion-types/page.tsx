import { OccasionTypesPageHeader } from '@/features/occasion-types/components/occasion-types-page-header'
import { OccasionTypesList } from '@/features/occasion-types/components/occasion-types-list'

export default function OccasionTypesPage(): React.JSX.Element {
  return (
    <>
      <OccasionTypesPageHeader />
      <OccasionTypesList />
    </>
  )
}
