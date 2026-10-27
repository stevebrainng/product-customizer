import { Text } from 'react-konva'
import { DEFAULT_FONT_FAMILY } from '@/config/fonts'
import type { TextNode } from '../types'
import { defineNode } from './registry'

export const textNode = defineNode<TextNode>({
  type: 'text',
  label: 'Text',
  editable: true,
  defaults: () => ({
    type: 'text', text: 'Your text', fontSize: 48, fontFamily: DEFAULT_FONT_FAMILY,
    fontStyle: 'bold', fill: '#111111', align: 'center', width: 280,
    lineHeight: 1.15, letterSpacing: 0, textDecoration: '',
    stroke: '#111111', strokeWidth: 0,
    shadowBlur: 0, shadowColor: '#000000', shadowOpacity: 0.45,
  }),
  placeAt: (n, c) => ({ ...n, x: c.x - (n.width ?? 0) / 2, y: c.y - n.fontSize / 2 }),
  render: (n, common) => (
    <Text
      {...common}
      text={n.text}
      fontSize={n.fontSize}
      fontFamily={n.fontFamily}
      fontStyle={n.fontStyle}
      fill={n.fill}
      align={n.align}
      width={n.width}
      lineHeight={n.lineHeight ?? 1.15}
      letterSpacing={n.letterSpacing ?? 0}
      textDecoration={n.textDecoration || ''}
      stroke={(n.strokeWidth ?? 0) > 0 ? (n.stroke || '#111111') : undefined}
      strokeWidth={n.strokeWidth ?? 0}
      fillAfterStrokeEnabled={(n.strokeWidth ?? 0) > 0}
      shadowEnabled={(n.shadowBlur ?? 0) > 0}
      shadowBlur={n.shadowBlur ?? 0}
      shadowColor={n.shadowColor || '#000000'}
      shadowOpacity={n.shadowOpacity ?? 0.45}
      shadowOffsetY={3}
      wrap="word"
    />
  ),
  // Corner drag scales the font; side drag only changes the wrapping width.
  fold: (n, k) => {
    const sx = k.scaleX()
    const sy = k.scaleY()
    if (Math.abs(sx - sy) < 0.001) {
      return { fontSize: Math.max(6, n.fontSize * sx), width: n.width ? n.width * sx : undefined }
    }
    return { width: Math.max(20, k.width() * sx) }
  },
  transformer: {
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right'],
  },
})
