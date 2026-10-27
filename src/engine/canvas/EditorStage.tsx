import { useEffect, useRef, useState } from 'react'
import Konva from 'konva'
import { Layer, Line, Rect, Stage } from 'react-konva'
import type { Point, Rect as RectData } from '../types'
import { selectActiveNodes, selectProduct } from '../store/editorStore'
import { useEditor, useEditorRuntime, useEditorStore } from '../provider/EditorProvider'
import { useEditorShortcuts } from '../hooks/useEditorShortcuts'
import { NodeView } from './NodeView'
import { ProductMockup } from './ProductMockup'
import { SelectionTransformer } from './SelectionTransformer'
import { PrintAreaEditor } from './PrintAreaEditor'
import { TextEditor } from './TextEditor'
import { FONTS, fontLoadSpecs } from '@/config/fonts'

const GUIDE = '#f43f5e'

function SnapGuides({ world, scale }: { world: { width: number; height: number }; scale: number }) {
  const guides = useEditor((s) => s.guides)
  const common = { stroke: GUIDE, strokeWidth: 1 / scale, dash: [4 / scale, 3 / scale], listening: false }
  return (
    <>
      {guides.v.map((x) => <Line key={`v${x}`} points={[x, 0, x, world.height]} {...common} />)}
      {guides.h.map((y) => <Line key={`h${y}`} points={[0, y, world.width, y]} {...common} />)}
    </>
  )
}

/**
 * Layer stack, bottom to top:
 *  mockup (DOM)  : product photo, never part of the export
 *  #design       : document nodes, clipped to the print area
 *  #overlay      : print-area guide, snap guides, marquee, selection handles (hidden during export)
 *  textarea      : inline text editor (DOM)
 */
export function EditorStage({ scale, className }: { scale: number; className?: string }) {
  const store = useEditorStore()
  const runtime = useEditorRuntime()
  const product = useEditor(selectProduct)
  const side = useEditor((s) => s.activeSide)
  const nodes = useEditor(selectActiveNodes)
  const assets = useEditor((s) => s.assets)
  const editingPrintArea = useEditor((s) => s.editingPrintArea)
  useEditorShortcuts()

  useEffect(() => {
    void runtime.ensureFonts(FONTS.flatMap((f) => fontLoadSpecs(f.family, 48)))
  }, [runtime])

  const { world } = product
  const pa = product.sides[side].printArea

  // Marquee selection: drag on empty space to select everything the box touches.
  const origin = useRef<Point | null>(null)
  const [box, setBox] = useState<RectData | null>(null)
  const pointer = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => e.target.getStage()?.getRelativePointerPosition() ?? null

  const onDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target !== e.target.getStage() || editingPrintArea) return
    if (!(e.evt as MouseEvent).shiftKey) store.getState().clearSelection()
    origin.current = pointer(e)
  }
  const onMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const a = origin.current
    const b = a && pointer(e)
    if (a && b) setBox({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y) })
  }
  const onUp = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const area = box
    origin.current = null
    setBox(null)
    const stage = e.target.getStage()
    if (!area || !stage || (area.width * scale < 3 && area.height * scale < 3)) return
    const hits = stage
      .find<Konva.Node>('.design-node')
      .filter((n) => n.isVisible() && Konva.Util.haveIntersection(area, n.getClientRect({ relativeTo: stage, skipShadow: true, skipStroke: true })))
      .map((n) => n.id())
    const s = store.getState()
    s.select((e.evt as MouseEvent).shiftKey ? [...new Set([...s.selection, ...hits])] : hits)
  }

  return (
    <div className={className} style={{ position: 'relative', width: world.width * scale, height: world.height * scale }}>
      <div className="pointer-events-none absolute inset-0">
        <ProductMockup side={side} />
      </div>
      <div className="absolute inset-0">
        <Stage
          ref={runtime.setStage}
          width={world.width * scale}
          height={world.height * scale}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={onDown}
          onTouchStart={onDown}
          onMouseMove={onMove}
          onTouchMove={onMove}
          onMouseUp={onUp}
          onTouchEnd={onUp}
          onMouseLeave={() => { origin.current = null; setBox(null) }}
        >
          <Layer id="design" clipX={pa.x} clipY={pa.y} clipWidth={pa.width} clipHeight={pa.height}>
            {nodes.map((node) => (
              <NodeView key={node.id} node={node} assets={assets} />
            ))}
          </Layer>
          <Layer id="overlay">
            {editingPrintArea ? (
              <PrintAreaEditor area={pa} world={world} scale={scale} />
            ) : (
              <>
                <Rect {...pa} stroke="#3a3a3f" strokeWidth={1 / scale} listening={false} />
                <SnapGuides world={world} scale={scale} />
                {box && <Rect {...box} fill="rgba(58,67,200,0.08)" stroke="#3a43c8" strokeWidth={1 / scale} listening={false} />}
                <SelectionTransformer scale={scale} />
              </>
            )}
          </Layer>
        </Stage>
        <TextEditor scale={scale} />
      </div>
    </div>
  )
}
