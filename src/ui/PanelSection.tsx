import type { ReactNode } from 'react'

export function PanelSection({
  title,
  total,
  actions,
  onMore,
  children,
}: {
  title: string
  total?: number
  actions?: ReactNode
  onMore?: () => void
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <header className="flex items-center gap-3">
        <h3 className="text-[14px] font-semibold">{title}</h3>
        {actions}
        {onMore && (
          <button
            type="button"
            onClick={onMore}
            className="ml-auto pr-2 text-[14px] text-muted-foreground hover:text-ink"
          >
            {total !== undefined ? `More (${total})` : 'More'}
          </button>
        )}
      </header>
      {children}
    </section>
  )
}
