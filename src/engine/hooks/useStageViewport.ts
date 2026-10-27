import { useLayoutEffect, useState, type RefObject } from 'react'
import type { Size } from '../types'
import type { Zoom } from '../store/editorStore'

export function useElementSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return size
}

/** 'auto' fits the world into the viewport minus padding; a number is used as is. */
export function resolveScale(zoom: Zoom, world: Size, viewport: Size, pad = { x: 48, y: 100 }) {
  if (zoom !== 'auto') return zoom
  if (!viewport.width || !viewport.height) return 1
  const fit = Math.min((viewport.width - pad.x) / world.width, (viewport.height - pad.y) / world.height)
  return Math.min(1.5, Math.max(0.2, fit))
}
