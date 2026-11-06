import type { CheckoutSelection, CustomizationLine, DesignStyle } from '@/customizer/types'
import { HOODIE_PRODUCT, emptyQuantities, normalizeQuantities } from './catalog'

const ORDER_KEY = 'shop:order'

/** What the shop sends to checkout. A design is optional. */
export interface ShopOrder {
  productId: string
  colorId: string
  quantities: Record<string, number>
  note: string
  /** Set when the buyer went through the customizer. */
  customized: boolean
  style: DesignStyle | null
  customizationId?: string
}

export function readShopOrder(): ShopOrder | null {
  try {
    const raw = localStorage.getItem(ORDER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ShopOrder
    if (!parsed || parsed.productId !== HOODIE_PRODUCT.id) return null
    return {
      ...parsed,
      quantities: normalizeQuantities(HOODIE_PRODUCT, parsed.quantities),
      colorId: HOODIE_PRODUCT.colorways.some((c) => c.id === parsed.colorId)
        ? parsed.colorId
        : HOODIE_PRODUCT.colorways[0].id,
    }
  } catch {
    return null
  }
}

export function saveShopOrder(order: ShopOrder) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(order))
}

export function orderFromLine(line: CustomizationLine): ShopOrder {
  return {
    productId: line.productId,
    colorId: line.selection.colorId ?? HOODIE_PRODUCT.colorways[0].id,
    quantities: normalizeQuantities(HOODIE_PRODUCT, line.selection.quantities),
    note: line.selection.note,
    customized: true,
    style: line.selection.style,
    customizationId: line.customizationId,
  }
}

export function selectionFromOrder(order: ShopOrder | null): CheckoutSelection {
  return {
    style: order?.style ?? 'printed',
    colorId: order?.colorId ?? HOODIE_PRODUCT.colorways[0].id,
    quantities: order ? normalizeQuantities(HOODIE_PRODUCT, order.quantities) : emptyQuantities(HOODIE_PRODUCT),
    note: order?.note ?? '',
  }
}

/** `S:1,M:0` query from the product page. Missing sizes stay 0. */
export function quantitiesFromSearch(search = location.search): Record<string, number> | null {
  const raw = new URLSearchParams(search).get('qty')
  if (!raw) return null
  const quantities = emptyQuantities(HOODIE_PRODUCT)
  for (const part of raw.split(',')) {
    const [size, value] = part.split(':')
    if (size in quantities) quantities[size] = Math.max(0, Math.floor(Number(value) || 0))
  }
  return quantities
}

export function colorFromSearch(search = location.search): string | null {
  const color = new URLSearchParams(search).get('color')
  if (color && HOODIE_PRODUCT.colorways.some((c) => c.id === color)) return color
  return null
}

export function qtySearch(quantities: Record<string, number>): string {
  return Object.entries(quantities).map(([size, qty]) => `${size}:${qty}`).join(',')
}

export function go(path: string) {
  location.assign(path)
}
