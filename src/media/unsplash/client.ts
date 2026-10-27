import type { LibraryPhoto } from '../types'

const API = 'https://api.unsplash.com'
const UTM = 'utm_source=product_designer&utm_medium=referral'

export function unsplashAccessKey(): string | undefined {
  const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
  return typeof key === 'string' && key.trim() ? key.trim() : undefined
}

export function withUtm(url: string): string {
  if (!url) return url
  return url.includes('?') ? `${url}&${UTM}` : `${url}?${UTM}`
}

/** Append a width hint to Unsplash's resizable raw URL (hotlink, not a copy). */
export function sizedUrl(raw: string, width: number): string {
  const joiner = raw.includes('?') ? '&' : '?'
  return `${raw}${joiner}w=${width}&q=80&fm=jpg&fit=max`
}

interface UnsplashUser {
  name?: string
  links?: { html?: string }
}

interface UnsplashPhoto {
  id: string
  width: number
  height: number
  alt_description?: string | null
  description?: string | null
  urls?: { raw?: string; small?: string; regular?: string }
  links?: { html?: string; download_location?: string }
  user?: UnsplashUser
}

export function mapPhoto(photo: UnsplashPhoto): LibraryPhoto | null {
  const raw = photo.urls?.raw
  if (!raw || !photo.links?.download_location) return null
  const name = photo.user?.name ?? 'Unsplash'
  return {
    id: photo.id,
    alt: photo.alt_description || photo.description || `Photo by ${name}`,
    width: photo.width || 1600,
    height: photo.height || 1200,
    thumbUrl: photo.urls?.small || sizedUrl(raw, 400),
    srcUrl: sizedUrl(raw, 1600),
    photographer: {
      name,
      profileUrl: withUtm(photo.user?.links?.html ?? 'https://unsplash.com'),
    },
    photoUrl: withUtm(photo.links?.html ?? `https://unsplash.com/photos/${photo.id}`),
    downloadLocation: photo.links.download_location,
  }
}

export async function unsplashGet<T>(path: string): Promise<T> {
  const key = unsplashAccessKey()
  if (!key) throw new Error('Unsplash access key is not set')
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' },
  })
  if (!res.ok) {
    const detail = res.status === 401 ? 'Check VITE_UNSPLASH_ACCESS_KEY' : `Unsplash returned ${res.status}`
    throw new Error(detail)
  }
  return res.json() as Promise<T>
}
