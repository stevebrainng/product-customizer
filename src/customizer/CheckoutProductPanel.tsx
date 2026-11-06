import { useState } from 'react'
import { Check, ChevronDown, Droplets, HelpCircle } from 'lucide-react'
import { selectProduct, useEditor } from '@/engine'
import { Button } from '@/ui/Button'
import { PanelSection } from '@/ui/PanelSection'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { useCustomizer } from './CustomizerProvider'
import { formatMoney, quote, totalQuantity } from './quote'
import type { CheckoutProduct, DesignStyle } from './types'

/** Thread icon may not exist in older lucide — fall back if tree-shaken oddly. */
function StyleIcon({ style }: { style: DesignStyle }) {
  if (style === 'printed') return <Droplets className="size-5" strokeWidth={2} />
  // lucide has no Thread; use a simple circle mark for embroidery spool feel
  return (
    <span className="grid size-5 place-items-center rounded-full border-2 border-current text-[10px] font-bold leading-none">
      E
    </span>
  )
}

export function CheckoutProductPanel({
  product,
  onChangeProduct,
}: {
  product: CheckoutProduct
  onChangeProduct?: () => void
}) {
  const engineProduct = useEditor(selectProduct)
  const colorId = useEditor((s) => s.variant.colorId)
  const setColor = useEditor((s) => s.setColor)
  const selection = useCustomizer((s) => s.selection)
  const setSelection = useCustomizer((s) => s.setSelection)
  const setQuantity = useCustomizer((s) => s.setQuantity)
  const [formulaOpen, setFormulaOpen] = useState(false)

  const colors = engineProduct?.colors ?? product.spec.colors
  const sizes = product.spec.sizes
  const q = quote(product, selection)
  const qty = totalQuantity(selection)

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[16px] font-semibold leading-snug text-ink">{product.name}</h3>
          <span className="shrink-0 rounded-full bg-zinc-950 px-2.5 py-1 text-[12px] font-semibold text-white">
            {formatMoney(product.unitPrice, product.currency)}
          </span>
        </div>
        {onChangeProduct && (
          <Button type="button" className="w-full" onClick={onChangeProduct}>
            Change Product
          </Button>
        )}
      </header>

      <PanelSection title="Design Style">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: 'printed' as const, label: 'Printed', popular: true },
              { id: 'embroidered' as const, label: 'Embroidered', popular: false },
            ] as const
          ).map((opt) => {
            const active = selection.style === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelection({ style: opt.id })}
                className={cn(
                  'relative flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left transition-colors',
                  active ? 'border-zinc-950 bg-white shadow-sm' : 'border-line bg-white hover:bg-muted/60',
                )}
              >
                {opt.popular && (
                  <span className="absolute top-2 right-2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                    Popular
                  </span>
                )}
                <StyleIcon style={opt.id} />
                <span className="text-[13px] font-semibold">{opt.label}</span>
                {product.styleSurcharges[opt.id] > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    +{formatMoney(product.styleSurcharges[opt.id], product.currency)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <a
          href="#help-style"
          className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-ink"
          onClick={(e) => e.preventDefault()}
        >
          <HelpCircle className="size-3.5" /> Help me choose
        </a>
      </PanelSection>

      <PanelSection title="Product Color">
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => {
            const active = c.id === colorId
            return (
              <button
                key={c.id}
                type="button"
                title={c.name}
                aria-label={c.name}
                aria-pressed={active}
                onClick={() => {
                  setColor(c.id)
                  setSelection({ colorId: c.id })
                }}
                className={cn(
                  'relative size-8 rounded-full border border-black/15 outline-none transition-shadow',
                  'focus-visible:ring-2 focus-visible:ring-primary/50',
                  active && 'ring-2 ring-zinc-950 ring-offset-2 ring-offset-canvas',
                )}
                style={{ backgroundColor: c.hex }}
              >
                {active && (
                  <Check
                    className={cn(
                      'absolute inset-0 m-auto size-4',
                      c.hex.toLowerCase() === '#ffffff' || c.hex.toLowerCase() === '#fff'
                        ? 'text-zinc-900'
                        : 'text-white',
                    )}
                    strokeWidth={3}
                  />
                )}
              </button>
            )
          })}
        </div>
      </PanelSection>

      <PanelSection title="Quantity">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {sizes.map((size) => (
            <label
              key={size}
              className="flex items-center justify-between gap-2 rounded-xl border border-line bg-white px-2.5 py-2"
            >
              <span className="text-[13px] font-medium">{size}</span>
              <input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                aria-label={`Quantity ${size}`}
                className="h-8 w-14 rounded-lg border border-input bg-background px-2 text-center text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={selection.quantities[size] ?? 0}
                onChange={(e) => {
                  const n = e.currentTarget.valueAsNumber
                  setQuantity(size, Number.isFinite(n) ? n : 0)
                }}
              />
            </label>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Special Notes For Delivery">
        <Textarea
          value={selection.note}
          onChange={(e) => setSelection({ note: e.currentTarget.value })}
          placeholder="Optional instructions for your order"
          className="min-h-20"
        />
      </PanelSection>

      <Collapsible open={formulaOpen} onOpenChange={setFormulaOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-1 text-left text-[13px] text-muted-foreground hover:text-ink">
          <span>Price calculation formula</span>
          <ChevronDown className={cn('size-4 transition-transform', formulaOpen && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pb-2 text-[12px] text-muted-foreground">
          <p>
            ({formatMoney(product.unitPrice, product.currency)} +{' '}
            {formatMoney(q.styleSurcharge, product.currency)} style) × {qty} ={' '}
            <span className="font-semibold text-ink">{formatMoney(q.lineTotal, product.currency)}</span>
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
