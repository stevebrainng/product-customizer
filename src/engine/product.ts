import type { Rect, ProductSpec, SideConfig, SideId, Size, Variant } from './types'
import { createId } from './nodes'
import { IMAGE_ACCEPT, pickFiles } from './files'

const MAX_WORLD = 600

/** Image + tint flag + print area for a side, falling back to the front photo. */
export function resolveSide(product: ProductSpec, side: SideId): SideConfig & { image: string | null } {
  const cfg = product.sides[side]
  if (cfg.image) return cfg
  const front = product.sides.front
  return { ...cfg, image: front.image, tintable: front.tintable }
}

export const defaultVariant = (p: ProductSpec): Variant => ({
  colorId: p.colors[0]?.id ?? null,
  size: p.sizes[0] ?? null,
})

export function worldFor(width: number, height: number): Size {
  const k = MAX_WORLD / Math.max(width, height, 1)
  return { width: Math.round(width * k), height: Math.round(height * k) }
}

export function defaultPrintArea(world: Size): Rect {
  const w = Math.round(world.width * 0.42)
  return { x: Math.round((world.width - w) / 2), y: Math.round(world.height * 0.26), width: w, height: w }
}

const readDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

/** More than 2% of pixels not fully opaque => the photo has a cut-out background we can tint. */
function hasTransparency(img: HTMLImageElement) {
  try {
    const k = Math.min(1, 128 / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.max(1, Math.round(img.naturalWidth * k))
    const h = Math.max(1, Math.round(img.naturalHeight * k))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    ctx.drawImage(img, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data
    let clear = 0
    for (let i = 3; i < data.length; i += 4) if (data[i] < 250) clear++
    return clear / (w * h) > 0.02
  } catch {
    return false
  }
}

export interface ProductImage { src: string; width: number; height: number; tintable: boolean }

export async function readProductImage(file: File): Promise<ProductImage> {
  const src = await readDataUrl(file)
  const img = await loadImage(src)
  return {
    src,
    width: img.naturalWidth || MAX_WORLD,
    height: img.naturalHeight || MAX_WORLD,
    tintable: file.type === 'image/svg+xml' || hasTransparency(img),
  }
}

export const pickProductImage = async (): Promise<ProductImage | null> => {
  const [file] = await pickFiles({ accept: IMAGE_ACCEPT })
  return file ? readProductImage(file) : null
}

/** Builds a product from one uploaded photo. The back reuses the front until its own photo is added. */
export function createProductFromImage(name: string, image: ProductImage): ProductSpec {
  const world = worldFor(image.width, image.height)
  const printArea = defaultPrintArea(world)
  return {
    id: createId('product'),
    name,
    world,
    sides: {
      front: { image: image.src, tintable: image.tintable, printArea },
      back: { image: null, tintable: image.tintable, printArea: { ...printArea } },
    },
    colors: [{ id: createId('color'), name: 'Original', hex: '#ffffff' }],
    sizes: ['S', 'M', 'L', 'XL'],
  }
}

export const clampRect = (r: Rect, world: Size): Rect => {
  const width = Math.min(Math.max(20, r.width), world.width)
  const height = Math.min(Math.max(20, r.height), world.height)
  return {
    width,
    height,
    x: Math.min(Math.max(0, r.x), world.width - width),
    y: Math.min(Math.max(0, r.y), world.height - height),
  }
}
