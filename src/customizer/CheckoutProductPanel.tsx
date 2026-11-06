import { useState } from 'react'
import { ChevronDown, Droplets, HelpCircle } from 'lucide-react'
import { selectProduct, useEditor, useEditorStore } from '@/engine'
import { Button } from '@/ui/Button'
import { PanelSection } from '@/ui/PanelSection'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { applyColorway } from '@/shop/catalog'
import { SizeQuantities } from '@/ui/SizeQuantities'
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
  const store = useEditorStore()
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
        <div className="flex flex-wrap gap-1.5">
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
                  const id = applyColorway(store.getState(), product, c.id)
                  setSelection({ colorId: id })
                }}
                className={cn(
                  'size-[18px] rounded-full border border-black/20 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-primary/40',
                  active && 'ring-2 ring-[#c6ef2e] ring-offset-2 ring-offset-canvas',
                )}
                style={{ backgroundColor: c.hex }}
              />
            )
          })}
        </div>
      </PanelSection>

      <PanelSection title="Quantity">
        <SizeQuantities
          layout="compact"
          sizes={sizes}
          quantities={selection.quantities}
          onChange={(size, n) => setQuantity(size, n)}
        />
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
