import { useCallback, useEffect, useRef } from 'react'
import type { SideId } from '@/engine'
import { useEditorStore, useEditorRuntime } from '@/engine'
import {
  buildDraft,
  draftIdFromUrl,
  listCartLines,
  loadDraft,
  readLastDraftId,
  saveCartLine,
  saveDraft,
  storedToAssetMap,
  writeLastDraftId,
} from './persist'
import { useCustomizerStore } from './CustomizerProvider'
import { quote } from './quote'
import type { CheckoutProduct, CustomizationDraft, CustomizationLine, ProductCustomizerProps } from './types'

export function resolveDraftId(explicit?: string): string {
  return explicit || draftIdFromUrl() || readLastDraftId() || crypto.randomUUID()
}

/** Load draft once, autosave design + selection, expose save / cart helpers. */
export function useDraftPersistence(
  product: CheckoutProduct,
  callbacks: Pick<ProductCustomizerProps, 'draftId' | 'onSave' | 'onAddToCart' | 'onCheckout'>,
) {
  const editor = useEditorStore()
  const runtime = useEditorRuntime()
  const chrome = useCustomizerStore()
  const loaded = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flush = useCallback(async (): Promise<CustomizationDraft> => {
    const state = editor.getState()
    const selection = chrome.getState().selection
    const draft = await buildDraft({
      id: chrome.getState().draftId,
      productId: product.id,
      selection,
      doc: state.history.present,
      assets: state.assets,
      activeSide: state.activeSide,
    })
    chrome.getState().setSaving(true)
    try {
      await saveDraft(draft)
      writeLastDraftId(draft.id)
      callbacks.onSave?.(draft)
      return draft
    } finally {
      chrome.getState().setSaving(false)
    }
  }, [callbacks, chrome, editor, product.id])

  const schedule = useCallback(() => {
    if (!chrome.getState().ready) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      void flush().catch(() => {
        /* autosave best-effort */
      })
    }, 600)
  }, [chrome, flush])

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    const id = resolveDraftId(callbacks.draftId)
    chrome.getState().setDraftId(id)
    writeLastDraftId(id)
    if (typeof history !== 'undefined' && !draftIdFromUrl()) {
      const url = new URL(location.href)
      url.searchParams.set('draft', id)
      history.replaceState(null, '', url.pathname + url.search)
    }

    void (async () => {
      try {
        const existing = await loadDraft(id)
        if (existing && existing.productId === product.id) {
          const assets = await storedToAssetMap(existing.assets)
          editor.getState().loadSnapshot({
            doc: existing.doc,
            assets,
            colorId: existing.selection.colorId,
            side: existing.activeSide,
          })
          chrome.getState().setSelection(existing.selection)
        } else if (product.spec.colors[0]) {
          editor.getState().setColor(product.spec.colors[0].id)
        }
        const cart = await listCartLines()
        chrome.getState().setCartCount(cart.length)
      } finally {
        chrome.getState().setReady(true)
      }
    })()
  }, [callbacks.draftId, chrome, editor, product.id, product.spec.colors])

  useEffect(() => {
    const unsubEditor = editor.subscribe(schedule)
    const unsubChrome = chrome.subscribe((s, prev) => {
      if (s.selection !== prev.selection) schedule()
    })
    return () => {
      unsubEditor()
      unsubChrome()
      if (timer.current) clearTimeout(timer.current)
    }
  }, [chrome, editor, schedule])

  const buildLine = useCallback(async (): Promise<CustomizationLine> => {
    const draft = await flush()
    const selection = chrome.getState().selection
    const q = quote(product, selection)
    const previews: CustomizationLine['previews'] = {}
    const state = editor.getState()
    const prevSide = state.activeSide
    for (const side of ['front', 'back'] as SideId[]) {
      if (state.history.present.sides[side].length === 0) continue
      try {
        state.setActiveSide(side)
        // Allow Konva to swap the active side before rasterizing.
        await new Promise((r) => requestAnimationFrame(() => r(undefined)))
        previews[side] = runtime.toDataURL({ widthPx: 480, mimeType: 'image/png' })
      } catch {
        /* stage may be empty / unmounted */
      }
    }
    state.setActiveSide(prevSide)

    return {
      customizationId: draft.id,
      productId: product.id,
      productName: product.name,
      selection,
      quote: q,
      previews: Object.keys(previews).length ? previews : undefined,
    }
  }, [chrome, editor, flush, product, runtime])

  const addToCart = useCallback(async () => {
    const line = await buildLine()
    await saveCartLine(line)
    const cart = await listCartLines()
    chrome.getState().setCartCount(cart.length)
    callbacks.onAddToCart?.(line)
    return line
  }, [buildLine, callbacks, chrome])

  const checkout = useCallback(async () => {
    const line = await buildLine()
    await saveCartLine(line)
    const cart = await listCartLines()
    chrome.getState().setCartCount(cart.length)
    callbacks.onCheckout?.(line)
    return line
  }, [buildLine, callbacks, chrome])

  return { flush, addToCart, checkout }
}
