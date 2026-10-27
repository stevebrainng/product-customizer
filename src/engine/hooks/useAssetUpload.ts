import { useCallback } from 'react'
import type { Asset } from '../types'
import { createId } from '../nodes'
import { useEditorStore } from '../provider/EditorProvider'

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

async function readAsset(file: File): Promise<Asset> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)
  return { id: createId('asset'), name: file.name, src, width: img.naturalWidth || 300, height: img.naturalHeight || 300 }
}

/** Returns a function that opens the file picker and registers chosen images as assets. */
export function useAssetUpload() {
  const store = useEditorStore()
  return useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/jpeg,image/webp,image/svg+xml'
    input.multiple = true
    input.onchange = async () => {
      for (const file of Array.from(input.files ?? [])) {
        try {
          store.getState().addAsset(await readAsset(file))
        } catch {
          /* unreadable file: skip */
        }
      }
    }
    input.click()
  }, [store])
}
