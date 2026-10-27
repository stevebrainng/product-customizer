import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EditBar({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      className="pointer-events-auto absolute left-1/2 top-4 z-20 flex max-w-[min(960px,calc(100%-8rem))] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-xl border border-border bg-card/95 p-1.5 shadow-md backdrop-blur"
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </div>
  )
}

export function MiniNumber({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  wide,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (n: number) => void
  wide?: boolean
}) {
  return (
    <label className="flex items-center gap-1 px-1 text-xs text-muted-foreground">
      {label}
      <input
        type="number"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const n = e.currentTarget.valueAsNumber
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)))
        }}
        className={cn(
          'h-9 rounded-lg border border-input bg-background px-1.5 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          wide ? 'w-16' : 'w-14',
        )}
      />
    </label>
  )
}

export function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#111111'
  return (
    <input
      type="color"
      aria-label={label}
      title={label}
      className="size-9 cursor-pointer rounded-lg border border-input bg-background p-1"
      value={hex}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function OpacityControl({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <label className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
      Opacity
      <input
        type="range"
        aria-label="Opacity"
        min={5}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-20 accent-primary"
      />
    </label>
  )
}
