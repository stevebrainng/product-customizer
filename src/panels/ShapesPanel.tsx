import { useMemo, useState } from 'react'
import { LibraryDrag } from '@/dnd/LibraryDrag'
import { SHAPE_CATALOG, SHAPE_CATEGORIES } from '@/data/shapes'
import { LibraryGrid } from '@/ui/LibraryGrid'
import { SearchInput } from '@/ui/SearchInput'
import { Chip } from '@/ui/Chip'
import { EmptyState } from '@/ui/EmptyState'
import { ShapeGlyph } from './Glyphs'
import { PresetTile } from './library/PresetTile'
import { usePlacePreset } from './library/usePlacePreset'

export function ShapesPanel() {
  const place = usePlacePreset()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof SHAPE_CATEGORIES)[number]['id']>('all')

  const shapes = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SHAPE_CATALOG.filter((s) => {
      if (category !== 'all' && s.category !== category) return false
      if (!q) return true
      return s.label.toLowerCase().includes(q) || s.kind.includes(q)
    })
  }, [query, category])

  return (
    <div className="space-y-4">
      <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search shapes" />
      <div className="flex flex-wrap gap-1.5">
        {SHAPE_CATEGORIES.map((c) => (
          <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>
      {shapes.length > 0 ? (
        <LibraryGrid>
          {shapes.map((s) => (
            <LibraryDrag
              key={s.id}
              id={`shape-${s.id}`}
              data={{ kind: 'preset', preset: s.preset, preview: { label: s.label } }}
            >
              <PresetTile label={`Add ${s.label}`} onPlace={() => place(s.preset)}>
                <ShapeGlyph kind={s.kind} />
              </PresetTile>
            </LibraryDrag>
          ))}
        </LibraryGrid>
      ) : (
        <div className="grid place-items-center pt-8">
          <EmptyState title="No shapes match" />
        </div>
      )}
    </div>
  )
}
