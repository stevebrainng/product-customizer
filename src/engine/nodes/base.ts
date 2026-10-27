/** Konva `name` shared by every document node, so overlays can tell them apart. */
export const NODE_CLASS = 'design-node'

export const createId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`

export const baseDefaults = { rotation: 0, opacity: 1, locked: false, hidden: false } as const

export const avgScale = (k: { scaleX(): number; scaleY(): number }) => (k.scaleX() + k.scaleY()) / 2
