import type { ComponentProps, ReactNode } from 'react'
import {
  Field as ShadcnField,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <ShadcnField className={cn('gap-1', className)}>
      <FieldLabel className="text-xs text-muted-foreground">{label}</FieldLabel>
      {children}
    </ShadcnField>
  )
}

export function TextInput({ className, ...rest }: ComponentProps<typeof Input>) {
  return <Input className={cn('h-9', className)} {...rest} />
}

export function NumberInput({
  value,
  onChange,
  className,
  ...rest
}: {
  value: number
  onChange: (n: number) => void
} & Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'>) {
  return (
    <Input
      type="number"
      className={cn('h-9', className)}
      value={Math.round(value)}
      onChange={(e) => {
        const n = e.currentTarget.valueAsNumber
        if (Number.isFinite(n)) onChange(n)
      }}
      {...rest}
    />
  )
}

/** @deprecated Prefer Input / Select classNames — kept for a few native selects. */
export const inputClass =
  'h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none ' +
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50'
