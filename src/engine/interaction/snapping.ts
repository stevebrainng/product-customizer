import type Konva from 'konva'
import type { Guides, Rect } from '../types'

const EDGE_OPTS = { skipShadow: true, skipStroke: true } as const
const EPS = 0.5

export const NO_GUIDES: Guides = { v: [], h: [] }

const stops = (r: Rect, axis: 'x' | 'y') =>
  axis === 'x' ? [r.x, r.x + r.width / 2, r.x + r.width] : [r.y, r.y + r.height / 2, r.y + r.height]

function bestDelta(edges: number[], targets: number[], threshold: number) {
  let best = 0
  let min = threshold
  for (const t of targets) for (const e of edges) {
    const d = t - e
    if (Math.abs(d) < min) { min = Math.abs(d); best = d }
  }
  return min < threshold ? best : 0
}

/**
 * Snaps a dragged node's left/centre/right and top/middle/bottom to the print area and to
 * other nodes. Returns the correction to apply plus the guide lines that now line up.
 */
export function computeSnap(target: Konva.Node, exclude: Set<string>, printArea: Rect, threshold: number) {
  const layer = target.getLayer()
  if (!layer) return { dx: 0, dy: 0, guides: NO_GUIDES }

  const box = target.getClientRect({ relativeTo: layer, ...EDGE_OPTS })
  const vT = stops(printArea, 'x')
  const hT = stops(printArea, 'y')
  layer.find<Konva.Node>('.design-node').forEach((n) => {
    if (exclude.has(n.id()) || !n.isVisible()) return
    const r = n.getClientRect({ relativeTo: layer, ...EDGE_OPTS })
    vT.push(...stops(r, 'x'))
    hT.push(...stops(r, 'y'))
  })

  const dx = bestDelta(stops(box, 'x'), vT, threshold)
  const dy = bestDelta(stops(box, 'y'), hT, threshold)

  const edgesX = stops(box, 'x').map((e) => e + dx)
  const edgesY = stops(box, 'y').map((e) => e + dy)
  const uniq = (a: number[]) => [...new Set(a.map((n) => Math.round(n * 10) / 10))]
  return {
    dx,
    dy,
    guides: {
      v: uniq(vT.filter((t) => edgesX.some((e) => Math.abs(e - t) < EPS))),
      h: uniq(hT.filter((t) => edgesY.some((e) => Math.abs(e - t) < EPS))),
    },
  }
}
