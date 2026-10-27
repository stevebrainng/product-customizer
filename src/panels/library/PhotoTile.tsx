import type { LibraryPhoto } from '@/media'

export function PhotoTile({ photo, onPlace }: { photo: LibraryPhoto; onPlace: () => void }) {
  return (
    <button
      type="button"
      onClick={onPlace}
      aria-label={`Add photo by ${photo.photographer.name}`}
      className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <img src={photo.thumbUrl} alt={photo.alt} className="size-full object-cover" draggable={false} />
      <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-1 text-left text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {photo.photographer.name}
      </span>
    </button>
  )
}
