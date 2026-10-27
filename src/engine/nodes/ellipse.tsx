import { Ellipse } from 'react-konva'
import type { EllipseNode } from '../types'
import { defineNode } from './registry'

/** Position is the ellipse centre (Konva convention). */
export const ellipseNode = defineNode<EllipseNode>({
  type: 'ellipse',
  label: 'Ellipse',
  defaults: () => ({
    type: 'ellipse', radiusX: 80, radiusY: 80, fill: '#111111', stroke: '#000000', strokeWidth: 0,
  }),
  placeAt: (n, c) => ({ ...n, x: c.x, y: c.y }),
  render: (n, common) => (
    <Ellipse
      {...common}
      radiusX={n.radiusX}
      radiusY={n.radiusY}
      fill={n.fill}
      stroke={n.stroke}
      strokeWidth={n.strokeWidth}
      strokeScaleEnabled={false}
    />
  ),
  fold: (n, k) => ({
    radiusX: Math.max(1, n.radiusX * k.scaleX()),
    radiusY: Math.max(1, n.radiusY * k.scaleY()),
  }),
})
