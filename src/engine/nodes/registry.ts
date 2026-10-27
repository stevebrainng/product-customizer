import type { ReactElement } from 'react'
import type Konva from 'konva'
import type { Asset, DesignNode, NodeBaseKeys, NodeType, Point } from '../types'

/** Props every node renderer spreads onto its Konva element. Built once in NodeView. */
export interface KonvaCommonProps {
  id: string
  name: string
  x: number
  y: number
  rotation: number
  opacity: number
  visible: boolean
  draggable: boolean
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onTouchStart: (e: Konva.KonvaEventObject<TouchEvent>) => void
  onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onDblClick: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDblTap: (e: Konva.KonvaEventObject<TouchEvent>) => void
}

export interface RenderEnv { assets: Record<string, Asset> }

export interface TransformerOptions {
  enabledAnchors?: string[]
  keepRatio?: boolean
}

/**
 * One definition per node type. To add a new type (line, group, QR code, ...):
 * extend the DesignNode union, write a definition, pass it to registerNode().
 * Nothing else in the engine needs to change.
 */
export interface NodeDefinition<T extends DesignNode = DesignNode> {
  type: T['type']
  label: string
  /** Double-click opens an inline editor (text today). */
  editable?: boolean
  defaults: () => Omit<T, Exclude<NodeBaseKeys, 'type'>>
  placeAt: (node: T, center: Point) => T
  render: (node: T, common: KonvaCommonProps, env: RenderEnv) => ReactElement
  /** Turns the Konva node's scale back into the node's own size props. Called by the Transformer before scale is reset. */
  fold: (node: T, konva: Konva.Node) => Partial<T>
  transformer?: TransformerOptions
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry = new Map<NodeType, NodeDefinition<any>>()

export const defineNode = <T extends DesignNode>(def: NodeDefinition<T>) => def
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerNode = (def: NodeDefinition<any>) => { registry.set(def.type, def) }

export function getNodeDefinition(type: NodeType): NodeDefinition {
  const def = registry.get(type)
  if (!def) throw new Error(`No node definition registered for "${type}"`)
  return def
}
