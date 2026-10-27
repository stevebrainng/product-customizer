import type { ReactNode } from 'react'

export function EmptyState({ title = 'No Elements', children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-[14px] text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}
