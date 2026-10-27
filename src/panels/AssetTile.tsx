import type { Asset } from '@/engine'
import { useEditor } from '@/engine'
import { LibraryDrag } from '@/dnd/LibraryDrag'
import { cn } from '@/lib/cn'
import { Tile } from '@/ui/Tile'

/** Uploaded image; click or drag it onto the active side. */
export function AssetTile({ asset, className }: { asset: Asset; className?: string }) {
  const addImageNode = useEditor((s) => s.addImageNode)
  return (
    <LibraryDrag
      id={`asset-${asset.id}`}
      className="min-w-0"
      data={{ kind: 'asset', assetId: asset.id, preview: { label: asset.name, imageUrl: asset.src } }}
    >
      <Tile aria-label={`Add ${asset.name}`} className={cn(className, 'w-full')} onClick={() => addImageNode(asset.id)}>
        <img src={asset.src} alt="" className="size-full object-contain p-2" draggable={false} />
      </Tile>
    </LibraryDrag>
  )
}
