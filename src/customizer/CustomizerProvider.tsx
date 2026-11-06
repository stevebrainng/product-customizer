import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'
import { createCustomizerStore, type CustomizerChromeState, type CustomizerStore } from './store'
import type { CheckoutSelection } from './types'

const Ctx = createContext<CustomizerStore | null>(null)

export function CustomizerProvider({
  draftId,
  selection,
  children,
}: {
  draftId: string
  selection: CheckoutSelection
  children: ReactNode
}) {
  const ref = useRef<CustomizerStore | null>(null)
  if (!ref.current) ref.current = createCustomizerStore({ draftId, selection })
  return <Ctx.Provider value={ref.current}>{children}</Ctx.Provider>
}

export function useCustomizer<T>(selector: (s: CustomizerChromeState) => T): T {
  const store = useContext(Ctx)
  if (!store) throw new Error('useCustomizer must be used inside <CustomizerProvider>')
  return useStore(store, selector)
}

export function useCustomizerStore(): CustomizerStore {
  const store = useContext(Ctx)
  if (!store) throw new Error('useCustomizerStore must be used inside <CustomizerProvider>')
  return store
}
