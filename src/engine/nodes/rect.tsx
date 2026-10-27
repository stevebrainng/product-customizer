import { Rect } from 'react-konva'
import type { RectNode } from '../types'
import { defineNode } from './registry'

export const rectNode = defineNode<RectNode>({
  type: 'rect',
  label: 'Rectangle',
  defaults: () => ({
    type: 'rect', width: 160, height: 160, fill: '#111111', stroke: '#000000', strokeWidth: 0, cornerRadius: 0,
  }),
  placeAt: (n, c) => ({ ...n, x: c.x - n.width / 2, y: c.y - n.height / 2 }),
  render: (n, common) => (
    <Rect
      {...common}
      width={n.width}
      height={n.height}
      fill={n.fill}
      stroke={n.stroke}
      strokeWidth={n.strokeWidth}
      strokeScaleEnabled={false}
      cornerRadius={n.cornerRadius}
    />
  ),
  fold: (n, k) => ({
    width: Math.max(1, n.width * k.scaleX()),
    height: Math.max(1, n.height * k.scaleY()),
  }),
})
