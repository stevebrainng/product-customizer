import { TSHIRT } from '@/config/products'
import type { CheckoutProduct } from './types'

const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'] as const

/** Demo SKU for `/customize` — commerce wrapper around the tintable t-shirt mockup. */
export const DEMO_CHECKOUT_PRODUCT: CheckoutProduct = {
  id: 'vintage-acid-wash',
  name: 'Vintage Acid Wash T-Shirt',
  currency: 'AED',
  unitPrice: 19,
  styleSurcharges: {
    printed: 0,
    embroidered: 8,
  },
  spec: {
    ...TSHIRT,
    id: 'vintage-acid-wash',
    name: 'Vintage Acid Wash T-Shirt',
    sizes: [...sizes],
    colors: [
      { id: 'brown', name: 'Acid Wash Brown', hex: '#6b4f3a' },
      { id: 'black', name: 'Black', hex: '#1f1f23' },
      { id: 'white', name: 'White', hex: '#ffffff' },
      { id: 'navy', name: 'Navy', hex: '#1e2a5a' },
    ],
  },
}

export function emptyQuantities(product: CheckoutProduct): Record<string, number> {
  return Object.fromEntries(product.spec.sizes.map((s) => [s, 0]))
}

export function defaultSelection(product: CheckoutProduct) {
  const quantities = emptyQuantities(product)
  // Match the screenshot demo: one L and one XL.
  if ('L' in quantities) quantities.L = 1
  if ('XL' in quantities) quantities.XL = 1
  return {
    style: 'printed' as const,
    colorId: product.spec.colors[0]?.id ?? null,
    quantities,
    note: '',
  }
}
