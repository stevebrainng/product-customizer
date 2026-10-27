import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

interface Option<T extends string> {
  value: T
  label: string
}

/** Exclusive option control — shadcn ToggleGroup instead of hand-rolled radios. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  label,
}: {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  label: string
}) {
  return (
    <ToggleGroup
      aria-label={label}
      variant="outline"
      spacing={0}
      size="lg"
      value={[value]}
      onValueChange={(next) => {
        const selected = next[0] as T | undefined
        if (selected) onChange(selected)
      }}
      className={cn('bg-surface shadow-sm', className)}
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} className="px-4">
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
