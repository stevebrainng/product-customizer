import type { NodePreset } from '@/engine'

export type ShapeKind =
  | 'square'
  | 'rounded'
  | 'circle'
  | 'line'
  | 'triangle'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'

export interface ShapeEntry {
  id: string
  label: string
  category: 'basic' | 'polygons'
  kind: ShapeKind
  preset: NodePreset
}

export const SHAPE_CATALOG: ShapeEntry[] = [
  { id: 'square', label: 'Square', category: 'basic', kind: 'square', preset: { type: 'rect', overrides: { width: 160, height: 160 } } },
  { id: 'rounded', label: 'Rounded square', category: 'basic', kind: 'rounded', preset: { type: 'rect', overrides: { width: 160, height: 160, cornerRadius: 28 } } },
  { id: 'circle', label: 'Circle', category: 'basic', kind: 'circle', preset: { type: 'ellipse', overrides: { radiusX: 80, radiusY: 80 } } },
  { id: 'line', label: 'Line', category: 'basic', kind: 'line', preset: { type: 'line' } },
  { id: 'triangle', label: 'Triangle', category: 'polygons', kind: 'triangle', preset: { type: 'polygon', overrides: { sides: 3, radius: 90 } } },
  { id: 'pentagon', label: 'Pentagon', category: 'polygons', kind: 'pentagon', preset: { type: 'polygon', overrides: { sides: 5, radius: 90 } } },
  { id: 'hexagon', label: 'Hexagon', category: 'polygons', kind: 'hexagon', preset: { type: 'polygon', overrides: { sides: 6, radius: 90 } } },
  { id: 'octagon', label: 'Octagon', category: 'polygons', kind: 'octagon', preset: { type: 'polygon', overrides: { sides: 8, radius: 90 } } },
]

export const SHAPE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'basic', label: 'Basic' },
  { id: 'polygons', label: 'Polygons' },
] as const
