import { Download, PanelRight, Redo2, Undo2 } from 'lucide-react'
import {
  selectCanExport, selectCanRedo, selectCanUndo, selectHasProduct, selectProduct, useEditor, useEditorRuntime,
} from '@/engine'
import { useDesigner } from '@/providers/DesignerProvider'
import { Button, ButtonGroup, IconButton } from '@/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ZoomControl } from './ZoomControl'

function fileBase(name: string, side: string) {
  return `${name}-${side}`.trim().toLowerCase().replace(/[^\w.-]+/g, '-')
}

function ExportMenu() {
  const runtime = useEditorRuntime()
  const hasProduct = useEditor(selectHasProduct)
  const canExport = useEditor(selectCanExport)
  const product = useEditor(selectProduct)
  const side = useEditor((s) => s.activeSide)
  const base = fileBase(product?.name ?? 'design', side)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="px-3 font-normal"
            disabled={!hasProduct}
            title={hasProduct ? undefined : 'Upload a product before exporting'}
          />
        }
      >
        <Download data-icon="inline-start" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuGroup>
          {!canExport && (
            <p className="px-1.5 py-1.5 text-xs text-muted-foreground whitespace-normal">
              Add a design to this side before exporting.
            </p>
          )}
          <DropdownMenuItem disabled={!canExport} onClick={() => runtime.downloadImage(`${base}.png`, 'image/png')}>
            PNG · 300 DPI
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canExport} onClick={() => runtime.downloadImage(`${base}.jpg`, 'image/jpeg')}>
            JPEG · 300 DPI
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canExport} onClick={() => { void runtime.downloadPdf(`${base}.pdf`) }}>
            PDF · 12 in, 300 DPI
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TopBar() {
  const canUndo = useEditor(selectCanUndo)
  const canRedo = useEditor(selectCanRedo)
  const undo = useEditor((s) => s.undo)
  const redo = useEditor((s) => s.redo)
  const rightOpen = useDesigner((s) => s.rightPanelOpen)
  const toggleRight = useDesigner((s) => s.toggleRightPanel)

  return (
    <header className="flex h-[50px] shrink-0 items-center justify-between border-b border-border px-2">
      <ButtonGroup aria-label="History">
        <Button onClick={undo} disabled={!canUndo} className="px-3 font-normal">
          <Undo2 data-icon="inline-start" />
          Undo
        </Button>
        <IconButton icon={Redo2} label="Redo" onClick={redo} disabled={!canRedo} />
      </ButtonGroup>
      <div className="flex items-center gap-2">
        <ExportMenu />
        <ZoomControl />
        <IconButton
          icon={PanelRight}
          label="Product settings"
          aria-pressed={rightOpen}
          onClick={toggleRight}
          variant={rightOpen ? 'secondary' : 'outline'}
        />
      </div>
    </header>
  )
}
