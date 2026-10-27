import { ChevronDown, ZoomIn, ZoomOut } from 'lucide-react'
import { ZOOM_STEPS, useEditor, type Zoom } from '@/engine'
import { Button, ButtonGroup, IconButton } from '@/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const label = (z: Zoom) => (z === 'auto' ? 'Auto' : `${Math.round(z * 100)}%`)

export function ZoomControl() {
  const zoom = useEditor((s) => s.zoom)
  const setZoom = useEditor((s) => s.setZoom)
  const zoomIn = useEditor((s) => s.zoomIn)
  const zoomOut = useEditor((s) => s.zoomOut)

  const options: Zoom[] = ['auto', ...ZOOM_STEPS]

  return (
    <ButtonGroup aria-label="Zoom">
      <IconButton icon={ZoomOut} label="Zoom out" onClick={zoomOut} />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button className="w-[76px] justify-between px-3 font-normal" />}
        >
          {label(zoom)}
          <ChevronDown data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[132px]">
          <DropdownMenuGroup>
            {options.map((o) => (
              <DropdownMenuItem
                key={String(o)}
                onClick={() => setZoom(o)}
                className={o === zoom ? 'bg-accent text-accent-foreground' : undefined}
              >
                {label(o)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <IconButton icon={ZoomIn} label="Zoom in" onClick={zoomIn} />
    </ButtonGroup>
  )
}
