import { useCallback, useEffect, useRef, useState } from 'react'
import { defaultImageLibrary } from '../defaultLibrary'
import type { ImageLibraryProvider, LibraryPhoto } from '../types'

const PER_PAGE = 20

export function useImageLibrary(provider: ImageLibraryProvider = defaultImageLibrary) {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState<string | null>(null)
  const [debounced, setDebounced] = useState('')
  const [photos, setPhotos] = useState<LibraryPhoto[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const request = useRef(0)

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 300)
    return () => window.clearTimeout(t)
  }, [query])

  const configured = provider.isConfigured()
  const terms = [topic, debounced].filter(Boolean).join(' ')

  useEffect(() => {
    if (!configured) {
      setPhotos([])
      setPage(1)
      setTotalPages(0)
      setStatus('ready')
      setError(null)
      return
    }
    const id = ++request.current
    setStatus('loading')
    setError(null)
    const run = terms
      ? provider.search({ query: terms, page: 1, perPage: PER_PAGE })
      : provider.list(1, PER_PAGE)
    run
      .then((res) => {
        if (id !== request.current) return
        setPhotos(res.photos)
        setPage(1)
        setTotalPages(res.totalPages)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (id !== request.current) return
        setPhotos([])
        setError(err instanceof Error ? err.message : 'Could not load photos')
        setStatus('error')
      })
  }, [configured, provider, terms])

  const loadMore = useCallback(() => {
    if (!configured || page >= totalPages) return
    const next = page + 1
    const id = ++request.current
    setStatus('loading')
    const run = terms
      ? provider.search({ query: terms, page: next, perPage: PER_PAGE })
      : provider.list(next, PER_PAGE)
    run
      .then((res) => {
        if (id !== request.current) return
        setPhotos((prev) => [...prev, ...res.photos])
        setPage(next)
        setTotalPages(res.totalPages)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (id !== request.current) return
        setError(err instanceof Error ? err.message : 'Could not load photos')
        setStatus('error')
      })
  }, [configured, page, provider, terms, totalPages])

  return {
    configured,
    provider,
    query,
    setQuery,
    topic,
    setTopic,
    photos,
    status,
    error,
    hasMore: configured && page < totalPages && photos.length > 0,
    loadMore,
  }
}
