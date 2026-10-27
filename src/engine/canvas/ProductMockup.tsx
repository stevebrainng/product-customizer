import type { SideId } from '../types'
import { resolveSide } from '../product'
import { selectProduct } from '../store/editorStore'
import { useEditor } from '../provider/EditorProvider'

/**
 * Renders the product photo from config. A colour tint is a multiply layer masked by the
 * photo's own alpha, so it only works on photos with a transparent background.
 */
export function ProductMockup({ side }: { side: SideId }) {
  const product = useEditor(selectProduct)
  const colorId = useEditor((s) => s.variant.colorId)
  const { image, tintable } = resolveSide(product, side)
  const color = product.colors.find((c) => c.id === colorId)
  if (!image) return null

  const tint = tintable && color && color.hex.toLowerCase() !== '#ffffff'
  const mask = `url("${image}")`
  return (
    <div className="relative size-full">
      <img src={image} alt="" draggable={false} className="size-full select-none object-contain" />
      {tint && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: color.hex,
            mixBlendMode: 'multiply',
            WebkitMaskImage: mask, maskImage: mask,
            WebkitMaskSize: 'contain', maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center', maskPosition: 'center',
          }}
        />
      )}
    </div>
  )
}
