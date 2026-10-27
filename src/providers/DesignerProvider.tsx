import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'
import {
  createDesignerStore,
  type DesignerState,
  type DesignerStore,
} from '@/store/designerStore'

const DesignerContext = createContext<DesignerStore | null>(null)

export function DesignerProvider({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: Partial<DesignerState>
}) {
  const storeRef = useRef<DesignerStore | null>(null)
  if (!storeRef.current) {
    const narrow = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
    storeRef.current = createDesignerStore({
      ...(narrow ? { rightPanelOpen: false } : {}),
      ...initialState,
    })
  }
  return <DesignerContext.Provider value={storeRef.current}>{children}</DesignerContext.Provider>
}

/** Selector hook: useDesigner((s) => s.activeTool) */
export function useDesigner<T>(selector: (state: DesignerState) => T): T {
  const store = useContext(DesignerContext)
  if (!store) throw new Error('useDesigner must be used inside <DesignerProvider>')
  return useStore(store, selector)
}
