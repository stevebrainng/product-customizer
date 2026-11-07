import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Check, ChevronDown, ShoppingCart, Star } from 'lucide-react'
import { formatMoney, totalQuantity } from '@/customizer'
import type { CheckoutSelection } from '@/customizer'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { SizeQuantities } from '@/ui/SizeQuantities'
import { HOODIE_PRODUCT, colorway } from './catalog'
import { qtySearch, readShopOrder, saveShopOrder, selectionFromOrder } from './order'
import { ShopHeader } from './ShopHeader'

const HIGHLIGHTS = [
  'Make a statement with our custom oversize fleece hoodies, ready to print or embroider.',
  'Sized from XS to 3XL with no minimums, for one-offs, teams, and brand drops.',
  'Plush inside, durable outside — built for a personal mark or a logo on the chest.',
]

export function ProductPage() {
  const navigate = useNavigate()
  const stored = useMemo(() => selectionFromOrder(readShopOrder()), [])
  const [selection, setSelection] = useState<CheckoutSelection>(stored)
  const [side, setSide] = useState<'front' | 'back'>('front')
  const [qtyError, setQtyError] = useState(false)

  const color = colorway(HOODIE_PRODUCT, selection.colorId)
  const photos = [
    { id: 'front' as const, src: color.front, label: 'Front' },
    { id: 'back' as const, src: color.back, label: 'Back' },
  ]
  const activePhoto = photos.find((p) => p.id === side) ?? photos[0]
  const qty = totalQuantity(selection)
  const saveSelection = (customized: boolean) => {
    saveShopOrder({
      productId: HOODIE_PRODUCT.id,
      colorId: color.id,
      quantities: selection.quantities,
      note: selection.note,
      customized,
      style: customized ? selection.style : null,
      customizationId: customized ? readShopOrder()?.customizationId : undefined,
    })
  }

  const customize = () => {
    saveSelection(false)
    void navigate({
      to: '/customize',
      search: { color: color.id, qty: qtySearch(selection.quantities) },
    })
  }

  const checkout = () => {
    if (qty < 1) {
      setQtyError(true)
      return
    }
    saveShopOrder({
      productId: HOODIE_PRODUCT.id,
      colorId: color.id,
      quantities: selection.quantities,
      note: '',
      customized: false,
      style: null,
    })
    void navigate({ to: '/checkout' })
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f3f4f6] text-zinc-950">
      <ShopHeader variant="store" onCustomize={customize} />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:px-6">
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <p className="mb-4 text-sm text-zinc-500">All Merchandise / Hoodies & Jackets /</p>
          <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
            <div className="flex flex-col gap-2">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  aria-label={photo.label}
                  aria-pressed={side === photo.id}
                  onClick={() => setSide(photo.id)}
                  className={cn(
                    'overflow-hidden rounded-lg border bg-[#f6f6f6]',
                    side === photo.id ? 'border-zinc-950' : 'border-transparent',
                  )}
                >
                  <img src={photo.src} alt="" className="aspect-square w-full object-contain" />
                </button>
              ))}
            </div>
            <div className="relative grid min-h-[420px] place-items-center rounded-xl bg-[#f6f6f6]">
              <span className="absolute top-4 left-4 rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold tracking-wide text-white">
                BEST SELLER
              </span>
              <img src={activePhoto.src} alt={`${HOODIE_PRODUCT.name}, ${color.name}, ${activePhoto.label}`} className="max-h-[560px] w-full object-contain" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
          <h1 className="text-3xl font-semibold tracking-tight">{HOODIE_PRODUCT.name}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
            <span className="inline-flex text-amber-500" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-3.5 fill-current" />
              ))}
            </span>
            2k+ reviews
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold text-emerald-700">{formatMoney(HOODIE_PRODUCT.unitPrice, HOODIE_PRODUCT.currency)}</span>
            {HOODIE_PRODUCT.compareAtPrice && (
              <span className="text-lg text-zinc-400 line-through">{formatMoney(HOODIE_PRODUCT.compareAtPrice, HOODIE_PRODUCT.currency)}</span>
            )}
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">20% OFF</span>
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Color</span>
              <span className="text-zinc-500">{color.name}</span>
            </div>
            <div className="flex gap-2" role="radiogroup" aria-label="Color">
              {HOODIE_PRODUCT.colorways.map((swatch) => {
                const active = swatch.id === color.id
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={swatch.name}
                    title={swatch.name}
                    onClick={() => {
                      setSelection((s) => ({ ...s, colorId: swatch.id }))
                      setSide('front')
                    }}
                    className={cn(
                      'size-[18px] rounded-full border border-black/20',
                      active && 'ring-2 ring-[#c6ef2e] ring-offset-2',
                    )}
                    style={{ backgroundColor: swatch.hex }}
                  />
                )
              })}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Size</span>
              <span className="text-zinc-500">XS – 3XL</span>
            </div>
            <SizeQuantities
              sizes={HOODIE_PRODUCT.spec.sizes}
              quantities={selection.quantities}
              onChange={(size, n) => {
                setQtyError(false)
                setSelection((s) => ({ ...s, quantities: { ...s.quantities, [size]: n } }))
              }}
              action={
                <button
                  type="button"
                  onClick={checkout}
                  className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-[#d6ff3f] text-sm font-semibold text-zinc-950 hover:bg-[#c6ef2e]"
                >
                  <ShoppingCart className="size-4" />
                  Add to cart
                </button>
              }
            />
            {qtyError && (
              <p className="mt-2 text-sm text-red-600" role="alert">Select a quantity before checking out without a design.</p>
            )}
          </div>

          <button type="button" onClick={customize} className="mt-3 h-11 w-full rounded-lg border border-zinc-950 text-sm font-semibold tracking-wide hover:bg-zinc-50">
            Customize now
          </button>
          <p className="mt-2 text-xs text-zinc-500">
            Add to cart orders the blank {color.name.toLowerCase()} hoodie. Customize if you want a print or embroidery.
          </p>

          <ul className="mt-6 space-y-2 text-sm text-zinc-700">
            {HIGHLIGHTS.map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200">
            <Accordion title="Description">
              Heavyweight oversized pullover with a kangaroo pocket, rib cuffs, and a roomy hood. Upload artwork in the customizer or order it plain.
            </Accordion>
            <Accordion title="Specifications">
              Fleece, unisex oversized fit. Printed and embroidered decoration are priced in the customizer. White and black are photographed colorways.
            </Accordion>
            <Accordion title="Size chart">
              XS through 3XL. Choose a quantity for each size you need — there is no order minimum.
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  )
}

function Accordion({ title, children }: { title: string; children: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-3 text-left text-sm font-medium">
        {title}
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-3 text-sm text-zinc-600">{children}</CollapsibleContent>
    </Collapsible>
  )
}
