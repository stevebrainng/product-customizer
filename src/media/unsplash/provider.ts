import type { ImageLibraryProvider, ImageSearchQuery, ImageSearchResult, LibraryPhoto } from '../types'
import { mapPhoto, unsplashAccessKey, unsplashGet } from './client'

interface ListBody {
  results?: unknown
  total?: number
  total_pages?: number
}

function pageOf(body: unknown, page: number, listShape: 'array' | 'search'): ImageSearchResult {
  const photos: LibraryPhoto[] = []
  if (listShape === 'array' && Array.isArray(body)) {
    for (const item of body) {
      const mapped = mapPhoto(item as Parameters<typeof mapPhoto>[0])
      if (mapped) photos.push(mapped)
    }
    return { photos, total: photos.length, totalPages: photos.length ? page + 1 : page, page }
  }
  const data = (body ?? {}) as ListBody
  const rows = Array.isArray(data.results) ? data.results : []
  for (const item of rows) {
    const mapped = mapPhoto(item as Parameters<typeof mapPhoto>[0])
    if (mapped) photos.push(mapped)
  }
  return {
    photos,
    total: data.total ?? photos.length,
    totalPages: data.total_pages ?? 1,
    page,
  }
}

export const unsplashProvider: ImageLibraryProvider = {
  id: 'unsplash',
  label: 'Unsplash',
  isConfigured: () => Boolean(unsplashAccessKey()),
  async list(page = 1, perPage = 20) {
    const body = await unsplashGet<unknown>(`/photos?page=${page}&per_page=${perPage}&order_by=popular`)
    const result = pageOf(body, page, 'array')
    // Editorial list has no total_pages; stop when a page comes back short.
    return { ...result, totalPages: result.photos.length < perPage ? page : page + 1 }
  },
  async search({ query, page = 1, perPage = 20 }: ImageSearchQuery) {
    const q = encodeURIComponent(query)
    const body = await unsplashGet<unknown>(`/search/photos?query=${q}&page=${page}&per_page=${perPage}`)
    return pageOf(body, page, 'search')
  },
  trackDownload(photo) {
    const key = unsplashAccessKey()
    if (!key || !photo.downloadLocation) return
    void fetch(photo.downloadLocation, { headers: { Authorization: `Client-ID ${key}` } }).catch(() => {})
  },
}
