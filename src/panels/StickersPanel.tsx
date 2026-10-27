import { useMemo, useState } from 'react'
import { LibraryDrag } from '@/dnd/LibraryDrag'
import { STICKER_CATALOG, STICKER_PACKS } from '@/data/stickers'
import { LibraryGrid } from '@/ui/LibraryGrid'
import { SearchInput } from '@/ui/SearchInput'
import { Chip } from '@/ui/Chip'
import { EmptyState } from '@/ui/EmptyState'
import { PresetTile } from './library/PresetTile'
import { usePlacePreset } from './library/usePlacePreset'

export function StickersPanel() {
  const place = usePlacePreset()
  const [query, setQuery] = useState('')
  const [packId, setPackId] = useState<string>('all')

  const stickers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return STICKER_CATALOG.filter((s) => {
      if (packId !== 'all' && s.packId !== packId) return false
      if (!q) return true
      const pack = STICKER_PACKS.find((p) => p.id === s.packId)
      return s.emoji.includes(q) || (pack?.label.toLowerCase().includes(q) ?? false)
    })
  }, [query, packId])

  return (
    <div className="space-y-4">
      <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search stickers" />
      <div className="flex flex-wrap gap-1.5">
        <Chip active={packId === 'all'} onClick={() => setPackId('all')}>All</Chip>
        {STICKER_PACKS.map((p) => (
          <Chip key={p.id} active={packId === p.id} onClick={() => setPackId(p.id)}>
            {p.label}
          </Chip>
        ))}
      </div>
      {stickers.length > 0 ? (
        <LibraryGrid>
          {stickers.map((s) => (
            <LibraryDrag
              key={s.id}
              id={`sticker-${s.id}`}
              data={{ kind: 'preset', preset: s.preset, preview: { label: s.emoji, emoji: s.emoji } }}
            >
              <PresetTile label={`Add ${s.emoji}`} size="sm" onPlace={() => place(s.preset)}>
                <span className="text-[34px] leading-none">{s.emoji}</span>
              </PresetTile>
            </LibraryDrag>
          ))}
        </LibraryGrid>
      ) : (
        <div className="grid place-items-center pt-8">
          <EmptyState title="No stickers match" />
        </div>
      )}
    </div>
  )
}
