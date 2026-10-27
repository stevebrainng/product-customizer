import type { Asset } from '@/engine'
import { useEditorStore } from '@/engine'
import { defaultImageLibrary, type ImageLibraryProvider, type LibraryPhoto } from '@/media'

type PlaceApi = {
  assets: Record<string, Asset>
  addAsset: (asset: Asset) => void
  addImageNode: (assetId: string) => string | null
}

/** Registers a hotlinked library photo as an asset and drops it on the canvas. */
export function placeLibraryPhoto(
  api: PlaceApi,
  photo: LibraryPhoto,
  provider: ImageLibraryProvider = defaultImageLibrary,
) {
  const id = `${provider.id}-${photo.id}`
  if (!api.assets[id]) {
    api.addAsset({
      id,
      name: photo.alt,
      src: photo.srcUrl,
      width: photo.width,
      height: photo.height,
      source: 'unsplash',
      attribution: {
        name: photo.photographer.name,
        profileUrl: photo.photographer.profileUrl,
        photoUrl: photo.photoUrl,
      },
    })
  }
  provider.trackDownload(photo)
  api.addImageNode(id)
}

export function usePlaceLibraryPhoto(provider: ImageLibraryProvider = defaultImageLibrary) {
  const store = useEditorStore()
  return (photo: LibraryPhoto) => placeLibraryPhoto(store.getState(), photo, provider)
}
