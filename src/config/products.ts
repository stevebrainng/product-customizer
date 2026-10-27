import type { ProductSpec } from '@/engine'
import { svgDataUrl, tshirtSvg } from './tshirtSvg'

const printArea = { x: 137, y: 110, width: 233, height: 233 }

/**
 * Products are data: world size, a photo + print area per side, colours, sizes.
 * Users create more at runtime from uploaded photos (ProductPanel); this is just the seed.
 */
export const TSHIRT: ProductSpec = {
  id: 'tshirt',
  name: 'T-shirt',
  world: { width: 507, height: 580 },
  sides: {
    front: { image: svgDataUrl(tshirtSvg('front')), tintable: true, printArea },
    back: { image: svgDataUrl(tshirtSvg('back')), tintable: true, printArea: { ...printArea } },
  },
  colors: [
    { id: 'white', name: 'White', hex: '#ffffff' },
    { id: 'black', name: 'Black', hex: '#1f1f23' },
    { id: 'navy', name: 'Navy', hex: '#1e2a5a' },
    { id: 'red', name: 'Red', hex: '#c0392b' },
    { id: 'forest', name: 'Forest', hex: '#2f5d3a' },
    { id: 'heather', name: 'Heather', hex: '#9aa0a6' },
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
}

export const DEFAULT_PRODUCTS: ProductSpec[] = [TSHIRT]
export const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
