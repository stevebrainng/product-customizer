/** Curated fonts available in the designer. Values are CSS `font-family` names. */
export interface FontDef {
  id: string
  label: string
  family: string
  category: 'sans' | 'serif' | 'display' | 'hand' | 'mono'
}

export const FONTS: FontDef[] = [
  { id: 'inter', label: 'Inter', family: 'Inter', category: 'sans' },
  { id: 'montserrat', label: 'Montserrat', family: 'Montserrat', category: 'sans' },
  { id: 'oswald', label: 'Oswald', family: 'Oswald', category: 'sans' },
  { id: 'playfair', label: 'Playfair Display', family: 'Playfair Display', category: 'serif' },
  { id: 'bebas', label: 'Bebas Neue', family: 'Bebas Neue', category: 'display' },
  { id: 'pacifico', label: 'Pacifico', family: 'Pacifico', category: 'hand' },
  { id: 'roboto-mono', label: 'Roboto Mono', family: 'Roboto Mono', category: 'mono' },
]

export const DEFAULT_FONT_FAMILY = 'Inter'
export const FONT_SIZES = [16, 24, 32, 40, 48, 64, 80, 96] as const

export function findFont(family: string): FontDef | undefined {
  const bare = family.split(',')[0]?.trim().replace(/^["']|["']$/g, '') ?? family
  return FONTS.find((f) => f.family === bare || f.label === bare)
}

/** Specs for `document.fonts.load` — quote families that contain spaces. */
export function fontLoadSpecs(family: string, size = 48): string[] {
  const bare = family.split(',')[0]?.trim().replace(/^["']|["']$/g, '') ?? family
  const quoted = /\s/.test(bare) ? `"${bare}"` : bare
  return [`400 ${size}px ${quoted}`, `700 ${size}px ${quoted}`]
}

export function cssFontFamily(family: string): string {
  const bare = family.split(',')[0]?.trim().replace(/^["']|["']$/g, '') ?? family
  return /\s/.test(bare) ? `"${bare}", sans-serif` : `${bare}, sans-serif`
}
