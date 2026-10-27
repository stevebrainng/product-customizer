import { selectActiveNodes, useEditor, type DesignNode } from '@/engine'
import { ColorSwatch, EditBar, MiniNumber, OpacityControl } from './editControls'

function isShape(node: DesignNode): node is Extract<DesignNode, { stroke: string; strokeWidth: number }> {
  return node.type === 'rect' || node.type === 'ellipse' || node.type === 'polygon' || node.type === 'line'
}

/** Fill, stroke, and opacity for the selected shape. */
export function ShapeToolbar() {
  const updateNode = useEditor((s) => s.updateNode)
  const node = useEditor((s) => {
    if (s.selection.length !== 1) return null
    const n = selectActiveNodes(s).find((x) => x.id === s.selection[0])
    return n && isShape(n) && !n.locked ? n : null
  })
  if (!node) return null

  const fill = 'fill' in node ? node.fill : null

  return (
    <EditBar label="Shape editing">
      <OpacityControl value={node.opacity} onChange={(opacity) => updateNode(node.id, { opacity })} />
      {fill !== null && (
        <ColorSwatch label="Fill" value={fill} onChange={(next) => updateNode(node.id, { fill: next })} />
      )}
      <ColorSwatch label="Stroke" value={node.stroke} onChange={(stroke) => updateNode(node.id, { stroke })} />
      <MiniNumber
        label="Stroke"
        value={node.strokeWidth}
        min={0}
        max={40}
        onChange={(strokeWidth) => updateNode(node.id, { strokeWidth })}
      />
      {node.type === 'rect' && (
        <MiniNumber
          label="Radius"
          value={node.cornerRadius}
          min={0}
          max={200}
          onChange={(cornerRadius) => updateNode(node.id, { cornerRadius })}
        />
      )}
    </EditBar>
  )
}
