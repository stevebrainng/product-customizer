import { createStore } from 'zustand/vanilla'

export type ToolId = 'elements' | 'uploads' | 'images' | 'text' | 'shapes' | 'stickers' | 'layers'

/** Chrome-only UI state. Document, selection, history and viewport live in the engine store. */
export interface DesignerState {
  activeTool: ToolId | null
  rightPanelOpen: boolean
  toggleRightPanel: () => void
  setRightPanelOpen: (open: boolean) => void
  toggleTool: (id: ToolId) => void
  openTool: (id: ToolId) => void
  closePanel: () => void
}

export const createDesignerStore = (initial?: Partial<DesignerState>) =>
  createStore<DesignerState>()((set, get) => ({
    activeTool: null,
    rightPanelOpen: true,
    toggleRightPanel: () => set({ rightPanelOpen: !get().rightPanelOpen }),
    setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
    toggleTool: (id) => set({ activeTool: get().activeTool === id ? null : id }),
    openTool: (id) => set({ activeTool: id }),
    closePanel: () => set({ activeTool: null }),
    ...initial,
  }))

export type DesignerStore = ReturnType<typeof createDesignerStore>
