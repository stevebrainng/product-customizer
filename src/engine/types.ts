export type SideId = 'front' | 'back'
export interface Point { x: number; y: number }
export interface Size { width: number; height: number }
export interface Rect extends Point, Size {}

/**
 * Document nodes are plain, serialisable data. Konva nodes are only an interaction
 * surface (see engine/canvas/NodeView). Size lives in each node's own props, never in
 * scaleX/scaleY, so saved files stay readable and independent from Konva internals.
 */
interface NodeBase {
  id: string
  x: number
  y: number
  rotation: number
  opacity: number
  locked: boolean
  hidden: boolean
  label?: string
}
export type NodeBaseKeys = keyof NodeBase

export interface RectNode extends NodeBase {
  type: 'rect'; width: number; height: number
  fill: string; stroke: string; strokeWidth: number; cornerRadius: number
}
export interface EllipseNode extends NodeBase {
  type: 'ellipse'; radiusX: number; radiusY: number
  fill: string; stroke: string; strokeWidth: number
}
export interface PolygonNode extends NodeBase {
  type: 'polygon'; sides: number; radius: number
  fill: string; stroke: string; strokeWidth: number
}
/** Horizontal line starting at (x, y); rotate it for other angles. */
export interface LineNode extends NodeBase {
  type: 'line'; length: number; stroke: string; strokeWidth: number
}
/** Konva.Text textDecoration: one value, or none. */
export type TextDecoration = '' | 'underline' | 'line-through'

export interface TextNode extends NodeBase {
  type: 'text'; text: string; fontSize: number; fontFamily: string
  fontStyle: string; fill: string; align: 'left' | 'center' | 'right'; width?: number
  /** Multiplier on font size. Konva default is 1. */
  lineHeight?: number
  /** Extra pixels between characters. */
  letterSpacing?: number
  textDecoration?: TextDecoration
  stroke?: string
  strokeWidth?: number
  shadowBlur?: number
  shadowColor?: string
  /** 0–1. Used only when shadowBlur is greater than 0. */
  shadowOpacity?: number
}

/** Konva.Filters applied to an image. `none` skips cache(). */
export type ImageFilter = 'none' | 'grayscale' | 'sepia' | 'invert' | 'blur' | 'brighten' | 'contrast'

export interface ImageNode extends NodeBase {
  type: 'image'
  /** Reference into the asset registry. Image data never lives in the document or history. */
  assetId: string
  width: number; height: number
  filter?: ImageFilter
  /** blur radius, brightness multiplier, or contrast amount — meaning depends on `filter`. */
  filterAmount?: number
}

export type DesignNode = RectNode | EllipseNode | PolygonNode | LineNode | TextNode | ImageNode
export type NodeType = DesignNode['type']

/** A "thing to add": used by library panels so they never touch node internals. */
export interface NodePreset { type: NodeType; overrides?: Partial<DesignNode> }

export interface AssetAttribution {
  name: string
  profileUrl: string
  photoUrl?: string
}

export interface Asset {
  id: string
  name: string
  src: string
  width: number
  height: number
  /** Where the bytes came from. Omitted on older documents. */
  source?: 'upload' | 'unsplash'
  attribution?: AssetAttribution
}
export interface DesignDoc { sides: Record<SideId, DesignNode[]> }

/** Snap guide positions in world coordinates (transient, never part of history). */
export interface Guides { v: number[]; h: number[] }

// ---------------- Product config (pure data, JSON-serialisable) ----------------

export interface SideConfig {
  /** URL or data URL of the product photo. null on a side = reuse the front image. */
  image: string | null
  /** True when the image has transparency, so a colour tint can be applied to it. */
  tintable: boolean
  /** Print area in world coordinates. Designs are clipped to it and exported from it. */
  printArea: Rect
}
export interface ProductColor { id: string; name: string; hex: string }

export interface ProductSpec {
  id: string
  name: string
  /** World size: the coordinate space nodes live in. Scaled to fit the viewport. */
  world: Size
  sides: Record<SideId, SideConfig>
  colors: ProductColor[]
  sizes: string[]
}

export interface Variant { colorId: string | null; size: string | null }
