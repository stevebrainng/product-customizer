import { useRef } from 'react'
import {
  EditorStage,
  resolveScale,
  selectProduct,
  useCanvasZoom,
  useEditor,
  useElementSize,
} from '@/engine'
import { CanvasDropTarget } from '@/dnd/CanvasDnd'
import { ImageToolbar } from '@/layout/ImageToolbar'
import { ShapeToolbar } from '@/layout/ShapeToolbar'
import { TextToolbar } from '@/layout/TextToolbar'
import { ZoomControl } from '@/layout/ZoomControl'
import { SideThumbs } from './SideThumbs'

export function CustomizerCanvas() {
  const product = useEditor(selectProduct)
  const zoom = useEditor((s) => s.zoom)

  const scrollerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const viewport = useElementSize(scrollerRef)
  const scale = product ? resolveScale(zoom, product.world, viewport) : 1
  useCanvasZoom(scrollerRef, stageRef, scale)

  if (!product) {
    return (
      <main className="relative min-w-0 flex-1 overflow-hidden bg-muted">
        <div className="absolute inset-0 grid place-items-center p-6 text-sm text-muted-foreground">
          Product unavailable
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-w-0 flex-1 overflow-hidden bg-muted">
      <div
        ref={scrollerRef}
        className="absolute inset-0 flex overflow-auto px-3 pt-3 pb-28 sm:px-6 sm:pt-6 md:pb-20"
      >
        <CanvasDropTarget stageRef={stageRef} scale={scale} className="m-auto shrink-0">
          <EditorStage scale={scale} />
        </CanvasDropTarget>
      </div>
      <TextToolbar />
      <ImageToolbar />
      <ShapeToolbar />
      <SideThumbs />
      <div className="absolute right-3 bottom-3 z-10 md:right-4 md:bottom-4">
        <div className="rounded-xl border border-line bg-white/95 p-1 shadow-sm backdrop-blur">
          <ZoomControl />
        </div>
      </div>
    </main>
  )
}
