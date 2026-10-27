import { createStore } from 'zustand/vanilla'
import type {
  Asset, DesignDoc, DesignNode, Guides, NodeType, Point, ProductSpec, SideConfig, SideId, Variant,
} from '../types'
import { createId, createNode } from '../nodes'
import { clampZoom } from '../zoom'
import { defaultVariant } from '../product'
import { createHistory, pushHistory, redoHistory, undoHistory, type History } from './history'

export const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const
/** 'auto' fits the product to the viewport; a number is world-units-to-CSS-pixels. */
export type Zoom = 'auto' | number
export type ReorderDirection = 'forward' | 'backward' | 'front' | 'back'
export type ProductPatch = Partial<Pick<ProductSpec, 'name' | 'world' | 'colors' | 'sizes'>>
export interface NodePatch { id: string; patch: Partial<DesignNode> }

export interface EditorState {
  // product catalog (data) and the active product
  products: Record<string, ProductSpec>
  /** Null until the user uploads / selects a product. */
  productId: string | null
  /** Parked documents of products that are not active, so switching never loses work. */
  histories: Record<string, History<DesignDoc>>
  variant: Variant

  // active document
  history: History<DesignDoc>
  assets: Record<string, Asset>
  selection: string[]
  activeSide: SideId
  zoom: Zoom

  // transient interaction state (never part of history)
  guides: Guides
  editingTextId: string | null
  editingPrintArea: boolean

  addProduct: (product: ProductSpec) => void
  setProduct: (id: string) => void
  removeProduct: (id: string) => void
  updateProduct: (patch: ProductPatch) => void
  updateSide: (side: SideId, patch: Partial<SideConfig>) => void
  setColor: (colorId: string | null) => void
  setSize: (size: string | null) => void
  setEditingPrintArea: (on: boolean) => void

  setActiveSide: (side: SideId) => void
  select: (ids: string[]) => void
  toggleSelect: (id: string) => void
  clearSelection: () => void

  addNode: (type: NodeType, overrides?: Partial<DesignNode>, at?: Point) => string
  addImageNode: (assetId: string, at?: Point) => string | null
  addAsset: (asset: Asset) => void
  updateNode: (id: string, patch: Partial<DesignNode>) => void
  /** Batch update: one history entry for many nodes. */
  updateNodes: (patches: NodePatch[]) => void
  removeSelected: () => void
  duplicateSelected: () => void
  nudgeSelected: (dx: number, dy: number) => void
  reorderSelected: (dir: ReorderDirection) => void
  /** `ids` are front-to-back, matching the Layers list. */
  setLayerOrder: (ids: string[]) => void

  startEditing: (id: string) => void
  stopEditing: () => void
  setGuides: (guides: Guides) => void

  undo: () => void
  redo: () => void

  setZoom: (zoom: Zoom) => void
  zoomIn: () => void
  zoomOut: () => void
}

export const selectProduct = (s: EditorState): ProductSpec | undefined =>
  s.productId ? s.products[s.productId] : undefined
export const selectHasProduct = (s: EditorState) => Boolean(s.productId && s.products[s.productId])
export const selectActiveNodes = (s: EditorState) => s.history.present.sides[s.activeSide]
/** A product photo alone is not a design. Export needs at least one layer on the active side. */
export const selectCanExport = (s: EditorState) => selectHasProduct(s) && selectActiveNodes(s).length > 0
export const selectCanUndo = (s: EditorState) => s.history.past.length > 0
export const selectCanRedo = (s: EditorState) => s.history.future.length > 0

const zoomValue = (z: Zoom) => (z === 'auto' ? 1 : z)
const emptyDoc = (): DesignDoc => ({ sides: { front: [], back: [] } })
const NO_GUIDES: Guides = { v: [], h: [] }
const sameList = (a: number[], b: number[]) => a.length === b.length && a.every((n, i) => n === b[i])

function reorder(nodes: DesignNode[], ids: string[], dir: ReorderDirection): DesignNode[] {
  const picked = (n: DesignNode) => ids.includes(n.id)
  if (dir === 'front') return [...nodes.filter((n) => !picked(n)), ...nodes.filter(picked)]
  if (dir === 'back') return [...nodes.filter(picked), ...nodes.filter((n) => !picked(n))]
  const out = [...nodes]
  if (dir === 'forward') {
    for (let i = out.length - 2; i >= 0; i--) {
      if (picked(out[i]) && !picked(out[i + 1])) [out[i], out[i + 1]] = [out[i + 1], out[i]]
    }
  } else {
    for (let i = 1; i < out.length; i++) {
      if (picked(out[i]) && !picked(out[i - 1])) [out[i], out[i - 1]] = [out[i - 1], out[i]]
    }
  }
  return out
}

