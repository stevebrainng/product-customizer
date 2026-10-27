import { SearchInput } from '@/ui/SearchInput'
import { EmptyState } from '@/ui/EmptyState'

/** Default body for tools whose panel is not built yet. */
export function PlaceholderPanel({ searchable = true }: { searchable?: boolean }) {
  return (
    <div className="space-y-6">
      {searchable && <SearchInput />}
      <div className="grid place-items-center pt-10">
        <EmptyState title="Nothing here yet" />
      </div>
    </div>
  )
}
