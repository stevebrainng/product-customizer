import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Button as ShadcnButton } from '@/components/ui/button'
import { ButtonGroup as ShadcnButtonGroup } from '@/components/ui/button-group'
import { cn } from '@/lib/utils'

type ButtonProps = ComponentProps<typeof ShadcnButton>

/** App button — thin wrapper around shadcn/ui Button (outline matches prior chrome). */
export function Button({
  variant = 'outline',
  size = 'lg',
  className,
  ...rest
}: ButtonProps) {
  return <ShadcnButton variant={variant} size={size} className={className} {...rest} />
}

export function IconButton({
  icon: Icon,
  label,
  className,
  size = 'icon-lg',
  variant = 'outline',
  ...rest
}: Omit<ButtonProps, 'children' | 'size'> & {
  icon: LucideIcon
  label: string
  size?: ButtonProps['size']
}) {
  return (
    <ShadcnButton
      variant={variant}
      size={size}
      aria-label={label}
      title={label}
      className={className}
      {...rest}
    >
      <Icon data-icon="inline-start" />
    </ShadcnButton>
  )
}

/** Joined controls sharing one outline (undo/redo, zoom). */
export function ButtonGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <ShadcnButtonGroup className={cn(className)}>{children}</ShadcnButtonGroup>
}
