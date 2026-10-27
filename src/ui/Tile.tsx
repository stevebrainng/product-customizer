import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const SIZES = { md: 'size-[87px]', sm: 'size-16' } as const

/** Selectable asset tile used by every library row. */
export function Tile({
  size = 'md',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { size?: keyof typeof SIZES }) {
  return (
    <button
      type="button"
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-b from-tile-from to-tile-to',
        'transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        SIZES[size],
        className,
      )}
      {...rest}
    />
  )
}