/** Keeps the chosen colour/size valid after the product's options change. */
function fixVariant(product: ProductSpec, v: Variant): Variant {
  return {
    colorId: product.colors.some((c) => c.id === v.colorId) ? v.colorId : (product.colors[0]?.id ?? null),
    size: v.size && product.sizes.includes(v.size) ? v.size : (product.sizes[0] ?? null),
  }
}

/** Store factory: one store per <EditorProvider>, so tests and multi-editor pages stay isolated. */
export const createEditorStore = (initialProducts: ProductSpec[] = []) => {
  const first = initialProducts[0]

  return createStore<EditorState>()((set, get) => {
    const sideNodes = () => {
      const s = get()
      return s.history.present.sides[s.activeSide]
    }

    /** The single write path into the document. Every call is one undo step. */
    const commitNodes = (fn: (nodes: DesignNode[]) => DesignNode[], selection?: string[]) =>
      set((s) => {
        const doc = s.history.present
        const current = doc.sides[s.activeSide]
        const nodes = fn(current)
        if (nodes === current) return s
        return {
          history: pushHistory(s.history, { sides: { ...doc.sides, [s.activeSide]: nodes } }),
          ...(selection ? { selection } : {}),
        }
      })

    const prune = (selection: string[], nodes: DesignNode[]) =>
      selection.filter((id) => nodes.some((n) => n.id === id))

    const patchProduct = (fn: (p: ProductSpec) => ProductSpec) =>
      set((s) => {
        if (!s.productId) return s
        const current = s.products[s.productId]
        if (!current) return s
        const next = fn(current)
        return { products: { ...s.products, [s.productId]: next }, variant: fixVariant(next, s.variant) }
      })

    const clearActiveProduct = () => ({
      productId: null as string | null,
      history: createHistory<DesignDoc>(emptyDoc()),
      variant: { colorId: null, size: null } as Variant,
      selection: [] as string[],
      activeSide: 'front' as SideId,
      guides: NO_GUIDES,
      editingTextId: null,
      editingPrintArea: false,
    })

    return {
      products: Object.fromEntries(initialProducts.map((p) => [p.id, p])),
      productId: first?.id ?? null,
      histories: {},
      variant: first ? defaultVariant(first) : { colorId: null, size: null },
      history: createHistory<DesignDoc>(emptyDoc()),
      assets: {},
      selection: [],
      activeSide: 'front',
      zoom: 'auto',
      guides: NO_GUIDES,
      editingTextId: null,
      editingPrintArea: false,

      addProduct: (product) => {
        set((s) => ({ products: { ...s.products, [product.id]: product } }))
        get().setProduct(product.id)
      },
      setProduct: (id) =>
        set((s) => {
          const product = s.products[id]
          if (!product || id === s.productId) return s
          const histories = s.productId
            ? { ...s.histories, [s.productId]: s.history }
            : s.histories
          return {
            histories,
            productId: id,
            history: s.histories[id] ?? createHistory<DesignDoc>(emptyDoc()),
            variant: defaultVariant(product),
            selection: [],
            activeSide: 'front',
            guides: NO_GUIDES,
            editingTextId: null,
            editingPrintArea: false,
          }
        }),
      removeProduct: (id) => {
        const s = get()
        if (!s.products[id]) return
        const ids = Object.keys(s.products)
        const remaining = Object.fromEntries(Object.entries(s.products).filter(([k]) => k !== id))
        const histories = Object.fromEntries(Object.entries(s.histories).filter(([k]) => k !== id))
        if (ids.length === 1) {
          set({ products: remaining, histories, ...clearActiveProduct() })
          return
        }
        const fallback = ids.find((x) => x !== id)!
        if (id === s.productId) get().setProduct(fallback)
        set({ products: remaining, histories })
      },
      updateProduct: (patch) => patchProduct((p) => ({ ...p, ...patch })),
      updateSide: (side, patch) =>
        patchProduct((p) => ({ ...p, sides: { ...p.sides, [side]: { ...p.sides[side], ...patch } } })),
      setColor: (colorId) => set((s) => ({ variant: { ...s.variant, colorId } })),
      setSize: (size) => set((s) => ({ variant: { ...s.variant, size } })),
      setEditingPrintArea: (on) => set({ editingPrintArea: on, selection: [], editingTextId: null }),

      setActiveSide: (side) => set({ activeSide: side, selection: [], editingTextId: null }),
      select: (ids) =>
        set((s) => {
          const same = ids.length === s.selection.length && ids.every((id, i) => id === s.selection[i])
          return same ? s : { selection: ids }
        }),
      toggleSelect: (id) =>
        set((s) => ({
          selection: s.selection.includes(id) ? s.selection.filter((x) => x !== id) : [...s.selection, id],
        })),
      clearSelection: () => set((s) => (s.selection.length ? { selection: [] } : s)),

      addNode: (type, overrides, at) => {
        const s = get()
        const product = selectProduct(s)
        if (!product) return ''
        const pa = product.sides[s.activeSide].printArea
        const cascade = (sideNodes().length % 6) * 14
        const center = at ?? { x: pa.x + pa.width / 2 + cascade, y: pa.y + pa.height / 2 + cascade }
        const node = createNode(type, center, overrides)
        commitNodes((nodes) => [...nodes, node], [node.id])
        return node.id
      },
      addImageNode: (assetId, at) => {
        const s = get()
        const product = selectProduct(s)
        const asset = s.assets[assetId]
        if (!product || !asset) return null
        const pa = product.sides[s.activeSide].printArea
        const k = Math.min((pa.width * 0.7) / asset.width, (pa.height * 0.7) / asset.height)
        return get().addNode('image', { assetId, width: asset.width * k, height: asset.height * k }, at)
      },
      addAsset: (asset) => set((s) => ({ assets: { ...s.assets, [asset.id]: asset } })),

      updateNode: (id, patch) => get().updateNodes([{ id, patch }]),
      updateNodes: (patches) =>
        commitNodes((nodes) => {
          const byId = new Map(patches.map((p) => [p.id, p.patch]))
          let changed = false
          const next = nodes.map((n) => {
            const patch = byId.get(n.id)
            if (!patch) return n
            changed = true
            return { ...n, ...patch } as DesignNode
          })
          return changed ? next : nodes
        }),

      removeSelected: () => {
        const ids = get().selection
        if (ids.length) commitNodes((nodes) => nodes.filter((n) => !ids.includes(n.id)), [])
      },
      duplicateSelected: () => {
        const ids = get().selection
        const copies = sideNodes()
          .filter((n) => ids.includes(n.id))
          .map((n) => ({ ...n, id: createId(n.type), x: n.x + 16, y: n.y + 16 }) as DesignNode)
        if (copies.length) commitNodes((nodes) => [...nodes, ...copies], copies.map((c) => c.id))
      },
      nudgeSelected: (dx, dy) => {
        const ids = get().selection
        commitNodes((nodes) =>
          nodes.map((n) => (ids.includes(n.id) && !n.locked ? ({ ...n, x: n.x + dx, y: n.y + dy } as DesignNode) : n)),
        )
      },
      reorderSelected: (dir) => {
        const ids = get().selection
        if (ids.length) commitNodes((nodes) => reorder(nodes, ids, dir))
      },
      setLayerOrder: (ids) =>
        commitNodes((nodes) => {
          if (ids.length !== nodes.length) return nodes
          const byId = new Map(nodes.map((n) => [n.id, n]))
          const next = [...ids].reverse().map((id) => byId.get(id))
          if (next.some((n) => !n)) return nodes
          const ordered = next as DesignNode[]
          if (ordered.every((n, i) => n.id === nodes[i].id)) return nodes
          return ordered
        }),

      startEditing: (id) => {
        const node = sideNodes().find((n) => n.id === id)
        if (node && node.type === 'text' && !node.locked) set({ editingTextId: id, selection: [id] })
      },
      stopEditing: () => set((s) => (s.editingTextId ? { editingTextId: null } : s)),
      setGuides: (guides) =>
        set((s) => (sameList(s.guides.v, guides.v) && sameList(s.guides.h, guides.h) ? s : { guides })),

      undo: () =>
        set((s) => {
          const history = undoHistory(s.history)
          if (history === s.history) return s
          return { history, selection: prune(s.selection, history.present.sides[s.activeSide]) }
        }),
      redo: () =>
        set((s) => {
          const history = redoHistory(s.history)
          if (history === s.history) return s
          return { history, selection: prune(s.selection, history.present.sides[s.activeSide]) }
        }),

      setZoom: (zoom) => set({ zoom }),
      zoomIn: () => {
        const current = zoomValue(get().zoom)
        const next = ZOOM_STEPS.find((z) => z > current + 0.001)
        set({ zoom: next ?? clampZoom(current * 1.25) })
      },
      zoomOut: () => {
        const current = zoomValue(get().zoom)
        const prev = [...ZOOM_STEPS].reverse().find((z) => z < current - 0.001)
        set({ zoom: prev ?? clampZoom(current / 1.25) })
      },
    }
  })
}

export type EditorStore = ReturnType<typeof createEditorStore>
