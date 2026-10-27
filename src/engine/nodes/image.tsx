import { Image as KonvaImage } from 'react-konva'
import type { ImageNode } from '../types'
import { useImageElement } from '../hooks/useImageElement'
import { defineNode, type KonvaCommonProps } from './registry'

function ImageNodeView({ node, common, src }: { node: ImageNode; common: KonvaCommonProps; src?: string }) {
  const image = useImageElement(src)
  return <KonvaImage {...common} image={image} width={node.width} height={node.height} />
}

export const imageNode = defineNode<ImageNode>({
  type: 'image',
  label: 'Image',
  defaults: () => ({ type: 'image', assetId: '', width: 200, height: 200 }),
  placeAt: (n, c) => ({ ...n, x: c.x - n.width / 2, y: c.y - n.height / 2 }),
  render: (n, common, env) => <ImageNodeView node={n} common={common} src={env.assets[n.assetId]?.src} />,
  fold: (n, k) => ({
    width: Math.max(1, n.width * k.scaleX()),
    height: Math.max(1, n.height * k.scaleY()),
  }),
  transformer: { keepRatio: true, enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] },
})
