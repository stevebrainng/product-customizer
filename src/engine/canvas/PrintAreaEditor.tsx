import { useEffect, useRef } from 'react'
import type Konva from 'konva'
import { Rect, Transformer } from 'react-konva'
import type { Rect as RectData, Size } from '../types'
import { clampRect } from '../product'
import { useEditor } from '../provider/EditorProvider'

const ACCENT = '#3a43c8'

/** Drag/resize the print area directly on the canvas (product setup mode). */
export function PrintAreaEditor({ area, world, scale }: { area: RectData; world: Size; scale: number }) {
  const side = useEditor((s) => s.activeSide)
  const updateSide = useEditor((s) => s.updateSide)
  const rectRef = useRef<Konva.Rect>(null)
  const trRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (!rectRef.current || !trRef.current) return
    trRef.current.nodes([rectRef.current])
    trRef.current.getLayer()?.batchDraw()
  }, [])

  const commit = () => {
    const n = rectRef.current
    if (!n) return
    const next = clampRect(
      { x: n.x(), y: n.y(), width: n.width() * n.scaleX(), height: n.height() * n.scaleY() },
      world,
    )
    n.scaleX(1)
    n.scaleY(1)
    updateSide(side, { printArea: next })
  }

  return (
    <>
      <Rect
        ref={rectRef}
        {...area}
        draggable
        fill="rgba(58,67,200,0.07)"
        stroke={ACCENT}
        strokeWidth={1.5 / scale}
        dash={[6 / scale, 4 / scale]}
        onDragEnd={commit}
        onTransformEnd={commit}
      />
      <Transformer
        ref={trRef}
        rotateEnabled={false}
        flipEnabled={false}
        keepRatio={false}
        anchorSize={9 / scale}
        anchorFill="#fff"
        anchorStroke={ACCENT}
        anchorStrokeWidth={1 / scale}
        borderStroke={ACCENT}
        borderStrokeWidth={1 / scale}
      />
    </>
  )
}
