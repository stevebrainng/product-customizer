import { createContext, useContext, useLayoutEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { DEFAULT_FONT_FAMILY, fontLoadSpecs } from '@/config/fonts'
import { selectProduct, useEditorRuntime, useEditorStore, type Point, type TextNode } from '@/engine'
import { defaultImageLibrary } from '@/media'
import { placeLibraryPhoto } from '@/panels/library/placeLibraryPhoto'
import { cn } from '@/lib/cn'
import { CANVAS_DROP_ID, isLibraryDrag, type LibraryDragData } from './types'

interface DropGeometry {
  stage: HTMLElement | null
  scale: number
}

const GeometryContext = createContext<MutableRefObject<DropGeometry> | null>(null)

function clientPoint(event: DragEndEvent): Point | null {
  const e = event.activatorEvent
  if (!e || !('clientX' in e) || !('clientY' in e)) return null
  const point = e as MouseEvent
  return { x: point.clientX + event.delta.x, y: point.clientY + event.delta.y }
}

function DragPreviewCard({ data }: { data: LibraryDragData }) {
  return (
    <div className="grid size-16 cursor-grabbing place-items-center overflow-hidden rounded-xl bg-white text-[13px] font-medium text-ink shadow-lg ring-1 ring-black/10">
      {data.preview.imageUrl ? (
        <img src={data.preview.imageUrl} alt="" className="size-full object-cover" />
      ) : (
        <span className={data.preview.emoji ? 'text-[32px] leading-none' : 'px-1.5 text-center leading-tight'}>
          {data.preview.emoji ?? data.preview.label}
        </span>
      )}
    </div>
  )
}

export function CanvasDnd({ children }: { children: ReactNode }) {
  const store = useEditorStore()
  const runtime = useEditorRuntime()
  const geometry = useRef<DropGeometry>({ stage: null, scale: 1 })
  const [dragging, setDragging] = useState<LibraryDragData | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const place = (data: LibraryDragData, at: Point) => {
    const state = store.getState()
    const product = selectProduct(state)
    if (!product) return
    const area = product.sides[state.activeSide].printArea
    const center = {
      x: Math.min(Math.max(at.x, area.x), area.x + area.width),
      y: Math.min(Math.max(at.y, area.y), area.y + area.height),
    }
    if (data.kind === 'asset') {
      state.addImageNode(data.assetId, center)
      return
    }
    if (data.kind === 'photo') {
      placeLibraryPhoto(state, data.photo, defaultImageLibrary, center)
      return
    }
    const id = state.addNode(data.preset.type, data.preset.overrides, center)
    if (!id || data.preset.type !== 'text') return
    const over = data.preset.overrides as Partial<TextNode> | undefined
    const family = over?.fontFamily ?? DEFAULT_FONT_FAMILY
    void runtime.ensureFonts(fontLoadSpecs(family, over?.fontSize ?? 48))
    if (data.edit) state.startEditing(id)
  }

  const onDragStart = (event: DragStartEvent) => {
    if (isLibraryDrag(event.active.data.current)) setDragging(event.active.data.current)
  }

  const onDragEnd = (event: DragEndEvent) => {
    setDragging(null)
    const data = event.active.data.current
    if (!isLibraryDrag(data) || event.over?.id !== CANVAS_DROP_ID) return
    const pointer = clientPoint(event)
    const { stage, scale } = geometry.current
    if (!pointer || !stage || scale <= 0) return
    const rect = stage.getBoundingClientRect()
    place(data, { x: (pointer.x - rect.left) / scale, y: (pointer.y - rect.top) / scale })
  }

  return (
    <GeometryContext.Provider value={geometry}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={onDragStart}
        onDragCancel={() => setDragging(null)}
        onDragEnd={onDragEnd}
      >
        {children}
        <DragOverlay dropAnimation={null}>{dragging && <DragPreviewCard data={dragging} />}</DragOverlay>
      </DndContext>
    </GeometryContext.Provider>
  )
}

/** The product stage. A library drag lands where the pointer is released. */
export function CanvasDropTarget({
  stageRef,
  scale,
  className,
  children,
}: {
  stageRef: MutableRefObject<HTMLDivElement | null>
  scale: number
  className?: string
  children: ReactNode
}) {
  const geometry = useContext(GeometryContext)
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_DROP_ID })

  useLayoutEffect(() => {
    if (!geometry) return
    geometry.current = { stage: stageRef.current, scale }
    return () => {
      geometry.current = { stage: null, scale: 1 }
    }
  }, [geometry, scale, stageRef])

  return (
    <div
      ref={(node) => {
        stageRef.current = node
        setNodeRef(node)
      }}
      className={cn(className, isOver && 'rounded-md ring-2 ring-primary/70')}
    >
      {children}
    </div>
  )
}
