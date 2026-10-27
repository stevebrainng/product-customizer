import type { ReactNode } from 'react'
import { Tile } from '@/ui/Tile'

export function PresetTile({
  label,
  onPlace,
  children,
  size = 'md',
}: {
  label: string
  onPlace: () => void
  children: ReactNode
  size?: 'md' | 'sm'
}) {
  return (
    <Tile size={size} aria-label={label} onClick={onPlace}>
      {children}
    </Tile>
  )
}
