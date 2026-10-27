import { selectActiveNodes, useEditor, type ImageFilter, type ImageNode } from '@/engine'
import { EditBar } from './editControls'
import { cn } from '@/lib/utils'

const FILTERS: { id: ImageFilter; label: string }[] = [
  { id: 'none', label: 'Original' },
  { id: 'grayscale', label: 'Gray' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'invert', label: 'Invert' },
  { id: 'blur', label: 'Blur' },
  { id: 'brighten', label: 'Bright' },
  { id: 'contrast', label: 'Contrast' },
]

const AMOUNT: Partial<Record<ImageFilter, { min: number; max: number; step: number; fallback: number }>> = {
  blur: { min: 0, max: 40, step: 1, fallback: 8 },
  brighten: { min: 0.2, max: 2, step: 0.05, fallback: 1.25 },
  contrast: { min: -100, max: 100, step: 1, fallback: 20 },
}

/** Konva.Filters on the selected image. Filters require the node to be cached. */
export function ImageToolbar() {
  const updateNode = useEditor((s) => s.updateNode)
  const node = useEditor((s) => {
    if (s.selection.length !== 1) return null
    const n = selectActiveNodes(s).find((x) => x.id === s.selection[0])
    return n?.type === 'image' && !n.locked ? n : null
  })
  if (!node) return null

  const filter = node.filter ?? 'none'
  const amount = AMOUNT[filter]
  const patch = (p: Partial<ImageNode>) => updateNode(node.id, p)

  return (
    <EditBar label="Image editing">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          aria-pressed={filter === f.id}
          onClick={() => patch({ filter: f.id, filterAmount: AMOUNT[f.id]?.fallback ?? 0 })}
          className={cn(
            'h-9 rounded-lg border px-2.5 text-sm',
            filter === f.id
              ? 'border-ring bg-secondary text-secondary-foreground'
              : 'border-transparent text-foreground hover:bg-muted',
          )}
        >
          {f.label}
        </button>
      ))}
      {amount && (
        <label className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
          Amount
          <input
            type="range"
            aria-label="Filter amount"
            min={amount.min}
            max={amount.max}
            step={amount.step}
            value={node.filterAmount ?? amount.fallback}
            onChange={(e) => patch({ filterAmount: Number(e.target.value) })}
            className="w-24 accent-primary"
          />
        </label>
      )}
    </EditBar>
  )
}
