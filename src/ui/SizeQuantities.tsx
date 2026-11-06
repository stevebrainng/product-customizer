import { useState, type ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Size tiles plus one stepper for the selected size.
 * `page` matches a store product block; `compact` is the same idea for a narrow sidebar.
 */
export function SizeQuantities({
  sizes,
  quantities,
  onChange,
  layout = 'page',
  action,
}: {
  sizes: string[]
  quantities: Record<string, number>
  onChange: (size: string, qty: number) => void
  layout?: 'page' | 'compact'
  action?: ReactNode
}) {
  const [active, setActive] = useState(
    () => sizes.find((size) => (quantities[size] ?? 0) > 0) ?? sizes[0] ?? '',
  )
  const current = sizes.includes(active) ? active : sizes[0]
  const qty = Math.max(0, quantities[current] ?? 0)
  const compact = layout === 'compact'

  return (
    <div>
      <div className={cn('grid gap-1.5', compact ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-4')}>
        {sizes.map((size) => {
          const count = Math.max(0, quantities[size] ?? 0)
          const selected = size === current
          return (
            <button
              key={size}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(size)}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-md border bg-white font-medium text-zinc-950',
                compact ? 'h-9 text-[12px]' : 'h-12 text-sm',
                selected ? 'border-2 border-zinc-950' : 'border-zinc-200 hover:border-zinc-400',
                count === 0 && !selected && 'text-zinc-700',
              )}
            >
              <span className="leading-none">{size}</span>
              {count > 0 && (
                <div className="absolute top-1 right-2 bg-primary rounded-full size-4 flex items-center justify-center">
                  <span className={cn('leading-none text-white', compact ? 'text-[10px]' : 'text-[11px]')}>
                    {count}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className={cn('flex items-center gap-2', compact ? 'mt-2' : 'mt-3')}>
        <div
          className={cn(
            'inline-flex shrink-0 items-center rounded-lg border border-zinc-200 bg-white',
            compact ? 'h-8' : 'h-12',
          )}
        >
          <button
            type="button"
            aria-label={`Decrease ${current}`}
            disabled={qty === 0}
            onClick={() => onChange(current, qty - 1)}
            className={cn(
              'grid place-items-center text-zinc-800 disabled:opacity-30',
              compact ? 'size-8' : 'size-12',
            )}
          >
            <Minus className={compact ? 'size-3.5' : 'size-4'} strokeWidth={2.25} />
          </button>
          <span className={cn('text-center font-medium tabular-nums', compact ? 'w-4 text-[13px]' : 'w-5 text-sm')}>
            {qty}
          </span>
          <button
            type="button"
            aria-label={`Increase ${current}`}
            onClick={() => onChange(current, qty + 1)}
            className={cn(
              'grid place-items-center text-zinc-800',
              compact ? 'size-8' : 'size-12',
            )}
          >
            <Plus className={compact ? 'size-3.5' : 'size-4'} strokeWidth={2.25} />
          </button>
        </div>
        {action}
        {compact && <span className="text-[12px] text-zinc-500">{current}</span>}
      </div>
    </div>
  )
}
