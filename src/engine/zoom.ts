export const ZOOM_MIN = 0.15
export const ZOOM_MAX = 5

export const clampZoom = (zoom: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom))
