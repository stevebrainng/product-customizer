import { useDesigner } from '@/providers/DesignerProvider'
import { TOOLS, type ToolDef } from '@/config/tools'
import { cn } from '@/lib/cn'

function RailButton({ tool }: { tool: ToolDef }) {
  const active = useDesigner((s) => s.activeTool === tool.id)
  const toggle = useDesigner((s) => s.toggleTool)
  const Icon = tool.icon
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => toggle(tool.id)}
      className={cn(
        'flex h-[58px] w-[64px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border text-[11px] transition-colors',
        'focus-visible:border-accent-line focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25',
        active
          ? 'border-line bg-surface shadow-sm'
          : 'border-transparent hover:bg-black/[0.04]',
      )}
    >
      <Icon size={21} strokeWidth={2} />
      <span>{tool.label}</span>
    </button>
  )
}

export function ToolRail() {
  const group = (placement: ToolDef['placement']) =>
    TOOLS.filter((t) => t.placement === placement).map((t) => (
      <li key={t.id}>
        <RailButton tool={t} />
      </li>
    ))

  return (
    <nav
      aria-label="Design tools"
      className={cn(
        'flex shrink-0 border-line bg-canvas',
        'max-md:order-last max-md:w-full max-md:overflow-x-auto max-md:border-t max-md:px-1 max-md:py-1',
        'md:w-[76px] md:flex-col md:justify-between md:border-r md:py-2',
      )}
    >
      <ul className="flex shrink-0 flex-row items-center gap-1 md:flex-col">{group('top')}</ul>
      <ul className="flex shrink-0 flex-row items-center gap-1 md:flex-col">{group('bottom')}</ul>
    </nav>
  )
}
