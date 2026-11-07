import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { formatMoney, listCartLines, loadPreview, totalQuantity } from '@/customizer'
import type { DesignStyle } from '@/customizer'
import { HOODIE_PRODUCT, colorway } from './catalog'
import { orderFromLine, qtySearch, readShopOrder, type ShopOrder } from './order'
import { ShopHeader } from './ShopHeader'

const COUNTRIES = ['Switzerland', 'Germany', 'France', 'Austria', 'United Arab Emirates', 'United States']

interface Delivery {
  email: string
  firstName: string
  lastName: string
  company: string
  country: string
  city: string
  street: string
  apt: string
  phone: string
}

const EMPTY: Delivery = {
  email: '',
  firstName: '',
  lastName: '',
  company: '',
  country: 'Switzerland',
  city: '',
  street: '',
  apt: '',
  phone: '',
}

function sizeSummary(quantities: Record<string, number>) {
  return Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([size, qty]) => `${size} ${qty}`)
    .join(' · ')
}

export function CheckoutPage() {
  const [order, setOrder] = useState<ShopOrder | null>(null)
  const [ready, setReady] = useState(false)
  const [delivery, setDelivery] = useState<Delivery>(EMPTY)
  const [error, setError] = useState('')
  const [redeemed, setRedeemed] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewMissing, setPreviewMissing] = useState(false)

  useEffect(() => {
    const stored = readShopOrder()
    if (stored && totalQuantity({ style: 'printed', colorId: stored.colorId, quantities: stored.quantities, note: stored.note }) > 0) {
      setOrder(stored)
      setReady(true)
      return
    }
    void listCartLines().then((lines) => {
      const line = [...lines].reverse().find((item) => item.quote.quantity > 0 && item.productId === HOODIE_PRODUCT.id)
      setOrder(line ? orderFromLine(line) : null)
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!order?.customized || !order.customizationId) {
      setPreviewUrl(null)
      setPreviewMissing(false)
      return
    }
    let url = ''
    let cancelled = false
    setPreviewMissing(false)
    void loadPreview(order.customizationId).then((blob) => {
      if (cancelled) return
      if (!blob) {
        setPreviewMissing(true)
        return
      }
      const next = URL.createObjectURL(blob)
      if (cancelled) {
        URL.revokeObjectURL(next)
        return
      }
      url = next
      setPreviewUrl(next)
    })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [order?.customized, order?.customizationId])

  const summary = useMemo(() => {
    if (!order) return null
    const qty = Object.values(order.quantities).reduce((sum, n) => sum + n, 0)
    const surcharge = order.customized && order.style ? HOODIE_PRODUCT.styleSurcharges[order.style] : 0
    const merchandise = (HOODIE_PRODUCT.unitPrice + surcharge) * qty
    const discount = redeemed ? merchandise * 0.2 : 0
    return {
      qty,
      surcharge,
      merchandise,
      discount,
      shipping: HOODIE_PRODUCT.shipping,
      total: merchandise - discount + HOODIE_PRODUCT.shipping,
      color: colorway(HOODIE_PRODUCT, order.colorId),
    }
  }, [order, redeemed])

  const set = (key: keyof Delivery) => (event: { currentTarget: { value: string } }) => {
    const value = event.currentTarget.value
    setDelivery((d) => ({ ...d, [key]: value }))
  }

  const place = () => {
    if (!order || !summary || summary.qty < 1) {
      setError('Choose a quantity on the product page before checkout.')
      return
    }
    if (!delivery.email.includes('@') || !delivery.firstName.trim() || !delivery.lastName.trim() || !delivery.city.trim() || !delivery.street.trim()) {
      setError('Add your email, name, city, and street to place the order.')
      return
    }
    setError('')
    setPlaced(true)
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f3f4f6] text-zinc-950">
      <ShopHeader variant="checkout" cartCount={summary?.qty ?? 0} />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <div className="space-y-4">
          <div className="rounded-xl bg-emerald-700 px-4 py-3 text-sm text-white">
            Get EUR 3 cashback on this order!
          </div>

          {placed && order && summary ? (
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-semibold">Order placed</h1>
              <p className="mt-2 text-sm text-zinc-600">
                {summary.qty} × {HOODIE_PRODUCT.name} in {summary.color.name}
                {order.customized ? `, ${styleLabel(order.style)}` : ', no custom design'}
                . A confirmation would go to {delivery.email}.
              </p>
              <Link to="/" className="mt-5 inline-flex h-11 items-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white">
                Back to product
              </Link>
            </section>
          ) : (
            <>
              <section className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-center text-[11px] font-semibold tracking-[0.14em] text-zinc-400">EXPRESS CHECKOUT</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={place} className="h-11 rounded-lg border border-zinc-300 bg-white text-sm font-medium">
                    Check out with Apple Pay
                  </button>
                  <button type="button" onClick={place} className="h-11 rounded-lg bg-zinc-950 text-sm font-medium text-white">
                    Checkout with Google Pay
                  </button>
                </div>
                <p className="mt-3 text-center text-xs text-zinc-400">OR</p>
              </section>

              <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                <h1 className="text-lg font-semibold">1 Delivery information</h1>
                <div className="mt-4 grid gap-3">
                  <Field label="Email address" value={delivery.email} onChange={set('email')} type="email" autoComplete="email" />
                  <p className="text-sm text-zinc-500">Already have an account? Continue as a guest — designs stay on this browser.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="First name" value={delivery.firstName} onChange={set('firstName')} autoComplete="given-name" />
                    <Field label="Last name" value={delivery.lastName} onChange={set('lastName')} autoComplete="family-name" />
                  </div>
                  <Field label="Company name (if applicable)" value={delivery.company} onChange={set('company')} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm">
                      <span className="text-zinc-600">Country</span>
                      <select
                        value={delivery.country}
                        onChange={set('country')}
                        className="h-11 rounded-lg border border-zinc-200 bg-white px-3 outline-none focus-visible:border-zinc-900"
                      >
                        {COUNTRIES.map((country) => (
                          <option key={country}>{country}</option>
                        ))}
                      </select>
                    </label>
                    <Field label="Town / city" value={delivery.city} onChange={set('city')} autoComplete="address-level2" />
                  </div>
                  <Field label="Street / area / community" value={delivery.street} onChange={set('street')} autoComplete="address-line1" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Apt / villa / office no." value={delivery.apt} onChange={set('apt')} />
                    <Field label="Phone" value={delivery.phone} onChange={set('phone')} type="tel" autoComplete="tel" />
                  </div>
                  {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
                  <button type="button" onClick={place} className="mt-2 h-12 rounded-lg bg-zinc-950 text-sm font-semibold text-white hover:bg-zinc-800">
                    Place order
                  </button>
                </div>
              </section>
            </>
          )}
        </div>

        <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Order summary</h2>
            <Link to="/" className="text-sm text-zinc-500 underline-offset-2 hover:underline">Edit cart</Link>
          </div>
          {!ready && <p className="mt-6 text-sm text-zinc-500">Loading your order…</p>}
          {ready && !summary && (
            <div className="mt-6 space-y-3 text-sm text-zinc-600">
              <p>Nothing to check out yet. Pick a color and at least one size.</p>
              <Link to="/" className="inline-flex h-10 items-center rounded-lg bg-zinc-950 px-3 text-sm font-semibold text-white">
                Go to product
              </Link>
            </div>
          )}
          {summary && order && (
            <>
              <div className="mt-5 flex gap-3 border-b border-zinc-100 pb-5">
                <OrderThumb
                  customized={order.customized}
                  previewUrl={previewUrl}
                  missing={previewMissing}
                  fallback={summary.color.front}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{HOODIE_PRODUCT.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {summary.color.name}
                    {order.customized ? ` · ${styleLabel(order.style)}` : ' · No custom design'}
                    {sizeSummary(order.quantities) ? ` · ${sizeSummary(order.quantities)}` : ''}
                  </p>
                  {order.note && <p className="mt-1 text-sm text-zinc-500">Note: {order.note}</p>}
                </div>
                <p className="text-sm font-semibold">{formatMoney(summary.merchandise, HOODIE_PRODUCT.currency)}</p>
              </div>
              <button
                type="button"
                onClick={() => setRedeemed((v) => !v)}
                className="mt-4 flex w-full items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-left text-sm text-emerald-800"
              >
                <span>{redeemed ? 'Extra 20% discount applied' : 'Extra 20% discount'}</span>
                <span className="font-semibold">{redeemed ? 'Remove' : 'Redeem'}</span>
              </button>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{formatMoney(summary.merchandise - summary.discount, HOODIE_PRODUCT.currency)}</dd>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <dt>Shipping</dt>
                  <dd>{formatMoney(summary.shipping, HOODIE_PRODUCT.currency)}</dd>
                </div>
                <div className="flex justify-between pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{formatMoney(summary.total, HOODIE_PRODUCT.currency)}</dd>
                </div>
              </dl>
              {!order.customized && (
                <Link
                  to="/customize"
                  search={{ color: order.colorId, qty: qtySearch(order.quantities) }}
                  className="mt-4 inline-block text-sm text-zinc-500 underline-offset-2 hover:underline"
                >
                  Add a design instead
                </Link>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  )
}

function OrderThumb({
  customized,
  previewUrl,
  missing,
  fallback,
}: {
  customized: boolean
  previewUrl: string | null
  missing: boolean
  fallback: string
}) {
  const src = customized && !missing ? previewUrl : fallback
  if (!src) {
    return <div className="size-24 shrink-0 animate-pulse rounded-lg bg-zinc-100" aria-hidden />
  }
  return <img src={src} alt="" className="size-24 shrink-0 rounded-lg bg-zinc-100 object-contain" />
}

function styleLabel(style: DesignStyle | null) {
  if (style === 'embroidered') return 'Embroidered'
  if (style === 'printed') return 'Printed'
  return 'Custom'
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
}: {
  label: string
  value: string
  onChange: (event: { currentTarget: { value: string } }) => void
  type?: string
  autoComplete?: string
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-zinc-600">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={onChange}
        className="h-11 rounded-lg border border-zinc-200 px-3 outline-none focus-visible:border-zinc-900"
      />
    </label>
  )
}
