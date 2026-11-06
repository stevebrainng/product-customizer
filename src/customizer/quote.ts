import type { CheckoutProduct, CheckoutSelection, Quote } from './types'

export function totalQuantity(selection: CheckoutSelection): number {
  return Object.values(selection.quantities).reduce((sum, n) => sum + (Number.isFinite(n) ? Math.max(0, n) : 0), 0)
}

/** Pure pricing: (unit price + style surcharge) × total quantity. */
export function quote(product: CheckoutProduct, selection: CheckoutSelection): Quote {
  const styleSurcharge = product.styleSurcharges[selection.style] ?? 0
  const quantity = totalQuantity(selection)
  const unit = product.unitPrice + styleSurcharge
  return {
    unitPrice: product.unitPrice,
    styleSurcharge,
    quantity,
    lineTotal: unit * quantity,
    currency: product.currency,
  }
}

export function formatMoney(amount: number, currency: string): string {
  const rounded = Math.round(amount * 100) / 100
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
  return `${currency} ${text}`
}
