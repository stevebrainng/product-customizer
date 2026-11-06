import type { Asset, DesignDoc, SideId } from '@/engine'
import type { CheckoutSelection, CustomizationDraft, CustomizationLine, StoredAsset } from './types'

const DB_NAME = 'product-customizer'
const DB_VERSION = 3
const DRAFTS = 'drafts'
const CART = 'cart'
const PREVIEWS = 'previews'
export const LAST_DRAFT_KEY = 'customizer:lastDraftId'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(DRAFTS)) db.createObjectStore(DRAFTS, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(CART)) db.createObjectStore(CART, { keyPath: 'customizationId' })
      if (!db.objectStoreNames.contains(PREVIEWS)) db.createObjectStore(PREVIEWS, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'))
    req.onblocked = () => reject(new Error('Close other tabs using the customizer, then try again'))
  })
}

function idbReq<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'))
  })
}

export function readLastDraftId(): string | null {
  try {
    return localStorage.getItem(LAST_DRAFT_KEY)
  } catch {
    return null
  }
}

export function writeLastDraftId(id: string) {
  try {
    localStorage.setItem(LAST_DRAFT_KEY, id)
  } catch {
    /* private mode / quota */
  }
}

export function draftIdFromUrl(search = typeof location !== 'undefined' ? location.search : ''): string | null {
  const id = new URLSearchParams(search).get('draft')
  return id && id.trim() ? id.trim() : null
}

export async function assetToStored(asset: Asset): Promise<StoredAsset> {
  const res = await fetch(asset.src)
  const blob = await res.blob()
  return {
    id: asset.id,
    name: asset.name,
    width: asset.width,
    height: asset.height,
    source: asset.source,
    attribution: asset.attribution,
    blob,
  }
}

export async function storedToAsset(stored: StoredAsset): Promise<Asset> {
  return {
    id: stored.id,
    name: stored.name,
    width: stored.width,
    height: stored.height,
    source: stored.source,
    attribution: stored.attribution,
    src: URL.createObjectURL(stored.blob),
  }
}

export async function assetsToStored(assets: Record<string, Asset>): Promise<StoredAsset[]> {
  return Promise.all(Object.values(assets).map(assetToStored))
}

export async function storedToAssetMap(stored: StoredAsset[]): Promise<Record<string, Asset>> {
  const entries = await Promise.all(stored.map(async (a) => [a.id, await storedToAsset(a)] as const))
  return Object.fromEntries(entries)
}

export async function saveDraft(draft: CustomizationDraft): Promise<void> {
  const db = await openDb()
  try {
    await idbReq(db.transaction(DRAFTS, 'readwrite').objectStore(DRAFTS).put(draft))
    writeLastDraftId(draft.id)
  } finally {
    db.close()
  }
}

export async function loadDraft(id: string): Promise<CustomizationDraft | null> {
  const db = await openDb()
  try {
    const row = await idbReq(db.transaction(DRAFTS, 'readonly').objectStore(DRAFTS).get(id))
    return (row as CustomizationDraft | undefined) ?? null
  } finally {
    db.close()
  }
}

export async function saveCartLine(line: CustomizationLine): Promise<void> {
  const db = await openDb()
  try {
    await idbReq(db.transaction(CART, 'readwrite').objectStore(CART).put(line))
  } finally {
    db.close()
  }
}

export async function savePreview(id: string, image: Blob): Promise<void> {
  const db = await openDb()
  try {
    await idbReq(db.transaction(PREVIEWS, 'readwrite').objectStore(PREVIEWS).put({ id, image }))
  } finally {
    db.close()
  }
}

export async function loadPreview(id: string): Promise<Blob | null> {
  const db = await openDb()
  try {
    const row = await idbReq(db.transaction(PREVIEWS, 'readonly').objectStore(PREVIEWS).get(id))
    const image = (row as { image?: Blob } | undefined)?.image
    return image ?? null
  } finally {
    db.close()
  }
}

export async function listCartLines(): Promise<CustomizationLine[]> {
  const db = await openDb()
  try {
    const rows = await idbReq(db.transaction(CART, 'readonly').objectStore(CART).getAll())
    return (rows as CustomizationLine[]) ?? []
  } finally {
    db.close()
  }
}

export async function buildDraft(input: {
  id: string
  productId: string
  selection: CheckoutSelection
  doc: DesignDoc
  assets: Record<string, Asset>
  activeSide: SideId
}): Promise<CustomizationDraft> {
  return {
    version: 1,
    id: input.id,
    productId: input.productId,
    updatedAt: Date.now(),
    selection: input.selection,
    doc: input.doc,
    assets: await assetsToStored(input.assets),
    activeSide: input.activeSide,
  }
}
