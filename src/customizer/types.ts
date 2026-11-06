import type { Asset, DesignDoc, ProductSpec, SideId } from '@/engine'

/** Decoration a host store can sell for this SKU. */
export type DesignStyle = 'printed' | 'embroidered'

/**
 * Catalog product for the in-checkout customizer.
 * Commerce fields stay here; `spec` is the engine mockup/print-area config.
 */
export interface CheckoutProduct {
  id: string
  name: string
  currency: string
  /** Base unit price before style surcharge. */
  unitPrice: number
  /** Extra per unit for each decoration style. */
  styleSurcharges: Record<DesignStyle, number>
  /** Engine product: world, sides, colors, sizes. */
  spec: ProductSpec
}

/** Buyer choices that are not part of the canvas document. */
export interface CheckoutSelection {
  style: DesignStyle
  colorId: string | null
  /** Units per size key from `product.spec.sizes`. */
  quantities: Record<string, number>
  note: string
}

/** Asset bytes stored in IndexedDB (object URLs are rebuilt on load). */
export interface StoredAsset {
  id: string
  name: string
  width: number
  height: number
  source?: Asset['source']
  attribution?: Asset['attribution']
  blob: Blob
}

/**
 * Anonymous draft that survives a browser restart.
 * Versioned so a host can migrate older records later.
 */
export interface CustomizationDraft {
  version: 1
  id: string
  productId: string
  updatedAt: number
  selection: CheckoutSelection
  doc: DesignDoc
  assets: StoredAsset[]
  activeSide: SideId
}

export interface Quote {
  unitPrice: number
  styleSurcharge: number
  quantity: number
  lineTotal: number
  currency: string
}

/** Line item handed to Add to cart / Checkout. */
export interface CustomizationLine {
  customizationId: string
  productId: string
  productName: string
  selection: CheckoutSelection
  quote: Quote
  /** Optional print-area data URLs keyed by side. */
  previews?: Partial<Record<SideId, string>>
}

export type CustomizerPanelId = 'product' | 'images' | 'text'

export interface ProductCustomizerProps {
  product: CheckoutProduct
  /** Resume a saved draft; when omitted, uses `?draft=` or the last local draft id. */
  draftId?: string
  onSave?: (draft: CustomizationDraft) => void
  onAddToCart?: (line: CustomizationLine) => void
  onCheckout?: (line: CustomizationLine) => void
  onChangeProduct?: () => void
}
