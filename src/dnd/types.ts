import type { NodePreset } from '@/engine'
import type { LibraryPhoto } from '@/media'

export interface DragPreview {
  label: string
  imageUrl?: string
  emoji?: string
}

export type LibraryDragData = {
  preview: DragPreview
} & (
  | { kind: 'preset'; preset: NodePreset; edit?: boolean }
  | { kind: 'photo'; photo: LibraryPhoto }
  | { kind: 'asset'; assetId: string }
)

export const CANVAS_DROP_ID = 'canvas'

export function isLibraryDrag(data: unknown): data is LibraryDragData {
  if (!data || typeof data !== 'object' || !('kind' in data)) return false
  const kind = (data as { kind: unknown }).kind
  return kind === 'preset' || kind === 'photo' || kind === 'asset'
}
