import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { useEditor } from '../provider/EditorProvider'
import { clampZoom } from '../zoom'

export { ZOOM_MIN, ZOOM_MAX, clampZoom } from '../zoom'

interface Anchor {
  wx: number
  wy: number
  cx: number
  cy: number
}

/**
 * Wheel and two-finger pinch zoom the canvas toward the pointer.
 * Windows and Chrome deliver a pinch as a wheel event with ctrlKey set.
 * The listener is non-passive so a pinch does not zoom the browser page.
 */
export function useCanvasZoom(
  scrollerRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  scale: number,
) {
  const setZoom = useEditor((s) => s.setZoom)
  const anchor = useRef<Anchor | null>(null)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      const stage = stageRef.current
      if (!stage) return
      e.preventDefault()
      const rect = stage.getBoundingClientRect()
      const delta = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * 16 : e.deltaY
      // Pinch deltas are small; a mouse notch is about 100px.
      const sensitivity = e.ctrlKey ? 0.01 : 0.0016
      const next = clampZoom(scale * Math.exp(-delta * sensitivity))
      if (Math.abs(next - scale) < 0.0005) return
      anchor.current = {
        wx: (e.clientX - rect.left) / scale,
        wy: (e.clientY - rect.top) / scale,
        cx: e.clientX,
        cy: e.clientY,
      }
      setZoom(next)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [scrollerRef, stageRef, scale, setZoom])

  useLayoutEffect(() => {
    const a = anchor.current
    const scroller = scrollerRef.current
    const stage = stageRef.current
    if (!a || !scroller || !stage) return
    anchor.current = null
    const rect = stage.getBoundingClientRect()
    scroller.scrollLeft += rect.left + a.wx * scale - a.cx
    scroller.scrollTop += rect.top + a.wy * scale - a.cy
  }, [scale, scrollerRef, stageRef])
}
