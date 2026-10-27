import { RegularPolygon } from 'react-konva'
import type { PolygonNode } from '../types'
import { avgScale } from './base'
import { defineNode } from './registry'

export const polygonNode = defineNode<PolygonNode>({
  type: 'polygon',
  label: 'Polygon',
  defaults: () => ({
    type: 'polygon', sides: 5, radius: 90, fill: '#111111', stroke: '#000000', strokeWidth: 0,
  }),
  placeAt: (n, c) => ({ ...n, x: c.x, y: c.y }),
  render: (n, common) => (
    <RegularPolygon
      {...common}
      sides={n.sides}
      radius={n.radius}
      fill={n.fill}
      stroke={n.stroke}
      strokeWidth={n.strokeWidth}
      strokeScaleEnabled={false}
    />
  ),
  fold: (n, k) => ({ radius: Math.max(2, n.radius * avgScale(k)) }),
  transformer: { keepRatio: true, enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] },
})
