import { IMAGE_TOPICS, useImageLibrary } from '@/media'
import { Button } from '@/ui/Button'
import { Chip } from '@/ui/Chip'
import { EmptyState } from '@/ui/EmptyState'
import { LibraryGrid } from '@/ui/LibraryGrid'
import { SearchInput } from '@/ui/SearchInput'
import { PhotoTile } from './library/PhotoTile'
import { usePlaceLibraryPhoto } from './library/placeLibraryPhoto'

const DEVELOPERS = 'https://unsplash.com/developers'

export function ImagesPanel() {
  const lib = useImageLibrary()
  const place = usePlaceLibraryPhoto(lib.provider)
  const loadingMore = lib.status === 'loading' && lib.photos.length > 0
  const initialLoad = lib.status === 'loading' && lib.photos.length === 0

  return (
    <div className="space-y-4">
      <SearchInput
        value={lib.query}
        onChange={(e) => lib.setQuery(e.target.value)}
        placeholder="Search Unsplash"
        disabled={!lib.configured}
      />
      <div className="flex flex-wrap gap-1.5">
        {IMAGE_TOPICS.map((t) => (
          <Chip
            key={t.id}
            active={lib.topic === t.id}
            disabled={!lib.configured}
            onClick={() => lib.setTopic(lib.topic === t.id ? null : t.id)}
          >
            {t.label}
          </Chip>
        ))}
      </div>

      {!lib.configured && (
        <div className="grid place-items-center pt-8">
          <EmptyState title="Unsplash key required">
            <a href={DEVELOPERS} target="_blank" rel="noreferrer" className="text-[13px] text-primary hover:underline">
              Create an access key
            </a>
            <p className="max-w-[220px] text-[12px] text-muted-foreground">
              Set VITE_UNSPLASH_ACCESS_KEY in .env and restart the dev server.
            </p>
          </EmptyState>
        </div>
      )}

      {lib.configured && lib.status === 'error' && (
        <div className="grid place-items-center pt-6">
          <EmptyState title={lib.error ?? 'Could not load photos'} />
        </div>
      )}

      {lib.configured && initialLoad && (
        <p className="py-6 text-center text-[13px] text-muted-foreground">Loading photos…</p>
      )}

      {lib.configured && lib.status !== 'error' && lib.photos.length > 0 && (
        <>
          <LibraryGrid>
            {lib.photos.map((photo) => (
              <PhotoTile key={photo.id} photo={photo} onPlace={() => place(photo)} />
            ))}
          </LibraryGrid>
          <p className="text-center text-[11px] text-muted-foreground">
            Photos from{' '}
            <a href="https://unsplash.com/?utm_source=product_designer&utm_medium=referral" target="_blank" rel="noreferrer" className="underline">
              Unsplash
            </a>
          </p>
          {lib.hasMore && (
            <Button className="w-full" disabled={loadingMore} onClick={lib.loadMore}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </>
      )}

      {lib.configured && lib.status === 'ready' && lib.photos.length === 0 && (
        <div className="grid place-items-center pt-8">
          <EmptyState title="No photos match" />
        </div>
      )}
    </div>
  )
}
