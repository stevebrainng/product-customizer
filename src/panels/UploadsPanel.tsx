import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useAssetUpload, useEditor } from '@/engine'
import { SearchInput } from '@/ui/SearchInput'
import { Button } from '@/ui/Button'
import { EmptyState } from '@/ui/EmptyState'
import { AssetTile } from './AssetTile'

const SKELETON = [88, 150, 106, 88, 120, 100]

export function UploadsPanel() {
  const upload = useAssetUpload()
  const assetMap = useEditor((s) => s.assets)
  const assets = useMemo(() => Object.values(assetMap), [assetMap])

  return (
    <div className="space-y-3">
      <SearchInput />
      {assets.length > 0 ? (
        <>
          <Button onClick={upload}>
            <Plus data-icon="inline-start" /> Add File
          </Button>
          <div className="grid grid-cols-3 gap-1">
            {assets.map((a) => (
              <AssetTile key={a.id} asset={a} className="aspect-square size-auto" />
            ))}
          </div>
        </>
      ) : (
        <div className="relative">
          <div
            aria-hidden
            className="columns-2 gap-2 [mask-image:linear-gradient(to_bottom,#000_20%,transparent_95%)]"
          >
            {SKELETON.map((h, i) => (
              <div key={i} className="mb-2 rounded-xl bg-black/[0.05]" style={{ height: h }} />
            ))}
          </div>
          <div className="absolute inset-x-0 top-[26%] grid place-items-center">
            <EmptyState>
              <Button onClick={upload}>
                <Plus data-icon="inline-start" /> Add File
              </Button>
            </EmptyState>
          </div>
        </div>
      )}
    </div>
  )
}
