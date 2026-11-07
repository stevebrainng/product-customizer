import { HOODIE_PRODUCT } from './catalog'

export interface CustomizeSearch {
  color?: string
  qty?: string
  draft?: string
}

export interface CheckoutSearch {
  draft?: string
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

export function validateCustomizeSearch(search: Record<string, unknown>): CustomizeSearch {
  const color = text(search.color)
  const qty = text(search.qty)
  const draft = text(search.draft)
  return {
    ...(color && HOODIE_PRODUCT.colorways.some((item) => item.id === color) ? { color } : {}),
    ...(qty ? { qty } : {}),
    ...(draft ? { draft } : {}),
  }
}

export function validateCheckoutSearch(search: Record<string, unknown>): CheckoutSearch {
  const draft = text(search.draft)
  return draft ? { draft } : {}
}
