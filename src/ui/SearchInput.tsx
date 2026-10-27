import type { ComponentProps } from 'react'
import { Search } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

/** Search field composed from shadcn InputGroup. */
export function SearchInput({
  className,
  placeholder = 'Search …',
  ...rest
}: ComponentProps<'input'>) {
  return (
    <InputGroup className={cn('h-10 bg-field', className)}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput type="search" placeholder={placeholder} {...rest} />
    </InputGroup>
  )
}
