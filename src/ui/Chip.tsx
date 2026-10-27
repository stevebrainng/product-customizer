import type { ComponentProps } from 'react'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'

type Props = Omit<ComponentProps<typeof Toggle>, 'pressed'> & { active?: boolean }

/** Filter / size chip — shadcn Toggle with pressed = active. */
export function Chip({ active, className, ...rest }: Props) {
  return (
    <Toggle
      pressed={active}
      variant="outline"
      size="sm"
      className={cn('min-w-10', className)}
      {...rest}
    />
  )
}
