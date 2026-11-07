import { Link } from '@tanstack/react-router'
import { ShoppingBag, User } from 'lucide-react'

const NAV = ['Best Sellers', 'New Arrivals', 'T-shirts', 'Hoodies', 'Uniforms', 'Jerseys', 'Caps']

export function ShopHeader({
  variant,
  onCustomize,
  cartCount = 0,
}: {
  variant: 'store' | 'checkout'
  onCustomize?: () => void
  cartCount?: number
}) {
  if (variant === 'checkout') {
    return (
      <header className="bg-zinc-950 text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/" activeOptions={{ exact: true }} className="font-serif text-2xl tracking-tight">OnlineStore</Link>
          <p className="mx-auto hidden items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs md:flex">
            <span className="rounded-full bg-white/10 px-2 py-0.5">50% PRICE DROP</span>
            Extra 20% OFF
          </p>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden rounded-full border border-white/20 px-3 py-1 sm:inline">English</span>
            <span className="rounded-full border border-white/20 px-3 py-1">EUR</span>
            <Link to="/checkout" className="relative grid size-9 place-items-center rounded-full hover:bg-white/10" aria-label="Cart">
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-semibold text-zinc-950">
                  {cartCount}
                </span>
              )}
            </Link>
            <span className="grid size-9 place-items-center" aria-hidden>
              <User className="size-5" />
            </span>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" activeOptions={{ exact: true }} className="font-serif text-2xl tracking-tight">OnlineStore</Link>
        <nav className="hidden min-w-0 flex-1 items-center gap-4 overflow-x-auto text-sm text-zinc-600 lg:flex">
          {NAV.map((item) => (
            <Link key={item} to="/" activeOptions={{ exact: true }} className="shrink-0 hover:text-zinc-950">{item}</Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={onCustomize}
          className="ml-auto h-10 rounded-full bg-zinc-950 px-4 text-xs font-semibold tracking-wide text-white"
        >
          CUSTOMIZE NOW
        </button>
      </div>
    </header>
  )
}
