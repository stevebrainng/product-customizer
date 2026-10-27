import { useEffect, useState } from 'react'

/** Loads an HTMLImageElement for Konva. crossOrigin keeps the canvas export-safe. */
export function useImageElement(src?: string) {
  const [image, setImage] = useState<HTMLImageElement>()
  useEffect(() => {
    setImage(undefined)
    if (!src) return
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImage(img)
    img.src = src
    return () => { img.onload = null }
  }, [src])
  return image
}
