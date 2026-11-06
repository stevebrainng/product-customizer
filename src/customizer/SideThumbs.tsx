import type { SideId } from '@/engine'
import { resolveSide, selectProduct, useEditor } from '@/engine'
import { cn } from '@/lib/utils'

const SIDES: { id: SideId; label: string }[] = [
  { id: 'front', label: 'Front Side' },
  { id: 'back', label: 'Back Side' },
]

export function SideThumbs() {
  const product = useEditor(selectProduct)
  const active = useEditor((s) => s.activeSide)
  const setSide = useEditor((s) => s.setActiveSide)
  const colorId = useEditor((s) => s.variant.colorId)
  if (!product) return null

  const color = product.colors.find((c) => c.id === colorId)

  return (
    <aside
      aria-label="Product side"
      className={cn(
        'pointer-events-auto absolute z-10 flex gap-2',
        'right-3 bottom-16 max-md:left-3 max-md:right-auto max-md:flex-row',
        'md:top-1/2 md:right-4 md:bottom-auto md:-translate-y-1/2 md:flex-col',
      )}
    >
      {SIDES.map((side) => {
        const cfg = resolveSide(product, side.id)
        const selected = active === side.id
        const tint = cfg.tintable && color && color.hex.toLowerCase() !== '#ffffff'
        return (
          <button
            key={side.id}
            type="button"
            aria-pressed={selected}
            onClick={() => setSide(side.id)}
            className={cn(
              'w-[88px] overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-shadow',
              selected ? 'border-zinc-950 ring-2 ring-zinc-950' : 'border-line hover:border-zinc-400',
            )}
          >
            <div className="relative aspect-square bg-muted/40 p-1.5">
              {cfg.image ? (
                <>
                  <img src={cfg.image} alt="" className="size-full object-contain" draggable={false} />
                  {tint && (
                    <div
                      className="absolute inset-1.5"
                      style={{
                        backgroundColor: color.hex,
                        mixBlendMode: 'multiply',
                        WebkitMaskImage: `url("${cfg.image}")`,
                        maskImage: `url("${cfg.image}")`,
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="grid size-full place-items-center text-[11px] text-muted-foreground">No photo</div>
              )}
            </div>
            <div className="border-t border-line px-2 py-1.5 text-center text-[11px] font-medium text-ink">
              {side.label}
            </div>
          </button>
        )
      })}
    </aside>
  )
}
