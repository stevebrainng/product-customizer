import { useLayoutEffect, useRef } from 'react'
import Konva from 'konva'
import { Image as KonvaImage } from 'react-konva'
import type { ImageFilter, ImageNode } from '../types'
import { useImageElement } from '../hooks/useImageElement'
import { defineNode, type KonvaCommonProps } from './registry'

/** Screen cache ratio. Export recaches at the print pixel ratio, then restores this. */
export const SCREEN_CACHE_RATIO = 2

const FILTERS: Record<Exclude<ImageFilter, 'none'>, Konva.Filter[]> = {
  grayscale: [Konva.Filters.Grayscale],
  sepia: [Konva.Filters.Sepia],
  invert: [Konva.Filters.Invert],
  blur: [Konva.Filters.Blur],
  brighten: [Konva.Filters.Brightness],
  contrast: [Konva.Filters.Contrast],
}

export function recacheFilteredImages(stage: Konva.Stage, pixelRatio: number) {
  stage.find('Image').forEach((node) => {
    if (node.filters()?.length) node.cache({ pixelRatio })
  })
}

function ImageNodeView({ node, common, src }: { node: ImageNode; common: KonvaCommonProps; src?: string }) {
  const image = useImageElement(src)
  const ref = useRef<Konva.Image>(null)
  const filter = node.filter ?? 'none'
  const active = filter !== 'none'

  useLayoutEffect(() => {
    const shape = ref.current
    if (!shape || !image) return
    if (active) shape.cache({ pixelRatio: SCREEN_CACHE_RATIO })
    else shape.clearCache()
    shape.getLayer()?.batchDraw()
  }, [image, active, filter, node.filterAmount, node.width, node.height])

  return (
    <KonvaImage
      ref={ref}
      {...common}
      image={image}
      width={node.width}
      height={node.height}
      filters={active ? FILTERS[filter] : []}
      blurRadius={filter === 'blur' ? (node.filterAmount ?? 8) : 0}
      brightness={filter === 'brighten' ? (node.filterAmount ?? 1.25) : 1}
      contrast={filter === 'contrast' ? (node.filterAmount ?? 20) : 0}
    />
  )
}

export const imageNode = defineNode<ImageNode>({
  type: 'image',
  label: 'Image',
  defaults: () => ({ type: 'image', assetId: '', width: 200, height: 200, filter: 'none', filterAmount: 0 }),
  placeAt: (n, c) => ({ ...n, x: c.x - n.width / 2, y: c.y - n.height / 2 }),
  render: (n, common, env) => <ImageNodeView node={n} common={common} src={env.assets[n.assetId]?.src} />,
  fold: (n, k) => ({
    width: Math.max(1, n.width * k.scaleX()),
    height: Math.max(1, n.height * k.scaleY()),
  }),
  transformer: { keepRatio: true, enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] },
})
