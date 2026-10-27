import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Shared responsive tile grid for library panels. */
export function LibraryGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-3 gap-1.5', className)}>{children}</div>
}
