import type { EditorState } from '@/engine/store/editorStore'
import type { CheckoutProduct, CheckoutSelection, ProductColorway } from '@/customizer/types'

/**
 * Front photos are 406×540. World keeps that aspect, capped at 600px tall,
 * and the print area sits on the chest above the pocket.
 */
const world = { width: 451, height: 600 }
const printArea = { x: 145, y: 175, width: 162, height: 140 }

export const HOODIE_PRODUCT: CheckoutProduct = {
  id: 'oversized-pullover-hoodie',
  name: 'Oversized Pullover Hoodie',
  currency: 'EUR',
  unitPrice: 14,
  compareAtPrice: 28,
  shipping: 9,
  styleSurcharges: { printed: 0, embroidered: 8 },
  colorways: [
    {
      id: 'white',
      name: 'White',
      hex: '#ffffff',
      front: '/products/hoodie-white-front.png',
      back: '/products/hoodie-white-back.png',
    },
    {
      id: 'black',
      name: 'Black',
      hex: '#1a1a1a',
      front: '/products/hoodie-black-front.png',
      back: '/products/hoodie-black-back.png',
    },
  ],
  spec: {
    id: 'oversized-pullover-hoodie',
    name: 'Oversized Pullover Hoodie',
    world,
    sides: {
      front: { image: '/products/hoodie-white-front.png', tintable: false, printArea },
      back: { image: '/products/hoodie-white-back.png', tintable: false, printArea: { ...printArea } },
    },
    colors: [
      { id: 'white', name: 'White', hex: '#ffffff' },
      { id: 'black', name: 'Black', hex: '#1a1a1a' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  },
}

export function colorway(product: CheckoutProduct, colorId: string | null): ProductColorway {
  return product.colorways.find((c) => c.id === colorId) ?? product.colorways[0]
}

/** Copy of the catalog product whose mockup photos match the chosen color. */
export function withColorway(product: CheckoutProduct, colorId: string | null): CheckoutProduct {
  const color = colorway(product, colorId)
  return {
    ...product,
    spec: {
      ...product.spec,
      sides: {
        front: { ...product.spec.sides.front, image: color.front, tintable: false },
        back: { ...product.spec.sides.back, image: color.back, tintable: false },
      },
    },
  }
}

export function applyColorway(
  state: Pick<EditorState, 'setColor' | 'updateSide'>,
  product: CheckoutProduct,
  colorId: string | null,
) {
  const color = colorway(product, colorId)
  state.setColor(color.id)
  state.updateSide('front', { image: color.front, tintable: false })
  state.updateSide('back', { image: color.back, tintable: false })
  return color.id
}

export function emptyQuantities(product: CheckoutProduct): Record<string, number> {
  return Object.fromEntries(product.spec.sizes.map((size) => [size, 0]))
}

export function defaultSelection(product: CheckoutProduct): CheckoutSelection {
  return {
    style: 'printed',
    colorId: product.colorways[0]?.id ?? null,
    quantities: emptyQuantities(product),
    note: '',
  }
}

export function normalizeQuantities(product: CheckoutProduct, raw: Record<string, number> | undefined) {
  const quantities = emptyQuantities(product)
  for (const size of product.spec.sizes) {
    const n = raw?.[size]
    quantities[size] = Number.isFinite(n) ? Math.max(0, Math.floor(n as number)) : 0
  }
  return quantities
}
