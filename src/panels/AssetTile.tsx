import type { Asset } from '@/engine'
import { useEditor } from '@/engine'
import { Tile } from '@/ui/Tile'

/** Uploaded image; click to place it on the active side. */
export function AssetTile({ asset, className }: { asset: Asset; className?: string }) {
  const addImageNode = useEditor((s) => s.addImageNode)
  return (
    <Tile aria-label={`Add ${asset.name}`} className={className} onClick={() => addImageNode(asset.id)}>
      <img src={asset.src} alt="" className="size-full object-contain p-2" draggable={false} />
    </Tile>
  )
}
