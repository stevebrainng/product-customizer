import { useRef, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

/** Horizontal tile row with a scroll chevron pinned to its right edge. */
export function ScrollRow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="relative">
      <div ref={ref} className="no-scrollbar flex gap-1 overflow-x-auto pr-3">
        {children}
      </div>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => ref.current?.scrollBy({ left: 180, behavior: 'smooth' })}
        className="absolute inset-y-0 right-0 grid w-4 place-items-center text-ink/70 hover:text-ink"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
