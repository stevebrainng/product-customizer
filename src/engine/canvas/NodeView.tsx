import { memo } from 'react'
import type Konva from 'konva'
import type { Asset, DesignNode } from '../types'
import { getNodeDefinition, NODE_CLASS } from '../nodes'
import type { KonvaCommonProps } from '../nodes/registry'
import { useEditor, useEditorStore } from '../provider/EditorProvider'
import { beginDrag, endDrag, moveDrag } from '../interaction/dragSession'

const setCursor = (e: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
  const container = e.target.getStage()?.container()
  if (container) container.style.cursor = cursor
}

/**
 * Bridges a document node to Konva: builds the shared props + interaction handlers once,
 * then lets the node's registered definition decide which Konva element to draw.
 * Resizing is committed by SelectionTransformer so multi-selection is one history entry.
 */
export const NodeView = memo(function NodeView({ node, assets }: { node: DesignNode; assets: Record<string, Asset> }) {
  const store = useEditorStore()
  const def = getNodeDefinition(node.type)
  const editing = useEditor((s) => s.editingTextId === node.id)

  const pick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const s = store.getState()
    if ((e.evt as MouseEvent).shiftKey) s.toggleSelect(node.id)
    else if (!s.selection.includes(node.id)) s.select([node.id])
  }
  const edit = () => {
    if (def.editable) store.getState().startEditing(node.id)
  }

  const common: KonvaCommonProps = {
    id: node.id,
    name: NODE_CLASS,
    x: node.x,
    y: node.y,
    rotation: node.rotation,
    opacity: node.opacity,
    visible: !node.hidden && !editing,
    draggable: !node.locked,
    onMouseDown: pick,
    onTouchStart: pick,
    onMouseEnter: (e) => setCursor(e, node.locked ? 'default' : 'move'),
    onMouseLeave: (e) => setCursor(e, 'default'),
    onDragStart: (e) => beginDrag(store, e.target),
    onDragMove: (e) => moveDrag(store, e.target, e.evt.altKey),
    onDragEnd: (e) => endDrag(store, e.target),
    onDblClick: edit,
    onDblTap: edit,
  }

  return def.render(node, common, { assets })
})
