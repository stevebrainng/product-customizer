import type { DesignNode, NodeType, Point } from '../types'
import { baseDefaults, createId } from './base'
import { getNodeDefinition, registerNode } from './registry'
import { rectNode } from './rect'
import { ellipseNode } from './ellipse'
import { polygonNode } from './polygon'
import { lineNode } from './line'
import { textNode } from './text'
import { imageNode } from './image'

;[rectNode, ellipseNode, polygonNode, lineNode, textNode, imageNode].forEach(registerNode)

export { getNodeDefinition, registerNode, defineNode } from './registry'
export { createId, NODE_CLASS } from './base'

/** Builds a node from its type defaults + overrides, centred on `center`. */
export function createNode(type: NodeType, center: Point, overrides: Partial<DesignNode> = {}): DesignNode {
  const def = getNodeDefinition(type)
  const node = { id: createId(type), x: 0, y: 0, ...baseDefaults, ...def.defaults(), ...overrides, type } as DesignNode
  return def.placeAt(node, center)
}
