import { useRef } from 'react'
import { EditorStage, resolveScale, selectProduct, useEditor, useElementSize, type SideId } from '@/engine'
import { Segmented } from '@/ui/Segmented'
import { TextToolbar } from './TextToolbar'

const SIDES: { value: SideId; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
]

export function CanvasStage() {
  const side = useEditor((s) => s.activeSide)
  const setSide = useEditor((s) => s.setActiveSide)
  const zoom = useEditor((s) => s.zoom)
  const world = useEditor((s) => selectProduct(s).world)

  const scrollerRef = useRef<HTMLDivElement>(null)
  const viewport = useElementSize(scrollerRef)
  const scale = resolveScale(zoom, world, viewport)

  return (
    <main className="relative min-w-0 flex-1 overflow-hidden">
      <div ref={scrollerRef} className="absolute inset-0 flex overflow-auto px-6 pb-[76px] pt-6">
        <EditorStage scale={scale} className="m-auto shrink-0" />
      </div>
      <TextToolbar />
      <Segmented
        label="Product side"
        options={SIDES}
        value={side}
        onChange={setSide}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      />
    </main>
  )
}
