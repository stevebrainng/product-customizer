import { Box, Image as ImageIcon, Type, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCustomizer } from './CustomizerProvider'
import type { CustomizerPanelId } from './types'

const ITEMS: { id: CustomizerPanelId; label: string; icon: LucideIcon }[] = [
  { id: 'product', label: 'Product', icon: Box },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'text', label: 'Text', icon: Type },
]

export function CustomizerRail() {
  const active = useCustomizer((s) => s.activePanel)
  const toggle = useCustomizer((s) => s.togglePanel)

  return (
    <nav
      aria-label="Customizer tools"
      className={cn(
        'flex shrink-0 bg-zinc-950 text-zinc-100',
        'max-md:order-last max-md:w-full max-md:overflow-x-auto max-md:border-t max-md:border-zinc-800 max-md:px-1 max-md:py-1',
        'md:w-[76px] md:flex-col md:border-r md:border-zinc-800 md:py-2',
      )}
    >
      <ul className="flex shrink-0 flex-row items-center gap-1 md:flex-col">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => toggle(item.id)}
                className={cn(
                  'flex h-[58px] w-[64px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl text-[11px] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/30',
                  isActive ? 'bg-white text-zinc-950' : 'text-zinc-300 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon size={21} strokeWidth={2} />
                <span className="uppercase tracking-wide">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
