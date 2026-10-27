import type { SideId } from '@/engine/types'

/** Placeholder t-shirt (SVG). Swap for photographic mockups per product + side; the engine only needs a component. */
const outline = (neck: number) =>
  `M170,13 C150,25 100,45 63,70 Q25,140 5,223 L88,267 L101,227 C96,330 90,450 92,550
   C150,576 360,576 419,550 C417,450 411,330 403,237 L419,263 L507,223 Q487,140 447,70
   C410,45 360,25 339,13 Q255,${neck} 170,13 Z`

export function ProductMockup({ side }: { side: SideId }) {
  const neck = side === 'front' ? 111 : 40
  const innerDepth = side === 'front' ? 50 : 14

  return (
    <svg viewBox="0 0 507 580" className="size-full" role="img" aria-label={`T-shirt ${side}`}>
      <defs>
        <linearGradient id="shirt-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfbfb" />
          <stop offset="0.55" stopColor="#e4e4e5" />
          <stop offset="1" stopColor="#cbcbcc" />
        </linearGradient>
        <linearGradient id="shirt-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.2" />
          <stop offset="0.2" stopColor="#000" stopOpacity="0" />
          <stop offset="0.8" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="neck-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8c8c8e" />
          <stop offset="1" stopColor="#d9d9da" />
        </linearGradient>
      </defs>

      <path d={outline(neck)} fill="url(#shirt-v)" />
      <path d={outline(neck)} fill="url(#shirt-h)" />
      <path
        d={`M176,10 Q255,-2 333,10 Q326,${innerDepth} 255,${innerDepth + 2} Q184,${innerDepth} 176,10 Z`}
        fill="url(#neck-in)"
      />
      <path d={`M170,13 Q255,${neck} 339,13`} fill="none" stroke="#b4b4b6" strokeWidth="1.5" />
      <path d="M88,267 L101,227 M419,263 L403,237" stroke="#b9b9bb" strokeWidth="1.2" fill="none" />

    </svg>
  )
}
