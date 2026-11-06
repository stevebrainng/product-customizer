import { createStore } from 'zustand/vanilla'
import type { CheckoutSelection, CustomizerPanelId } from './types'

/** Chrome-only UI for the checkout customizer (separate from designer ToolId). */
export interface CustomizerChromeState {
  activePanel: CustomizerPanelId | null
  selection: CheckoutSelection
  draftId: string
  ready: boolean
  saving: boolean
  cartCount: number
  setPanel: (id: CustomizerPanelId | null) => void
  togglePanel: (id: CustomizerPanelId) => void
  setSelection: (patch: Partial<CheckoutSelection>) => void
  setQuantity: (size: string, qty: number) => void
  setDraftId: (id: string) => void
  setReady: (ready: boolean) => void
  setSaving: (saving: boolean) => void
  setCartCount: (n: number) => void
}

export const createCustomizerStore = (initial: {
  selection: CheckoutSelection
  draftId: string
}) =>
  createStore<CustomizerChromeState>()((set, get) => ({
    activePanel: 'product',
    selection: initial.selection,
    draftId: initial.draftId,
    ready: false,
    saving: false,
    cartCount: 0,
    setPanel: (activePanel) => set({ activePanel }),
    togglePanel: (id) => set({ activePanel: get().activePanel === id ? null : id }),
    setSelection: (patch) => set({ selection: { ...get().selection, ...patch } }),
    setQuantity: (size, qty) =>
      set({
        selection: {
          ...get().selection,
          quantities: { ...get().selection.quantities, [size]: Math.max(0, Math.floor(qty)) },
        },
      }),
    setDraftId: (draftId) => set({ draftId }),
    setReady: (ready) => set({ ready }),
    setSaving: (saving) => set({ saving }),
    setCartCount: (cartCount) => set({ cartCount }),
  }))

export type CustomizerStore = ReturnType<typeof createCustomizerStore>
