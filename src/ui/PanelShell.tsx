import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { IconButton } from './Button'

/** Shared chrome for the left tool panel and the right product panel. */
export function PanelShell({
  title, edge, onClose, children,
}: { title: string; edge: 'left' | 'right'; onClose: () => void; children: ReactNode }) {
  return (
    <aside
      aria-label={title}
      className={cn(
        'flex w-[300px] shrink-0 flex-col border-line bg-canvas',
        edge === 'left' ? 'border-r' : 'border-l',
      )}
    >
      <header className="flex h-[58px] shrink-0 items-center justify-between px-3 pl-4">
        <h2 className="text-[17px] font-semibold">{title}</h2>
        <IconButton icon={X} label="Close panel" onClick={onClose} />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto border-t border-line px-3 py-3">{children}</div>
    </aside>
  )
}
