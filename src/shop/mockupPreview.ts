import type { SideId } from '@/engine'
import { resolveSide, selectProduct, useEditorRuntime, useEditorStore } from '@/engine'

type Store = ReturnType<typeof useEditorStore>
type Runtime = ReturnType<typeof useEditorRuntime>

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load ${src}`))
    img.src = src
  })
}

function sameIds(found: string[], expected: string[]) {
  if (found.length !== expected.length) return false
  const set = new Set(found)
  return expected.every((id) => set.has(id))
}

/** Wait until the stage is showing this side's nodes, so the export is not the previous side. */
async function ensureSide(store: Store, runtime: Runtime, side: SideId) {
  const expected = store.getState().history.present.sides[side].map((node) => node.id)
  if (store.getState().activeSide !== side) store.getState().setActiveSide(side)
  const start = performance.now()
  while (performance.now() - start < 800) {
    const found = runtime.stage?.find('.design-node').map((node) => node.id()) ?? []
    if (sameIds(found, expected)) return
    await new Promise((resolve) => setTimeout(resolve, 32))
  }
}

/**
 * Garment photo with the design painted on it, matching the canvas.
 * The print-area export alone is not the product the buyer sees.
 */
export async function renderCustomizedMockup(store: Store, runtime: Runtime, side: SideId): Promise<Blob> {
  await ensureSide(store, runtime, side)
  const product = selectProduct(store.getState())
  const photoSrc = product ? resolveSide(product, side).image : null
  if (!product || !photoSrc) throw new Error('Product photo is missing')

  const photo = await loadImage(photoSrc)
  const design = await loadImage(runtime.designLayerDataURL(2))
  const ratio = 2
  const canvas = document.createElement('canvas')
  canvas.width = product.world.width * ratio
  canvas.height = product.world.height * ratio
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is unavailable')

  const { width: w, height: h } = product.world
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  const fit = Math.min(w / photo.naturalWidth, h / photo.naturalHeight)
  const dw = photo.naturalWidth * fit
  const dh = photo.naturalHeight * fit
  ctx.drawImage(photo, (w - dw) / 2, (h - dh) / 2, dw, dh)
  ctx.drawImage(design, 0, 0, w, h)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((next) => (next ? resolve(next) : reject(new Error('Could not encode preview'))), 'image/png')
  })
  return blob
}

/** Front when it has artwork, otherwise the back, otherwise the side on screen. */
export function previewSide(store: Store): SideId {
  const doc = store.getState().history.present
  if (doc.sides.front.length > 0) return 'front'
  if (doc.sides.back.length > 0) return 'back'
  return store.getState().activeSide
}
