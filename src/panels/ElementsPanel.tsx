import { useMemo, useState } from 'react'
import { LibraryDrag } from '@/dnd/LibraryDrag'
import { FEATURED_STICKERS } from '@/data/stickers'
import { SHAPE_CATALOG } from '@/data/shapes'
import { TEXT_PRESETS } from '@/data/presets'
import { TEXT_TOTAL } from '@/data/catalog'
import { useImageLibrary } from '@/media'
import { useDesigner } from '@/providers/DesignerProvider'
import { PanelSection } from '@/ui/PanelSection'
import { ScrollRow } from '@/ui/ScrollRow'
import { SearchInput } from '@/ui/SearchInput'
import { Tile } from '@/ui/Tile'
import { ShapeGlyph } from './Glyphs'
import { PhotoTile } from './library/PhotoTile'
import { usePlaceLibraryPhoto } from './library/placeLibraryPhoto'
import { usePlacePreset } from './library/usePlacePreset'

const TEXT_TILES = [
  { id: 'title', label: 'title', node: TEXT_PRESETS.title },
  { id: 'fashion', label: 'fashion', node: TEXT_PRESETS.fashion },
  { id: 'box', label: 'box text', node: TEXT_PRESETS.box },
] as const

export function ElementsPanel() {
  const place = usePlacePreset()
  const openTool = useDesigner((s) => s.openTool)
  const lib = useImageLibrary()
  const placePhoto = usePlaceLibraryPhoto(lib.provider)
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const shapes = useMemo(
    () => SHAPE_CATALOG.filter((s) => !q || s.label.toLowerCase().includes(q)),
    [q],
  )
  const stickers = useMemo(
    () => FEATURED_STICKERS.filter((s) => !q || s.emoji.includes(query.trim())),
    [q, query],
  )
  const texts = TEXT_TILES.filter((t) => !q || t.label.includes(q))
  const photos = lib.photos.slice(0, 8)

  return (
    <div className="flex flex-col gap-5">
      <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search elements" />

      {lib.configured && photos.length > 0 && !q && (
        <PanelSection title="Images" onMore={() => openTool('images')}>
          <ScrollRow>
            {photos.map((photo) => (
              <LibraryDrag
                key={photo.id}
                id={`element-photo-${photo.id}`}
                className="w-[87px] shrink-0"
                data={{ kind: 'photo', photo, preview: { label: photo.photographer.name, imageUrl: photo.thumbUrl } }}
              >
                <PhotoTile photo={photo} onPlace={() => placePhoto(photo)} />
              </LibraryDrag>
            ))}
          </ScrollRow>
        </PanelSection>
      )}

      {texts.length > 0 && (
        <PanelSection
          title="Text"
          total={q ? undefined : TEXT_TOTAL}
          onMore={() => openTool('text')}
        >
          <ScrollRow>
            {texts.map((t) => (
              <LibraryDrag
                key={t.id}
                id={`element-text-${t.id}`}
                className="shrink-0"
                data={{ kind: 'preset', preset: t.node, edit: true, preview: { label: t.label } }}
              >
              <Tile aria-label={`Add ${t.label}`} onClick={() => place(t.node, { edit: true })}>
                {t.id === 'title' && <span className="text-[19px] font-extrabold tracking-tight">TITLE</span>}
                {t.id === 'fashion' && (
                  <span className="rounded-sm bg-emerald-50 px-1 text-[14px] font-light tracking-wide text-emerald-900">
                    FASHION
                  </span>
                )}
                {t.id === 'box' && (
                  <span className="w-[71px] bg-blue-200 px-1 py-1.5 text-center text-[7px] font-bold leading-[1.15] text-blue-950">
                    Text in a box. Not message in a bottle.
                  </span>
                )}
              </Tile>
              </LibraryDrag>
            ))}
          </ScrollRow>
        </PanelSection>
      )}

      {shapes.length > 0 && (
        <PanelSection
          title="Shapes"
          total={q ? undefined : SHAPE_CATALOG.length}
          onMore={() => openTool('shapes')}
        >
          <ScrollRow>
            {shapes.map((s) => (
              <LibraryDrag
                key={s.id}
                id={`element-shape-${s.id}`}
                className="shrink-0"
                data={{ kind: 'preset', preset: s.preset, preview: { label: s.label } }}
              >
                <Tile size="sm" aria-label={`Add ${s.label}`} onClick={() => place(s.preset)}>
                  <ShapeGlyph kind={s.kind} />
                </Tile>
              </LibraryDrag>
            ))}
          </ScrollRow>
        </PanelSection>
      )}

      {stickers.length > 0 && (
        <PanelSection
          title="Stickers"
          total={q ? undefined : FEATURED_STICKERS.length}
          onMore={() => openTool('stickers')}
        >
          <ScrollRow>
            {stickers.map((s) => (
              <LibraryDrag
                key={s.id}
                id={`element-sticker-${s.id}`}
                className="shrink-0"
                data={{ kind: 'preset', preset: s.preset, preview: { label: s.emoji, emoji: s.emoji } }}
              >
                <Tile size="sm" aria-label={`Add ${s.emoji}`} onClick={() => place(s.preset)}>
                  <span className="text-[34px] leading-none">{s.emoji}</span>
                </Tile>
              </LibraryDrag>
            ))}
          </ScrollRow>
        </PanelSection>
      )}
    </div>
  )
}
