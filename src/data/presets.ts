import type { NodePreset } from '@/engine'

export const TEXT_PRESETS = {
  title: { type: 'text', overrides: { text: 'TITLE', fontSize: 64, fontStyle: 'bold' } },
  fashion: { type: 'text', overrides: { text: 'FASHION', fontSize: 44, fontStyle: 'normal' } },
  box: { type: 'text', overrides: { text: 'Text in a box. Not message in a bottle.', fontSize: 24, fontStyle: 'bold', fill: '#172554' } },
} satisfies Record<string, NodePreset>

export const stickerPreset = (emoji: string): NodePreset => ({ type: 'text', overrides: { text: emoji, fontSize: 96 } })
