import type Konva from 'konva'
import { selectProduct, type EditorStore } from '../store/editorStore'

export interface ExportOptions {
  /** Output width in pixels of the print area. Height follows the print-area aspect ratio. */
  widthPx?: number
  mimeType?: 'image/png' | 'image/jpeg'
  quality?: number
}

/** Browsers cap canvas size (notably mobile Safari), so exports are clamped to this edge length. */
const MAX_EDGE_PX = 8192

/**
 * Imperative, non-serialisable side of the engine: owns the Konva stage reference and
 * everything that needs it (export today; snapshots, thumbnails, zoom-to-node later).
 * Kept out of the store so the document stays plain data.
 */
export class EditorRuntime {
  stage: Konva.Stage | null = null

  constructor(private readonly store: EditorStore) {}

  setStage = (stage: Konva.Stage | null) => {
    this.stage = stage
  }

  /** Renders the active side's print area at print resolution, without selection UI or the mockup. */
  toDataURL({ widthPx = 2400, mimeType = 'image/png', quality }: ExportOptions = {}): string {
    const stage = this.stage
    if (!stage) throw new Error('Stage is not mounted')
    const state = this.store.getState()
    const product = selectProduct(state)
    const { printArea: pa } = product.sides[state.activeSide]

    const edge = Math.min(widthPx, MAX_EDGE_PX, (MAX_EDGE_PX * pa.width) / pa.height)
    const pixelRatio = edge / pa.width

    const prev = { w: stage.width(), h: stage.height(), sx: stage.scaleX(), sy: stage.scaleY() }
    const overlay = stage.findOne('#overlay')
    const overlayWasVisible = overlay?.visible() ?? false

    overlay?.visible(false)
    stage.size(product.world)
    stage.scale({ x: 1, y: 1 })
    try {
      return stage.toDataURL({ x: pa.x, y: pa.y, width: pa.width, height: pa.height, pixelRatio, mimeType, quality })
    } finally {
      stage.size({ width: prev.w, height: prev.h })
      stage.scale({ x: prev.sx, y: prev.sy })
      overlay?.visible(overlayWasVisible)
      stage.batchDraw()
    }
  }

  async toBlob(options?: ExportOptions): Promise<Blob> {
    return (await fetch(this.toDataURL(options))).blob()
  }

  download(filename = 'design.png', options?: ExportOptions) {
    const a = document.createElement('a')
    a.download = filename
    a.href = this.toDataURL(options)
    a.click()
  }

  /** Canvas text only uses a web font once it is loaded, so request it up front and repaint. */
  async ensureFonts(fonts: string[]) {
    if (!document.fonts) return
    await Promise.all(fonts.map((f) => document.fonts.load(f).catch(() => [])))
    this.stage?.batchDraw()
  }
}
