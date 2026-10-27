import { useRef } from 'react'
import { Upload } from 'lucide-react'
import {
  EditorStage,
  createProductFromImage,
  pickProductImage,
  resolveScale,
  selectProduct,
  useCanvasZoom,
  useEditor,
  useElementSize,
  type SideId,
} from '@/engine'
import { Button } from '@/ui/Button'
import { EmptyState } from '@/ui/EmptyState'
import { Segmented } from '@/ui/Segmented'
import { CanvasDropTarget } from '@/dnd/CanvasDnd'
import { ImageToolbar } from './ImageToolbar'
import { ShapeToolbar } from './ShapeToolbar'
import { TextToolbar } from './TextToolbar'

const SIDES: { value: SideId; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
]

export function CanvasStage() {
  const product = useEditor(selectProduct)
  const side = useEditor((s) => s.activeSide)
  const setSide = useEditor((s) => s.setActiveSide)
  const zoom = useEditor((s) => s.zoom)
  const addProduct = useEditor((s) => s.addProduct)
  const productCount = useEditor((s) => Object.keys(s.products).length)

  const scrollerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const viewport = useElementSize(scrollerRef)
  const scale = product ? resolveScale(zoom, product.world, viewport) : 1
  useCanvasZoom(scrollerRef, stageRef, scale)

  const upload = async () => {
    const img = await pickProductImage()
    if (img) addProduct(createProductFromImage(`Product ${productCount + 1}`, img))
  }

  if (!product) {
    return (
      <main className="relative min-w-0 flex-1 overflow-hidden bg-muted">
        <div className="absolute inset-0 grid place-items-center p-6">
          <EmptyState title="Upload a product photo to start customizing">
            <Button onClick={upload}>
              <Upload data-icon="inline-start" />
              Upload product
            </Button>
          </EmptyState>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-w-0 flex-1 overflow-hidden bg-muted">
      <div ref={scrollerRef} className="absolute inset-0 flex overflow-auto px-3 pt-3 pb-36 sm:px-6 sm:pt-6 md:pb-[76px]">
        <CanvasDropTarget stageRef={stageRef} scale={scale} className="m-auto shrink-0">
          <EditorStage scale={scale} />
        </CanvasDropTarget>
      </div>
      <TextToolbar />
      <ImageToolbar />
      <ShapeToolbar />
      <Segmented
        label="Product side"
        options={SIDES}
        value={side}
        onChange={setSide}
        className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 lg:bottom-4"
      />
    </main>
  )
}
