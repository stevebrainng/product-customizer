import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'
import type { ProductSpec } from '../types'
import { createEditorStore, type EditorState, type EditorStore } from '../store/editorStore'
import { EditorRuntime } from '../runtime/EditorRuntime'

interface Engine { store: EditorStore; runtime: EditorRuntime }
const EngineContext = createContext<Engine | null>(null)

export function EditorProvider({ products, children }: { products: ProductSpec[]; children: ReactNode }) {
  const ref = useRef<Engine | null>(null)
  if (!ref.current) {
    const store = createEditorStore(products)
    ref.current = { store, runtime: new EditorRuntime(store) }
  }
  return <EngineContext.Provider value={ref.current}>{children}</EngineContext.Provider>
}

function useEngine() {
  const engine = useContext(EngineContext)
  if (!engine) throw new Error('Editor hooks must be used inside <EditorProvider>')
  return engine
}

/** Reactive selector: useEditor((s) => s.selection) */
export function useEditor<T>(selector: (state: EditorState) => T): T {
  return useStore(useEngine().store, selector)
}
/** Raw store for event handlers: useEditorStore().getState().updateNode(...) */
export const useEditorStore = () => useEngine().store
/** Stage-bound imperative API: export, fonts. */
export const useEditorRuntime = () => useEngine().runtime
