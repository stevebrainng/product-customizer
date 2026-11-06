import { useCallback, useEffect, useRef } from 'react'
import { useEditorStore, useEditorRuntime } from '@/engine'
import {
  buildDraft,
  draftIdFromUrl,
  listCartLines,
  loadDraft,
  readLastDraftId,
  saveCartLine,
  saveDraft,
  savePreview,
  storedToAssetMap,
  writeLastDraftId,
} from './persist'
import { applyColorway } from '@/shop/catalog'
import { previewSide, renderCustomizedMockup } from '@/shop/mockupPreview'
import { colorFromSearch, quantitiesFromSearch } from '@/shop/order'
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
        const urlColor = colorFromSearch()
        const urlQty = quantitiesFromSearch()
        if (existing && existing.productId === product.id) {
          const assets = await storedToAssetMap(existing.assets)
          const selection = {
            ...existing.selection,
            ...(urlColor ? { colorId: urlColor } : {}),
            ...(urlQty ? { quantities: urlQty } : {}),
          }
          editor.getState().loadSnapshot({
            doc: existing.doc,
            assets,
            colorId: selection.colorId,
            side: existing.activeSide,
          })
          chrome.getState().setSelection(selection)
          applyColorway(editor.getState(), product, selection.colorId)
        } else {
          const selection = chrome.getState().selection
          applyColorway(editor.getState(), product, urlColor ?? selection.colorId)
          if (urlQty) chrome.getState().setSelection({ ...selection, quantities: urlQty, ...(urlColor ? { colorId: urlColor } : {}) })
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
    const side = previewSide(editor)
    const previous = editor.getState().activeSide
    try {
      const image = await renderCustomizedMockup(editor, runtime, side)
      await savePreview(draft.id, image)
    } finally {
      if (editor.getState().activeSide !== previous) editor.getState().setActiveSide(previous)
    }

    return {
      customizationId: draft.id,
      productId: product.id,
      productName: product.name,
      selection,
      quote: q,
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
