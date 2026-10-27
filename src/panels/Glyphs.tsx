import type { ShapeKind } from '@/data/shapes'

export function ShapeGlyph({ kind }: { kind: ShapeKind }) {
  return (
    <svg viewBox="0 0 48 48" className="size-12" aria-hidden>
      {kind === 'square' && <rect x="6" y="6" width="36" height="36" fill="#111" />}
      {kind === 'rounded' && <rect x="6" y="6" width="36" height="36" rx="10" fill="#111" />}
      {kind === 'circle' && <circle cx="24" cy="24" r="18" fill="#111" />}
      {kind === 'line' && <line x1="8" y1="40" x2="40" y2="8" stroke="#111" strokeWidth="4" strokeLinecap="round" />}
      {kind === 'triangle' && <polygon points="24,6 42,40 6,40" fill="#111" />}
      {kind === 'pentagon' && <polygon points="24,5 43,19 36,42 12,42 5,19" fill="#111" />}
      {kind === 'hexagon' && <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" fill="#111" />}
      {kind === 'octagon' && <polygon points="16,5 32,5 43,16 43,32 32,43 16,43 5,32 5,16" fill="#111" />}
    </svg>
  )
}
