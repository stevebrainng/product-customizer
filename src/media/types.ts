/** A photo from any remote library. Panels never see provider-specific JSON. */
export interface LibraryPhoto {
  id: string
  alt: string
  width: number
  height: number
  thumbUrl: string
  /** Hotlinked URL sized for placement on the canvas. */
  srcUrl: string
  photographer: { name: string; profileUrl: string }
  photoUrl: string
  downloadLocation: string
}

export interface ImageSearchQuery {
  query: string
  page?: number
  perPage?: number
}

export interface ImageSearchResult {
  photos: LibraryPhoto[]
  total: number
  totalPages: number
  page: number
}

/**
 * Remote image catalog. Add another source by implementing this and swapping
 * `defaultImageLibrary` — panels stay unchanged.
 */
export interface ImageLibraryProvider {
  id: string
  label: string
  isConfigured: () => boolean
  /** Editorial / featured feed when the user has not searched. */
  list: (page?: number, perPage?: number) => Promise<ImageSearchResult>
  search: (query: ImageSearchQuery) => Promise<ImageSearchResult>
  /** Guideline event when a photo is placed. Must not block placement. */
  trackDownload: (photo: LibraryPhoto) => void
}
