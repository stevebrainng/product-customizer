import { useEffect, useMemo, useRef } from 'react'
import type Konva from 'konva'
import { Transformer } from 'react-konva'
import { selectActiveNodes } from '../store/editorStore'
import { getNodeDefinition } from '../nodes'
import { useEditor, useEditorStore } from '../provider/EditorProvider'

const ACCENT = '#3a43c8'
const MIN_SIZE_PX = 12

/** Resize/rotate handles. Sizes are divided by the stage scale so handles stay constant on screen. */
export function SelectionTransformer({ scale }: { scale: number }) {
  const store = useEditorStore()
  const ref = useRef<Konva.Transformer>(null)
  const selection = useEditor((s) => s.selection)
  const editingTextId = useEditor((s) => s.editingTextId)
  const nodes = useEditor(selectActiveNodes)

  const selected = useMemo(() => nodes.filter((n) => selection.includes(n.id)), [nodes, selection])
  const options = selected.length === 1 ? getNodeDefinition(selected[0].type).transformer : undefined
  const locked = selected.some((n) => n.locked)
  // Hide handles while the DOM textarea is active (Konva editable-text pattern).
  const active = !editingTextId

  useEffect(() => {
    const tr = ref.current
    const stage = tr?.getStage()
    if (!tr || !stage) return
    const found = active
      ? selected
          .map((n) => stage.findOne<Konva.Node>(`#${n.id}`))
          .filter((n): n is Konva.Node => !!n && n.isVisible())
      : []
    tr.nodes(found)
    tr.getLayer()?.batchDraw()
  }, [selected, active])

  // Fires once per gesture for all attached nodes => one undo step for a multi-selection.
  const commit = () => {
    const tr = ref.current
    if (!tr) return
    const byId = new Map(selectActiveNodes(store.getState()).map((n) => [n.id, n]))
    const patches = tr.nodes().flatMap((k) => {
      const n = byId.get(k.id())
      if (!n) return []
      const folded = getNodeDefinition(n.type).fold(n, k)
      k.scaleX(1)
      k.scaleY(1)
      return [{ id: n.id, patch: { x: k.x(), y: k.y(), rotation: k.rotation(), ...folded } }]
    })
    store.getState().updateNodes(patches)
  }

  return (
    <Transformer
      ref={ref}
      flipEnabled={false}
      resizeEnabled={!locked}
      rotateEnabled={!locked}
      enabledAnchors={options?.enabledAnchors}
      keepRatio={options?.keepRatio ?? true}
      anchorSize={9 / scale}
      anchorCornerRadius={2 / scale}
      anchorFill="#ffffff"
      anchorStroke={ACCENT}
      anchorStrokeWidth={1 / scale}
      borderStroke={ACCENT}
      borderStrokeWidth={1 / scale}
      rotateAnchorOffset={24 / scale}
      rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
      rotationSnapTolerance={4}
      onTransformEnd={commit}
      boundBoxFunc={(oldBox, newBox) =>
        newBox.width < MIN_SIZE_PX * scale || newBox.height < MIN_SIZE_PX * scale ? oldBox : newBox
      }
    />
  )
}
