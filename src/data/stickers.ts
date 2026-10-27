import { stickerPreset } from './presets'
import type { NodePreset } from '@/engine'

export interface StickerPack {
  id: string
  label: string
  emojis: string[]
}

export const STICKER_PACKS: StickerPack[] = [
  {
    id: 'smileys',
    label: 'Smileys',
    emojis: ['😀', '😂', '😍', '😎', '🤩', '😭', '😡', '🤮', '😮', '😴', '🤔', '😇'],
  },
  {
    id: 'animals',
    label: 'Animals',
    emojis: ['🐵', '🐶', '🐱', '🦊', '🐼', '🐸', '🦄', '🐝', '🦋', '🐙'],
  },
  {
    id: 'gestures',
    label: 'Gestures',
    emojis: ['👍', '👎', '👏', '🙌', '✌️', '🤘', '👋', '💪', '🙏', '👀'],
  },
  {
    id: 'objects',
    label: 'Objects',
    emojis: ['⭐', '🔥', '💎', '🎯', '🎨', '🎧', '⚡', '🌈', '🍀', '🎉'],
  },
]

export interface StickerEntry {
  id: string
  emoji: string
  packId: string
  preset: NodePreset
}

export const STICKER_CATALOG: StickerEntry[] = STICKER_PACKS.flatMap((pack) =>
  pack.emojis.map((emoji) => ({
    id: `${pack.id}-${emoji}`,
    emoji,
    packId: pack.id,
    preset: stickerPreset(emoji),
  })),
)

/** Short row for the Elements panel. */
export const FEATURED_STICKERS: StickerEntry[] = STICKER_PACKS.flatMap((pack) =>
  STICKER_CATALOG.filter((s) => s.packId === pack.id).slice(0, 2),
)
