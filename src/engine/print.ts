import type { Size } from './types'

/** Print-ready raster: 300 pixels per inch of the print area. */
export const PRINT_DPI = 300
/** Physical width of the print area. Height follows its aspect ratio. */
export const PRINT_WIDTH_IN = 12

const MAX_EDGE_PX = 8192

export interface PrintSize {
  dpi: number
  widthIn: number
  heightIn: number
  widthPx: number
  heightPx: number
}

/**
 * Pixel size of the print area at `dpi`, clamped so the canvas stays within browser limits.
 * Inches are derived from the clamped pixels so the PDF stays at the requested DPI.
 */
export function printSize(area: Size, widthIn = PRINT_WIDTH_IN, dpi = PRINT_DPI): PrintSize {
  const heightIn = widthIn * (area.height / Math.max(area.width, 1))
  let widthPx = Math.max(1, Math.round(widthIn * dpi))
  let heightPx = Math.max(1, Math.round(heightIn * dpi))
  const edge = Math.max(widthPx, heightPx)
  if (edge > MAX_EDGE_PX) {
    const k = MAX_EDGE_PX / edge
    widthPx = Math.max(1, Math.round(widthPx * k))
    heightPx = Math.max(1, Math.round(heightPx * k))
  }
  return { dpi, widthPx, heightPx, widthIn: widthPx / dpi, heightIn: heightPx / dpi }
}
