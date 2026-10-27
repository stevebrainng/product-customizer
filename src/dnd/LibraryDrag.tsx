import type { ReactNode } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/cn'
import type { LibraryDragData } from './types'

/** Pointer drag source. A short move starts the drag; a click still reaches the control inside. */
export function LibraryDrag({
  id,
  data,
  className,
  children,
}: {
  id: string
  data: LibraryDragData
  className?: string
  children: ReactNode
}) {
  const { setNodeRef, listeners, isDragging } = useDraggable({ id: `lib:${id}`, data })
  return (
    <div
      ref={setNodeRef}
      className={cn('[&_button]:cursor-grab [&_button]:active:cursor-grabbing', isDragging && 'opacity-40', className)}
      {...listeners}
    >
      {children}
    </div>
  )
}
