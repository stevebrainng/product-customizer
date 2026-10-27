import { Line } from 'react-konva'
import type { LineNode } from '../types'
import { defineNode } from './registry'

export const lineNode = defineNode<LineNode>({
  type: 'line',
  label: 'Line',
  defaults: () => ({ type: 'line', length: 200, stroke: '#111111', strokeWidth: 4 }),
  placeAt: (n, c) => ({ ...n, x: c.x - n.length / 2, y: c.y }),
  render: (n, common) => (
    <Line
      {...common}
      points={[0, 0, n.length, 0]}
      stroke={n.stroke}
      strokeWidth={n.strokeWidth}
      lineCap="round"
      strokeScaleEnabled={false}
      hitStrokeWidth={Math.max(n.strokeWidth, 16)}
    />
  ),
  fold: (n, k) => ({ length: Math.max(2, n.length * k.scaleX()) }),
  transformer: { enabledAnchors: ['middle-left', 'middle-right'], keepRatio: false },
})
