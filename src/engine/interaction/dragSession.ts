import type Konva from 'konva'
import type { EditorStore } from '../store/editorStore'
import { selectActiveNodes, selectProduct } from '../store/editorStore'
import { computeSnap, NO_GUIDES } from './snapping'

interface Session {
  anchorId: string
  start: Map<string, { x: number; y: number }>
  exclude: Set<string>
}
let session: Session | null = null

const nodeById = (stage: Konva.Stage, id: string) => stage.findOne<Konva.Node>(`#${id}`)

/**
 * Drag of one node moves the whole selection. Positions are mutated on the Konva nodes
 * while dragging and committed once, as a single history entry, when the drag ends.
 */
export function beginDrag(store: EditorStore, target: Konva.Node) {
  const stage = target.getStage()
  if (!stage) return
  const s = store.getState()
  const ids = s.selection.includes(target.id()) ? s.selection : [target.id()]
  const nodes = selectActiveNodes(s)
  const start = new Map<string, { x: number; y: number }>()
  for (const id of ids) {
    const doc = nodes.find((n) => n.id === id)
    const k = id === target.id() ? target : nodeById(stage, id)
    if (k && doc && !doc.locked) start.set(id, { x: k.x(), y: k.y() })
  }
  session = { anchorId: target.id(), start, exclude: new Set(start.keys()) }
}

export function moveDrag(store: EditorStore, target: Konva.Node, snapDisabled: boolean) {
  const sess = session
  const stage = target.getStage()
  if (!sess || !stage) return
  const s = store.getState()

  if (snapDisabled) {
    s.setGuides(NO_GUIDES)
  } else {
    const product = selectProduct(s)
    if (!product) return
    const { printArea } = product.sides[s.activeSide]
    const { dx, dy, guides } = computeSnap(target, sess.exclude, printArea, 6 / stage.scaleX())
    target.position({ x: target.x() + dx, y: target.y() + dy })
    s.setGuides(guides)
  }

  const a = sess.start.get(sess.anchorId)
  if (!a) return
  const ddx = target.x() - a.x
  const ddy = target.y() - a.y
  sess.start.forEach((p, id) => {
    if (id !== sess.anchorId) nodeById(stage, id)?.position({ x: p.x + ddx, y: p.y + ddy })
  })
}

export function endDrag(store: EditorStore, target: Konva.Node) {
  const sess = session
  session = null
  const s = store.getState()
  s.setGuides(NO_GUIDES)
  const stage = target.getStage()
  if (!sess || !stage) return
  const patches = [...sess.start.keys()].flatMap((id) => {
    const k = id === target.id() ? target : nodeById(stage, id)
    return k ? [{ id, patch: { x: k.x(), y: k.y() } }] : []
  })
  s.updateNodes(patches)
}
