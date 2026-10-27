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
  { id: 'poppins', label: 'Poppins', family: 'Poppins', category: 'sans' },
  { id: 'roboto', label: 'Roboto', family: 'Roboto', category: 'sans' },
  { id: 'nunito', label: 'Nunito', family: 'Nunito', category: 'sans' },
  { id: 'raleway', label: 'Raleway', family: 'Raleway', category: 'sans' },
  { id: 'outfit', label: 'Outfit', family: 'Outfit', category: 'sans' },
  { id: 'archivo', label: 'Archivo', family: 'Archivo', category: 'sans' },
  { id: 'oswald', label: 'Oswald', family: 'Oswald', category: 'sans' },
  { id: 'barlow-condensed', label: 'Barlow Condensed', family: 'Barlow Condensed', category: 'sans' },
  { id: 'playfair', label: 'Playfair Display', family: 'Playfair Display', category: 'serif' },
  { id: 'merriweather', label: 'Merriweather', family: 'Merriweather', category: 'serif' },
  { id: 'lora', label: 'Lora', family: 'Lora', category: 'serif' },
  { id: 'cormorant', label: 'Cormorant Garamond', family: 'Cormorant Garamond', category: 'serif' },
  { id: 'bebas', label: 'Bebas Neue', family: 'Bebas Neue', category: 'display' },
  { id: 'anton', label: 'Anton', family: 'Anton', category: 'display' },
  { id: 'abril', label: 'Abril Fatface', family: 'Abril Fatface', category: 'display' },
  { id: 'bangers', label: 'Bangers', family: 'Bangers', category: 'display' },
  { id: 'lobster', label: 'Lobster', family: 'Lobster', category: 'display' },
  { id: 'pacifico', label: 'Pacifico', family: 'Pacifico', category: 'hand' },
  { id: 'dancing-script', label: 'Dancing Script', family: 'Dancing Script', category: 'hand' },
  { id: 'great-vibes', label: 'Great Vibes', family: 'Great Vibes', category: 'hand' },
  { id: 'permanent-marker', label: 'Permanent Marker', family: 'Permanent Marker', category: 'hand' },
  { id: 'roboto-mono', label: 'Roboto Mono', family: 'Roboto Mono', category: 'mono' },
  { id: 'space-mono', label: 'Space Mono', family: 'Space Mono', category: 'mono' },
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

const FALLBACK: Record<FontDef['category'], string> = {
  sans: 'sans-serif',
  serif: 'serif',
  display: 'sans-serif',
  hand: 'cursive',
  mono: 'monospace',
}

export function cssFontFamily(family: string): string {
  const bare = family.split(',')[0]?.trim().replace(/^["']|["']$/g, '') ?? family
  const quoted = /\s/.test(bare) ? `"${bare}"` : bare
  return `${quoted}, ${FALLBACK[findFont(bare)?.category ?? 'sans']}`
}
