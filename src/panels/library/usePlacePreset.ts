import type { NodePreset } from '@/engine'
import { useEditor } from '@/engine'

/** Places a catalog preset. Pass `edit` for text that should open the canvas editor. */
export function usePlacePreset() {
  const addNode = useEditor((s) => s.addNode)
  const startEditing = useEditor((s) => s.startEditing)
  return (preset: NodePreset, opts?: { edit?: boolean }) => {
    const id = addNode(preset.type, preset.overrides)
    if (opts?.edit) startEditing(id)
    return id
  }
}
