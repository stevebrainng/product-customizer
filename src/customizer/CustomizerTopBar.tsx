import { Link } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/ui/Button'
import { cn } from '@/lib/utils'
import { useCustomizer } from './CustomizerProvider'
import { formatMoney, quote } from './quote'
import type { CheckoutProduct } from './types'

export function CustomizerTopBar({
  product,
  onSave,
  onAddToCart,
  onCheckout,
  busy,
}: {
  product: CheckoutProduct
  onSave: () => void
  onAddToCart: () => void
  onCheckout: () => void
  busy?: boolean
}) {
  const selection = useCustomizer((s) => s.selection)
  const cartCount = useCustomizer((s) => s.cartCount)
  const saving = useCustomizer((s) => s.saving)
  const q = quote(product, selection)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Link to="/" activeOptions={{ exact: true }} className="truncate text-[15px] font-semibold tracking-tight text-ink">
          OnlineStore
        </Link>
        <Button type="button" size="sm" variant="outline" disabled={busy || saving} onClick={onSave}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <p className="mx-auto hidden min-w-0 truncate text-center text-[13px] font-medium text-muted-foreground md:block">
        Get EXTRA 20% OFF on Checkout
      </p>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span className="hidden text-[14px] font-semibold tabular-nums sm:inline">
          {formatMoney(q.lineTotal, product.currency)}
        </span>
        <Button type="button" variant="outline" disabled={busy || q.quantity < 1} onClick={onAddToCart}>
          Add to cart
        </Button>
        <Button
          type="button"
          variant="default"
          disabled={busy || q.quantity < 1}
          onClick={onCheckout}
          className={cn('bg-emerald-600 text-white hover:bg-emerald-600/90')}
        >
          <ShoppingCart data-icon="inline-start" />
          Checkout
          {cartCount > 0 && (
            <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[11px] font-semibold">
              {cartCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  )
}
